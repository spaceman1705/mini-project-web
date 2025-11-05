"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

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
      { label: "Events", href: "/org/events" },
      { label: "Transactions", href: "/org/transactions" },
      { label: "Profile", href: "/org/profile" },
    ],
    [],
  );

  const adminRight = useMemo(
    () => [
      { label: "Dashboard", href: "/adm/dashboard" },
      { label: "Events", href: "/adm/events" },
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
    <header className="sticky top-0 w-full bg-gray-100 shadow-sm shadow-black/15 dark:bg-gray-900">
      {/* Brand */}
      <nav className="mx-auto flex h-14 items-center gap-4 px-3 md:h-16 md:px-4">
        <Link
          href="/"
          className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
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

        {/* Search */}
        <div className="ml-auto hidden max-w-sm min-w-sm flex-1 items-center sm:flex">
          <div className="relative w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-lg bg-white px-3 py-2 inset-shadow-sm inset-shadow-black/15 outline-none dark:bg-gray-800"
            />
            <div className="text-md pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-gray-100 px-2 py-1 text-gray-700 shadow-sm shadow-black/15 dark:bg-gray-900 dark:text-gray-300">
              <FaMagnifyingGlass />
            </div>
          </div>
        </div>

        {/* Right links (desktop) */}
        <ul className="ml-2 hidden items-center gap-2 sm:flex">
          {rightLinks.map((l, i) => (
            <li key={i}>
              <NavLink href={l.href} active={isActive(l.href)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
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
        "rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-gray-100",
        active
          ? "bg-white shadow-sm shadow-black/15 dark:bg-gray-800 dark:shadow-white/10"
          : "hover:bg-white hover:shadow-sm hover:shadow-black/15 dark:hover:bg-gray-800 hover:dark:shadow-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
