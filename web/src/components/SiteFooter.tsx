import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-900">
      <Container className="flex flex-col items-center justify-between gap-3 py-8 text-xs text-zinc-500 sm:flex-row">
        <span>
          Micro<span className="text-cyan">LMS</span> — a Trinity Architecture demo.
        </span>
        <span>Decoupled static frontend · hardened API · verified payments.</span>
      </Container>
    </footer>
  );
}
