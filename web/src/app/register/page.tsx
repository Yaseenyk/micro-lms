import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/features/auth/ui/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Container className="py-6 sm:py-12">
      <AuthShell mode="register">
        <AuthForm mode="register" />
      </AuthShell>
    </Container>
  );
}
