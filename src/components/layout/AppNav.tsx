"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/entries", label: "Entries" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto text-sm">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "whitespace-nowrap rounded-lg bg-accentSoft px-3 py-1.5 font-medium text-accent"
                : "whitespace-nowrap rounded-lg px-3 py-1.5 text-muted hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
