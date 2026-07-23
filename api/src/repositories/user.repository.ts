/**
 * User repository (Data layer — docs/01 §1). The only place `UserModel` is
 * queried. Returns domain objects via `userAdapter`; `pwdHash` is exposed ONLY
 * to the auth service's credential check and never serialized to a response.
 */
import { UserModel } from "../models/user.model.js";
import { userAdapter } from "../adapters/user.adapter.js";
import type { UserDomain } from "../domain/types.js";
import { nowUnix } from "../lib/time.js";

export const userRepository = {
  async create(input: { email: string; pwdHash: string; name: string }): Promise<UserDomain> {
    const now = nowUnix();
    const doc = await UserModel.create({
      email: input.email,
      pwdHash: input.pwdHash,
      name: input.name,
      role: "student",
      entitlements: [],
      refreshTokenHash: null,
      sv: 1,
      createdAt: now,
      updatedAt: now,
    });
    return userAdapter.toDomain(doc);
  },

  async findById(id: string): Promise<UserDomain | null> {
    const doc = await UserModel.findById(id);
    return doc ? userAdapter.toDomain(doc) : null;
  },

  async findByEmail(email: string): Promise<UserDomain | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    return doc ? userAdapter.toDomain(doc) : null;
  },

  /** For login only: returns the domain user plus its password hash for comparison. */
  async findAuthByEmail(email: string): Promise<{ user: UserDomain; pwdHash: string } | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    return doc ? { user: userAdapter.toDomain(doc), pwdHash: doc.pwdHash } : null;
  },

  async setRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { refreshTokenHash: hash, updatedAt: nowUnix() } });
  },

  async findByValidRefreshHash(userId: string, hash: string): Promise<UserDomain | null> {
    const doc = await UserModel.findOne({ _id: userId, refreshTokenHash: hash });
    return doc ? userAdapter.toDomain(doc) : null;
  },

  async addEntitlement(userId: string, courseId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { entitlements: courseId }, $set: { updatedAt: nowUnix() } },
    );
  },
};
