import { Container } from "./ui";
import { PithMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-900">
      <Container className="flex flex-col items-center justify-between gap-3 py-8 text-xs text-zinc-500 sm:flex-row">
        <span className="inline-flex items-center gap-2">
          <PithMark className="h-4 w-4" />
          <span>
            <span className="font-semibold text-zinc-300">Pith</span> — get to the core of AI.
          </span>
        </span>
        <span>Decoupled static frontend · hardened API · verified payments.</span>
      </Container>
    </footer>
  );
}
