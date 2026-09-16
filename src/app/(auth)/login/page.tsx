"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { DemoLoginButton } from "@/components/auth/DemoLoginButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@chronotrack.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <Link href="/" className="text-sm font-semibold text-blue-600">
          ChronoTrack
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Seed user + Demo Login. No public registration in MVP.
        </p>
      </div>
      <Card className="space-y-6">
        <DemoLoginButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">or credentials</span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
        <p className="text-xs text-slate-500">
          Demo credentials are listed in the project README.
        </p>
      </Card>
    </main>
  );
}
