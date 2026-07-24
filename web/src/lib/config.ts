/**
 * Client configuration (docs/01 §2.1). The static bundle may only ever hold
 * NEXT_PUBLIC_* *publishable* values — never a secret. These are read once here
 * so the rest of the app imports typed constants instead of touching
 * `process.env` in scattered places.
 *
 * Next inlines NEXT_PUBLIC_* at build time, so a missing value surfaces as an
 * empty string; we fail loud in the browser console rather than making silent
 * requests to `undefined`.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    // Not a thrown error (that would blank the whole static page); a loud
    // console signal for the operator, and requests will visibly 404.
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(`[config] missing ${name} — set it in .env.local / CI build env`);
    }
    return "";
  }
  return value;
}

export const config = {
  apiUrl: required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
} as const;
