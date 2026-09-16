"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign out
    </Button>
  );
}
