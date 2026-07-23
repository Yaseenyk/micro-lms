/**
 * AuthForm — Presentation (docs/01 §1.1). Register/login card, skinned to the
 * portfolio. Delegates every action to useAuth; holds only local input state.
 * On success it honours a ?next= return path, else routes to the dashboard.
 */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Alert, Button, Card, Field, Spinner } from "@/components/ui";
import { PasswordField } from "@/components/PasswordField";
import { GradientText } from "@/components/GradientText";

function nextPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  // only allow internal paths (no protocol-relative / absolute redirects)
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const { register, login, pending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok =
      mode === "register"
        ? await register({ email, password, name })
        : await login({ email, password });
    if (ok) router.replace(nextPath());
  }

  const isRegister = mode === "register";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto w-full max-w-md"
    >
      <Card>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {isRegister ? (
            <>
              Create your <GradientText>account</GradientText>
            </>
          ) : (
            <>
              Welcome <GradientText>back</GradientText>
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {isRegister
            ? "Start learning in under a minute."
            : "Log in to pick up where you left off."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isRegister && (
            <Field
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Asha"
              autoComplete="name"
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
            autoComplete="email"
            required
          />
          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={8}
            {...(isRegister ? { hint: "Minimum 8 characters." } : {})}
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <>
                <Spinner /> Please wait…
              </>
            ) : isRegister ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center text-sm text-zinc-500">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-medium text-ice underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-cyan"
        >
          {isRegister ? "Log in" : "Create one"}
        </Link>
      </p>
    </motion.div>
  );
}
