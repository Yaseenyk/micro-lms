import { Container } from "./ui";
import { PulseDot } from "./PulseDot";

/** Centered splash used while the session bootstraps or a guard resolves. */
export function PageSplash({ label = "Loading…" }: { label?: string }) {
  return (
    <Container className="py-24">
      <div className="flex items-center justify-center gap-3 text-sm text-zinc-500">
        <PulseDot color="bg-cyan" />
        {label}
      </div>
    </Container>
  );
}
