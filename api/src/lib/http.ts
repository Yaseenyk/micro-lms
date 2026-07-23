/**
 * Response envelope helpers (docs/04 §0). Presentation (route handlers) use
 * these so every success response has the exact `{ ok: true, data }` shape.
 */
import type { Response } from "express";

export function sendOk<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ ok: true, data });
}
