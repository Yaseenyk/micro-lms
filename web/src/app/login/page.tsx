import { Container } from "@/components/ui";
import { AuthForm } from "@/features/auth/ui/AuthForm";

export default function LoginPage() {
  return (
    <Container>
      <AuthForm mode="login" />
    </Container>
  );
}
