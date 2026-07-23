/** `users` collection (docs/03 §1). Numeric timestamps are set by the
 *  repository (docs/02: adapters/models carry no clock). */
import { Schema, model, type Types } from "mongoose";

export interface UserDoc {
  _id: Types.ObjectId;
  email: string;
  pwdHash: string;
  name: string;
  role: "student" | "admin";
  entitlements: string[];
  refreshTokenHash: string | null;
  sv: number;
  createdAt: number;
  updatedAt: number;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    pwdHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    entitlements: { type: [String], default: [] },
    refreshTokenHash: { type: String, default: null },
    sv: { type: Number, default: 1 },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { versionKey: false },
);

userSchema.index({ entitlements: 1 });

export const UserModel = model<UserDoc>("User", userSchema, "users");
