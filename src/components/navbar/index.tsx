"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  IoClose,
  IoMenu,
  IoSearch,
  IoLogOut,
  IoPersonCircle,
  IoChevronDown,
  IoGridOutline,
} from "react-icons/io5";
import { useSession, signOut } from "next-auth/react";

type NavbarProps = {
  brand?: string;
};

export default function Navbar({ brand = "evora" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");

  const isEventsPage = pathname.startsWith("/events");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Map role dari backend (UPPERCASE) ke format yang diharapkan (lowercase)
  const getUserRole = (): "admin" | "organizer" | "customer" | "guest" => {
    if (!session?.user?.role) return "guest";

    const backendRole = session.user.role.toUpperCase();

    switch (backendRole) {
      case "ADMIN":
        return "admin";
      case "ORGANIZER":
        return "organizer";
      case "CUSTOMER":
        return "customer";
      default:
        return "guest";
    }
  };

  const role = getUserRole();

  const common = useMemo(
    () => [
      { label: "Explore", href: "/" },
      { label: "Events", href: "/events" },
    ],
    [],
  );

  const guest = useMemo(
    () => [
      { label: "Login", href: "/auth/login" },
      { label: "Register", href: "/auth/register" },
    ],
    [],
  );

  const customer = useMemo(
    () => [
      { label: "Dashboard", href: "/me/dashboard" },
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
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // Get profile link based on role
  const getProfileLink = () => {
    switch (role) {
      case "admin":
        return "/adm/profile";
      case "organizer":
        return "/org/profile";
      case "customer":
        return "/me/profile";
      default:
        return "/auth/login";
    }
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    switch (role) {
      case "admin":
        return "/adm/dashboard";
      case "organizer":
        return "/org/dashboard";
      case "customer":
        return "/me/dashboard";
      default:
        return "/";
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;

    const trimmed = q.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const qs = params.toString();
    router.push(`/events${qs ? `?${qs}` : ""}`);

    if (open) {
      setOpen(false);
    }
  };

  return (
    <header className="bg-secondary sticky top-0 z-50 w-full shadow-lg">
      <nav className="mx-auto flex h-14 items-center justify-between gap-4 px-3 md:h-16 md:px-4">
        {/* Left */}
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4">
          {!isEventsPage && (
            <div className="hidden min-w-md flex-1 items-center xl:flex">
              <div className="relative w-full">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search events..."
                  className="bg-tertiary w-full rounded-full py-2 pr-12 pl-4 outline-none"
                />
                <div className="text-md bg-secondary text-muted pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2">
                  <IoSearch className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}

          {/* User Info & Logout (jika sudah login) */}
          {status === "authenticated" && session?.user && (
            <div className="relative hidden items-center gap-3 xl:flex">
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-tertiary hover:bg-tertiary/80 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition"
                >
                  <IoPersonCircle className="text-muted h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-muted text-sm font-medium">
                      {session.user.firstname} {session.user.lastname}
                    </span>
                    <span className="text-muted/60 text-xs">
                      {session.user.email}
                    </span>
                  </div>
                  <IoChevronDown
                    className={`text-muted h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="bg-tertiary border-secondary absolute top-full right-0 z-100 mt-2 w-56 overflow-hidden rounded-lg border shadow-2xl">
                    <div className="border-secondary border-b p-3">
                      <p className="text-clear text-sm font-semibold">
                        {session.user.firstname} {session.user.lastname}
                      </p>
                      <p className="text-muted/60 text-xs">
                        {session.user.email}
                      </p>
                      <p className="text-accent1-primary mt-1 text-xs font-medium capitalize">
                        {session.user.role}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="text-muted hover:bg-secondary flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition"
                      >
                        <IoGridOutline className="h-5 w-5" />
                        Dashboard
                      </Link>

                      <Link
                        href={getProfileLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="text-muted hover:bg-secondary flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition"
                      >
                        <IoPersonCircle className="h-5 w-5" />
                        View Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="hover:bg-secondary flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-red-500 transition"
                      >
                        <IoLogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right links (desktop) - hanya tampil jika belum login */}
          {status !== "authenticated" && (
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
          )}

          {/* Mobile Menu Toggle */}
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

      {/* Mobile Panel */}
      <div className={`xl:hidden ${open ? "block" : "hidden"}`}>
        <div className="px-3 py-3 md:px-4">
          {!isEventsPage && (
            <div className="relative xl:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search events..."
                className="bg-tertiary w-full rounded-full py-2 pr-12 pl-4 outline-none"
              />
              <div className="text-md bg-secondary text-muted pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2">
                <IoSearch className="h-5 w-5" />
              </div>
            </div>
          )}

          {/* User Info (Mobile) */}
          {status === "authenticated" && session?.user && (
            <div className="bg-tertiary mt-4 rounded-lg p-3">
              <div className="mb-3 flex items-center gap-2">
                <IoPersonCircle className="text-muted h-6 w-6" />
                <div className="flex flex-1 flex-col">
                  <span className="text-muted text-sm font-medium">
                    {session.user.firstname} {session.user.lastname}
                  </span>
                  <span className="text-muted/60 text-xs">
                    {session.user.email}
                  </span>
                  <span className="text-accent1-primary mt-1 text-xs font-medium capitalize">
                    {session.user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setOpen(false)}
                  className="bg-secondary text-muted hover:bg-secondary/80 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
                >
                  <IoGridOutline className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  href={getProfileLink()}
                  onClick={() => setOpen(false)}
                  className="bg-secondary text-muted hover:bg-secondary/80 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
                >
                  <IoPersonCircle className="h-4 w-4" />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <IoLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Common Links (Mobile) */}
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

          {/* Right Links (Mobile) */}
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
