/**
 * Auth service (Logic layer — docs/01, docs/04 §2-5). Owns registration,
 * credential verification, and token issuance/rotation. The refresh token is
 * opaque and carried as `<userId>.<secret>`; only the secret's hash is stored
 * (docs/03 §1), so a stolen DB can't mint sessions.
 */
import type { PublicUser, UserDomain } from "../domain/types.js";
import { userRepository } from "../repositories/user.repository.js";
import { userAdapter } from "../adapters/user.adapter.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from "../lib/jwt.js";
import { AppError } from "../lib/app-error.js";

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string; // full cookie value: `<userId>.<secret>`
}

async function issueTokens(user: UserDomain): Promise<AuthResult> {
  const accessToken = signAccessToken(user.id, user.role);
  const { token, hash } = generateRefreshToken();
  await userRepository.setRefreshTokenHash(user.id, hash); // rotation: overwrites prior
  return { user: userAdapter.toPublic(user), accessToken, refreshToken: `${user.id}.${token}` };
}

export const authService = {
  async register(input: { email: string; password: string; name: string }): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError("CONFLICT", "Email already registered");
    const pwdHash = await hashPassword(input.password);
    const user = await userRepository.create({ email: input.email, pwdHash, name: input.name });
    return issueTokens(user);
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const found = await userRepository.findAuthByEmail(input.email);
    // Generic failure — never reveal whether the email exists (docs/04 §3).
    if (!found || !(await verifyPassword(input.password, found.pwdHash))) {
      throw new AppError("UNAUTHENTICATED", "Invalid email or password");
    }
    return issueTokens(found.user);
  },

  async refresh(refreshCookie: string | undefined): Promise<AuthResult> {
    if (!refreshCookie) throw new AppError("INVALID_TOKEN", "Missing refresh token");
    const dot = refreshCookie.indexOf(".");
    if (dot < 0) throw new AppError("INVALID_TOKEN", "Malformed refresh token");
    const userId = refreshCookie.slice(0, dot);
    const secret = refreshCookie.slice(dot + 1);
    const user = await userRepository.findByValidRefreshHash(userId, hashRefreshToken(secret));
    if (!user) throw new AppError("INVALID_TOKEN", "Invalid or rotated refresh token");
    return issueTokens(user); // rotate on every use
  },

  async logout(userId: string): Promise<void> {
    await userRepository.setRefreshTokenHash(userId, null);
  },
};
