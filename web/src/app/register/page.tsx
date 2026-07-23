import { Container } from "@/components/ui";
import { AuthForm } from "@/features/auth/ui/AuthForm";

export default function RegisterPage() {
  return (
    <Container>
      <AuthForm mode="register" />
    </Container>
  );
}
