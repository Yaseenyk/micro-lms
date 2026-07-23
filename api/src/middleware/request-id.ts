/**
 * Assigns a correlation id to every request (docs/01 §2.4, docs/04 §1). The id
 * is surfaced in the error envelope and every log line, so a client-facing
 * error can be traced to its logs without leaking sensitive data.
 */
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  req.id = incoming && incoming.length <= 64 ? incoming : `req_${randomUUID()}`;
  res.setHeader("x-request-id", req.id);
  next();
}
