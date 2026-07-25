/**
 * Test-only HTTP helpers (not a *.test.ts, so it isn't collected as a suite).
 * A minimal Response stand-in the api-client can read (.status / .ok / .json),
 * plus a fresh mocked global.fetch per test.
 */
import { vi } from "vitest";

export function jsonRes(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

/** A response whose body isn't JSON — the malformed-envelope case. */
export function badRes(status: number): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => {
      throw new Error("not json");
    },
  } as unknown as Response;
}

/** Install a fresh mocked global.fetch and return the mock for per-test setup. */
export function mockFetch() {
  const fn = vi.fn();
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}
