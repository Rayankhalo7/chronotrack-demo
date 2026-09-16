"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DemoLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await signIn("demo", { callbackUrl: "/dashboard", redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Demo login unavailable. Run db:seed and ensure DEMO_LOGIN_ENABLED=true.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={loading}
        onClick={onClick}
      >
        {loading ? "Signing in…" : "Demo Login"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
