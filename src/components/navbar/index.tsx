"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoClose, IoMenu } from "react-icons/io5";

export type Role = "admin" | "organizer" | "customer" | "guest";

type NavbarProps = {
  role?: Role;
  brand?: string;
};

export default function Navbar({
  role = "guest",
  brand = "evora",
}: NavbarProps) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const commonLeft = useMemo(
    () => [
      { label: "Explore", href: "/" },
      { label: "Events", href: "/events" },
    ],
    [],
  );

  const guestRight = useMemo(
    () => [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
    ],
    [],
  );

  const customerRight = useMemo(
    () => [
      { label: "Tickets", href: "/me/tickets" },
      { label: "Transactions", href: "/me/transactions" },
      { label: "Profile", href: "/me/profile" },
    ],
    [],
  );

  const organizerRight = useMemo(
    () => [
      { label: "Dashboard", href: "/org/dashboard" },
      { label: "My Events", href: "/org/events" },
      { label: "Transactions", href: "/org/transactions" },
      { label: "Profile", href: "/org/profile" },
    ],
    [],
  );

  const adminRight = useMemo(
    () => [
      { label: "Dashboard", href: "/adm/dashboard" },
      { label: "Manage Events", href: "/adm/events" },
      { label: "Users", href: "/adm/users" },
      { label: "Reports", href: "/adm/reports" },
      { label: "Settings", href: "/adm/settings" },
    ],
    [],
  );

  const rightLinks =
    role === "admin"
      ? adminRight
      : role === "organizer"
        ? organizerRight
        : role === "customer"
          ? customerRight
          : guestRight;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return !!pathname && pathname.startsWith(href);
  };

  return (
    <header className="bg-secondary sticky top-0 w-full">
      {/* Brand */}
      <nav className="mx-auto flex h-14 items-center justify-between gap-4 px-3 md:h-16 md:px-4">
        {/* Left */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="from-accent1-primary to-accent2-primary bg-linear-to-r/oklch bg-clip-text text-4xl font-semibold tracking-tight text-transparent"
          >
            {brand}
          </Link>

          {/* Left links (desktop) */}
          <ul className="ml-2 hidden items-center gap-2 sm:flex">
            {commonLeft.map((l, i) => (
              <li key={i}>
                <NavLink href={l.href} active={isActive(l.href)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div className="flex gap-4">
          {/* Search */}
          <div className="hidden min-w-md flex-1 items-center xl:flex">
            <div className="relative w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events..."
                className="bg-tertiary w-full rounded-lg px-3 py-2 outline-none"
              />
              <div className="text-md bg-secondary text-muted pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-2">
                <FaMagnifyingGlass />
              </div>
            </div>
          </div>

          {/* Right links (desktop) */}
          <ul className="ml-2 hidden items-center gap-2 xl:flex">
            {rightLinks.map((l, i) => (
              <li key={i}>
                <NavLink href={l.href} active={isActive(l.href)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Toggle menu */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="bg-tertiary text-muted rounded-lg p-2 text-2xl xl:hidden"
          >
            {open ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </nav>

      {/* Panel */}
      <div className={`xl:hidden ${open ? "block" : "hidden"}`}>
        <div className="px-3 py-2 md:px-4">
          {/* Search */}
          <div className="relative xl:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events..."
              className="bg-tertiary w-full rounded-lg px-3 py-2 text-lg outline-none"
            />
            <div className="bg-secondary text-muted pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-2 text-lg">
              <FaMagnifyingGlass />
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-2 sm:hidden">
            {commonLeft.map((l, i) => (
              <Link
                key={i}
                href={l.href}
                className={menuItem(isActive(l.href))}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="border-muted mt-2 grid gap-2 border-t">
            {rightLinks.map((l, i) => (
              <Link
                key={i}
                href={l.href}
                className={menuItem(isActive(l.href))}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "text-muted rounded-lg px-3 py-2 text-sm font-semibold transition duration-300",
        active
          ? "from-accent1-hover to-accent2-hover bg-linear-to-r/oklch"
          : "hover:from-accent1-hover hover:to-accent2-hover hover:bg-linear-to-r/oklch",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function menuItem(active?: boolean) {
  return [
    "w-full rounded-lg px-3 py-2 text-xl mt-2",
    active ? "bg-primary text-clear" : "text-muted",
  ].join(" ");
}
