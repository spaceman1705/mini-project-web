"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type Role = "guest" | "customer" | "organizer" | "admin";

type NavbarProps = {
  role?: Role;
  brand?: string;
};

export default function NavbarDummy({
  role = "guest",
  brand = "Eventeer",
}: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const commonLeft = useMemo(
    () => [
      { href: "/", label: "Explore" },
      { href: "/events", label: "Events" },
    ],
    [],
  );

  const guestRight = useMemo(
    () => [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Sign up", highlight: true },
    ],
    [],
  );

  const customerRight = useMemo(
    () => [
      { href: "/me/tickets", label: "My Tickets" },
      { href: "/me/transactions", label: "Transactions" },
      { href: "/me/profile", label: "Profile" },
    ],
    [],
  );

  const organizerRight = useMemo(
    () => [
      { href: "/org/dashboard", label: "Dashboard" },
      { href: "/org/events", label: "My Events" },
      { href: "/org/transactions", label: "Transactions" },
      { href: "/org/profile", label: "Profile" },
    ],
    [],
  );

  const adminRight = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Admin Dashboard" },
      { href: "/admin/events", label: "Manage Events" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/settings", label: "Settings" },
    ],
    [],
  );

  const rightLinks =
    role === "guest"
      ? guestRight
      : role === "customer"
        ? customerRight
        : role === "organizer"
          ? organizerRight
          : adminRight;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return !!pathname && pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-black/40">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:h-16 sm:px-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-black"
        >
          <LogoMark />
          <span className="font-semibold tracking-tight">{brand}</span>
        </Link>

        {/* Left links (desktop) */}
        <ul className="ml-2 hidden items-center gap-1 sm:flex">
          {commonLeft.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} active={isActive(l.href)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search (UI only) */}
        <div className="ml-auto hidden max-w-sm min-w-[220px] flex-1 items-center sm:flex">
          <div className="relative w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events…"
              className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm ring-0 outline-none placeholder:text-black/40 focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:placeholder:text-white/40 dark:focus:ring-white/10"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 text-[10px] text-black/60 dark:text-white/60">
              /
            </kbd>
          </div>
        </div>

        {/* Right links (desktop) */}
        <ul className="hidden items-center gap-1 xl:flex">
          {rightLinks.map((l) => (
            <li key={l.href}>
              <NavLink
                href={l.href}
                active={isActive(l.href)}
                highlight={l.highlight}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggles */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-black/10 ring-inset hover:bg-black/5 xl:hidden dark:ring-white/10 dark:hover:bg-white/10"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? (
            <span className="tabular-nums">✕</span>
          ) : (
            <span className="tabular-nums">☰</span>
          )}
        </button>
      </nav>

      {/* Mobile panel */}
      <div className={`xl:hidden ${open ? "block" : "hidden"}`}>
        <div className="border-t border-black/5 px-3 py-2 dark:border-white/10">
          <div className="relative sm:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events…"
              className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm ring-0 outline-none placeholder:text-black/40 focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:placeholder:text-white/40 dark:focus:ring-white/10"
            />
          </div>
        </div>
        <div className="grid gap-1 border-t border-black/5 p-2 dark:border-white/10">
          {commonLeft.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={mobileItem(isActive(l.href))}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
          {rightLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={mobileItem(isActive(l.href), l.highlight)}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
  highlight,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-black/5 text-black dark:bg-white/15 dark:text-white"
          : "text-black/70 hover:bg-black/5 hover:text-black dark:text-white/80 dark:hover:bg-white/10",
        highlight ? "ring-1 ring-black/10 ring-inset dark:ring-white/10" : "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function mobileItem(active?: boolean, highlight?: boolean) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium",
    active
      ? "bg-black/5 text-black dark:bg-white/15 dark:text-white"
      : "text-black/80 hover:bg-black/5 hover:text-black dark:text-white/85 dark:hover:bg-white/10",
    highlight ? "ring-1 ring-inset ring-black/10 dark:ring-white/10" : "",
  ].join(" ");
}

function LogoMark() {
  return (
    <div className="grid size-6 place-items-center rounded-[12px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
      <span className="text-[10px] leading-none font-black">EV</span>
    </div>
  );
}
