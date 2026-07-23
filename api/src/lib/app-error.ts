/**
 * The canonical error model (docs/04 §1).
 *
 * Services and middleware throw `AppError` with a stable machine-readable code;
 * the error-handler middleware turns it into the standard error envelope. HTTP
 * status is derived from the code so call sites never hand-pick numbers.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "INVALID_TOKEN"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_ERROR"
  | "INTERNAL";

/** Canonical code → HTTP status (docs/04 §1). */
export const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  INVALID_TOKEN: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYMENT_ERROR: 402,
  INTERNAL: 500,
};

export interface ErrorDetail {
  path: string;
  issue: string;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message?: string, details?: ErrorDetail[]) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    if (details) this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}
