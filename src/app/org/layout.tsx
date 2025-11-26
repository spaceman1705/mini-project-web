"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiGauge, PiCalendarBlank, PiTicket, PiGearSix } from "react-icons/pi";

type OrgLayoutProps = {
  children: ReactNode;
};

type OrgNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
};

const orgNavItems: OrgNavItem[] = [
  {
    href: "/org/dashboard",
    label: "Overview",
    icon: <PiGauge className="h-4 w-4" />,
    description: "Organizer dashboard overview",
  },
  {
    href: "/org/events",
    label: "My Events",
    icon: <PiCalendarBlank className="h-4 w-4" />,
    description: "Manage all your events",
  },
  {
    href: "/org/transactions",
    label: "Tickets & Orders",
    icon: <PiTicket className="h-4 w-4" />,
    description: "Track sales & attendees",
  },
  {
    href: "/org/profile",
    label: "Profile",
    icon: <PiGearSix className="h-4 w-4" />,
    description: "Organizer profile",
  },
];

export default function OrgLayout({ children }: OrgLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/org") return pathname === "/org";
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="border-lines bg-secondary text-muted fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r px-3 py-6 pt-24 shadow-sm md:flex">
        {/* Brand / header */}
        <div className="mb-6 px-1">
          <p className="text-clear text-xs font-semibold tracking-widest uppercase">
            Organizer
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">Evora</h1>
          <p className="text-muted mt-1 text-xs">
            Manage events, tickets & performance.
          </p>
        </div>

        <nav className="space-y-1">
          {orgNavItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-start gap-3 rounded-xl px-3 py-2 text-sm transition ${active
                    ? "bg-primary-invert text-clear-invert shadow-sm"
                    : "text-muted hover:bg-tertiary hover:text-clear"
                  }`}
              >
                <div
                  className={`border-lines bg-tertiary mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-xs ${active ? "text-clear" : "text-muted"
                    }`}
                >
                  {item.icon}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  {item.description && (
                    <span className="text-muted-invert text-xs">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="border-lines bg-tertiary text-clear flex items-center justify-between border-b px-4 py-3 shadow-sm md:hidden">
        <div className="flex flex-col">
          <span className="text-muted text-[11px] font-semibold tracking-widest uppercase">
            Organizer
          </span>
          <span className="text-base font-semibold tracking-tight">Evora</span>
        </div>
        <nav className="bg-secondary flex items-center gap-1 rounded-full p-1 text-xs">
          {orgNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 font-medium transition ${isActive(item.href)
                  ? "bg-tertiary text-clear shadow-sm"
                  : "text-muted hover:text-clear"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <div className="md:ml-64">{children}</div>
    </>
  );
}
