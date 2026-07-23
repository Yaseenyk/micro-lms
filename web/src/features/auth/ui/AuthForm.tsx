/**
 * AuthForm — Presentation (docs/01 §1.1). Renders the register/login form and
 * delegates every action to the useAuth hook. It holds only local input state;
 * it knows nothing about the API, tokens, or the store.
 */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Alert, Button, Card, Field } from "@/components/ui";

export function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const { register, login, pending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok =
      mode === "register" ? await register({ email, password, name }) : await login({ email, password });
    if (ok) router.push("/course/course_abc");
  }

  return (
    <Card>
      <h1 className="text-xl font-bold text-slate-100">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {mode === "register"
          ? "Start learning in under a minute."
          : "Log in to resume where you left off."}
      </p>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {mode === "register" && (
          <Field
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asha"
            required
            minLength={1}
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
