/**
 * Token helpers (docs/01 §2.2). Access tokens are short-lived signed JWTs
 * (HS256, issuer/audience pinned). Refresh tokens are opaque random strings;
 * only their SHA-256 hash is stored (docs/03 §1), enabling rotation/revocation.
 */
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JWT_AUDIENCE, JWT_ISSUER } from "../middleware/require-auth.js";

export type Role = "student" | "admin";

export function signAccessToken(userId: string, role: Role): string {
  // `as jwt.SignOptions` — JWT_EXPIRES_IN is a validated string (e.g. "15m");
  // asserting the literal keeps exactOptionalPropertyTypes happy.
  const options = {
    subject: userId,
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions;
  return jwt.sign({ role }, env.JWT_SECRET, options);
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString("base64url");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
