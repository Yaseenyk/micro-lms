/**
 * Request augmentation. `req.auth` is populated ONLY by the requireAuth
 * middleware (docs/01 §2.2); `req.id` is the per-request correlation id.
 */
import "express";

declare global {
  namespace Express {
    interface AuthContext {
      userId: string;
      role: "student" | "admin";
    }
    interface Request {
      id: string;
      auth?: AuthContext;
    }
  }
}

export {};
