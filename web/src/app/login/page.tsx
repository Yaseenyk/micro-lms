import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AuthForm } from "@/features/auth/ui/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Container className="py-6 sm:py-12">
      <AuthForm mode="login" />
    </Container>
  );
}
