/**
 * User adapters (docs/02, docs/03 §1). `toDomain` strips DB internals;
 * `toPublic` is the response adapter that guarantees no `pwdHash` /
 * `refreshTokenHash` ever leaves the Data layer.
 */
import type { PublicUser, UserDomain } from "../domain/types.js";
import type { UserDoc } from "../models/user.model.js";

export const userAdapter = {
  toDomain(doc: UserDoc): UserDomain {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role,
      entitlements: doc.entitlements,
    };
  },

  toPublic(user: UserDomain): PublicUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
};
