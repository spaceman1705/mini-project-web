"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { IoClose, IoMenu, IoSearch } from "react-icons/io5";

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

  const common = useMemo(
    () => [
      { label: "Explore", href: "/" },
      { label: "Events", href: "/events" },
    ],
    [],
  );

  const guest = useMemo(
    () => [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/auth/register" },
    ],
    [],
  );

  const customer = useMemo(
    () => [
      { label: "Tickets", href: "/me/tickets" },
      { label: "Transactions", href: "/me/transactions" },
      { label: "Profile", href: "/me/profile" },
    ],
    [],
  );

  const organizer = useMemo(
    () => [
      { label: "Dashboard", href: "/org/dashboard" },
      { label: "My Events", href: "/org/events" },
      { label: "Transactions", href: "/org/transactions" },
      { label: "Profile", href: "/org/profile" },
    ],
    [],
  );

  const admin = useMemo(
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
      ? admin
      : role === "organizer"
        ? organizer
        : role === "customer"
          ? customer
          : guest;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return !!pathname && pathname.startsWith(href);
  };

  return (
    <header className="bg-secondary sticky top-0 z-50 w-full">
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
            {common.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "text-muted rounded-lg px-3 py-2 text-sm font-semibold transition duration-300",
                    isActive(l.href)
                      ? "from-accent1-hover to-accent2-hover bg-linear-to-r/oklch"
                      : "hover:from-accent1-hover hover:to-accent2-hover hover:bg-linear-to-r/oklch",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
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
                className="bg-tertiary w-full rounded-full py-2 pr-12 pl-4 outline-none"
              />
              <div className="text-md bg-secondary text-muted pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2">
                <IoSearch className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Right links (desktop) */}
          <ul className="ml-2 hidden items-center gap-2 xl:flex">
            {rightLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "text-muted rounded-lg px-3 py-2 text-sm font-semibold transition duration-300",
                    isActive(l.href)
                      ? "from-accent1-hover to-accent2-hover bg-linear-to-r/oklch"
                      : "hover:from-accent1-hover hover:to-accent2-hover hover:bg-linear-to-r/oklch",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Toggle menu */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="bg-tertiary text-muted rounded-lg p-2 xl:hidden"
          >
            {open ? (
              <IoClose className="h-6 w-6" />
            ) : (
              <IoMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Panel */}
      <div className={`xl:hidden ${open ? "block" : "hidden"}`}>
        <div className="px-3 py-3 md:px-4">
          {/* Search */}
          <div className="relative xl:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events..."
              className="bg-tertiary w-full rounded-full py-2 pr-12 pl-4 outline-none"
            />
            <div className="text-md bg-secondary text-muted pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2">
              <IoSearch className="h-5 w-5" />
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-2 sm:hidden">
            {common.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "mt-2 w-full rounded-lg px-3 py-2 text-xl",
                  isActive(l.href) ? "bg-primary text-clear" : "text-muted",
                ].join(" ")}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-2 grid gap-2">
            {rightLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "mt-2 w-full rounded-lg px-3 py-2 text-xl",
                  isActive(l.href) ? "bg-primary text-clear" : "text-muted",
                ].join(" ")}
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
