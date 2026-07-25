import { Container } from "./ui";

/**
 * Centered splash with an obvious spinner — used while the session bootstraps or
 * an API call resolves, so the screen never looks frozen. A rotating cyan ring
 * reads as "working" far better than a static dot; the label says what's happening.
 */
export function PageSplash({ label = "Loading…" }: { label?: string }) {
  return (
    <Container className="py-24">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center gap-4 text-sm text-zinc-400"
      >
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700/70 border-t-cyan" />
        <span>{label}</span>
      </div>
    </Container>
  );
}
