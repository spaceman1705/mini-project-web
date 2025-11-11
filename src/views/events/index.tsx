"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  PiMapPin,
  PiClock,
  PiTag,
  PiCalendarHeart,
  PiChats,
  PiDiscoBall,
  PiGameController,
  PiMaskHappy,
  PiMicrophoneStage,
  PiPresentationChart,
} from "react-icons/pi";
import { IoFastFoodOutline, IoSearch } from "react-icons/io5";

// =============================
// Types
// =============================
export type EventCategory =
  | "Music"
  | "Nightlife"
  | "Art"
  | "Holiday"
  | "Dating"
  | "Hobby"
  | "Business"
  | "Food & Drink";

type Tag = "Online" | "Family" | "Limited";

type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  date: string;
  price: number | null;
  tags?: Tag[];
  cover?: string;
};

type TimeFilter = "all" | "today" | "this-weekend" | "this-month" | "upcoming";

const EVENTS: EventItem[] = [
  {
    id: "1",
    title: "Sound of Jakarta — City Park Session",
    category: "Music",
    location: "Jakarta",
    date: new Date().toISOString(),
    price: null,
    tags: ["Family"],
  },
  {
    id: "2",
    title: "Midnight Neon — DJ Set",
    category: "Nightlife",
    location: "Jakarta",
    date: addDays(new Date(), 2).toISOString(),
    price: 150000,
    tags: ["Limited"],
  },
  {
    id: "3",
    title: "Watercolor for Beginners",
    category: "Art",
    location: "Bandung",
    date: addDays(new Date(), 5).toISOString(),
    price: 99000,
  },
  {
    id: "4",
    title: "Christmas Charity Run",
    category: "Holiday",
    location: "Jakarta",
    date: toMonthDay(new Date(), 12, 24).toISOString(),
    price: 50000,
    tags: ["Family"],
  },
  {
    id: "5",
    title: "Speed Networking Night",
    category: "Dating",
    location: "Jakarta",
    date: addDays(new Date(), 9).toISOString(),
    price: 75000,
  },
  {
    id: "6",
    title: "Indie Game Dev Meetup",
    category: "Hobby",
    location: "Online",
    date: addDays(new Date(), 1).toISOString(),
    price: null,
    tags: ["Online"],
  },
  {
    id: "7",
    title: "Pitch Like a Pro — Workshop",
    category: "Business",
    location: "Jakarta",
    date: addDays(new Date(), 15).toISOString(),
    price: 250000,
  },
  {
    id: "8",
    title: "Street Food Hunt: Kota Tua",
    category: "Food & Drink",
    location: "Jakarta",
    date: addDays(new Date(), 3).toISOString(),
    price: 30000,
  },
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toMonthDay(date: Date, month: number, day: number) {
  const d = new Date(date);
  d.setMonth(month - 1);
  d.setDate(day);
  d.setHours(9, 0, 0, 0);
  return d;
}

function isToday(d: Date) {
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function isThisMonth(d: Date) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

function isThisWeekend(d: Date) {
  const n = new Date();
  const day = n.getDay(); // 0 Sun .. 6 Sat
  const diffToSat = (6 - day + 7) % 7; // days to Saturday
  const sat = new Date(n);
  sat.setDate(n.getDate() + diffToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  sun.setHours(23, 59, 59, 999);
  return d >= sat && d <= sun;
}

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateHuman(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CATEGORY_ICONS: Record<EventCategory, ReactNode> = {
  Music: <PiMicrophoneStage className="shrink-0" />,
  Nightlife: <PiDiscoBall className="shrink-0" />,
  Art: <PiMaskHappy className="shrink-0" />,
  Holiday: <PiCalendarHeart className="shrink-0" />,
  Dating: <PiChats className="shrink-0" />,
  Hobby: <PiGameController className="shrink-0" />,
  Business: <PiPresentationChart className="shrink-0" />,
  "Food & Drink": <IoFastFoodOutline className="shrink-0" />,
};

export default function EventsView() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [location, setLocation] = useState<string | "All">("All");
  const [time, setTime] = useState<TimeFilter>("upcoming");
  const [freeOnly, setFreeOnly] = useState(false);
  const [tags, setTags] = useState<Record<Tag, boolean>>({
    Online: false,
    Family: false,
    Limited: false,
  });

  const locations = useMemo(() => {
    const set = new Set<string>(["Online"]);
    EVENTS.forEach((e) => set.add(e.location));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const matchQ = debouncedQ
        ? e.title.toLowerCase().includes(debouncedQ.toLowerCase())
        : true;

      const matchCat = category === "All" ? true : e.category === category;

      const matchLoc = location === "All" ? true : e.location === location;

      const d = new Date(e.date);
      const now = new Date();
      let matchTime = true;
      if (time === "today") matchTime = isToday(d);
      if (time === "this-weekend") matchTime = isThisWeekend(d);
      if (time === "this-month") matchTime = isThisMonth(d);
      if (time === "upcoming") matchTime = d >= now;

      const matchFree = freeOnly ? e.price === null : true;

      const activeTags = (Object.keys(tags) as Tag[]).filter((t) => tags[t]);
      const matchTags =
        activeTags.length === 0 ||
        activeTags.every((t) => (e.tags ?? []).includes(t));

      return (
        matchQ && matchCat && matchLoc && matchTime && matchFree && matchTags
      );
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [debouncedQ, category, location, time, freeOnly, tags]);

  const resetFilters = () => {
    setCategory("All");
    setLocation("All");
    setTime("upcoming");
    setFreeOnly(false);
    setTags({ Online: false, Family: false, Limited: false });
    setQ("");
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Discover Events
        </h1>
        <p className="text-muted">
          Browse, filter, and find something to do near you.
        </p>
      </header>

      {/* Search Bar */}
      <div className="bg-tertiary border-lines mb-4 flex items-center gap-2 rounded-2xl border px-3 py-2">
        <IoSearch className="h-6 w-6" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events…"
          className="w-full bg-transparent py-2 outline-none"
        />
      </div>

      {/* Filters */}
      <section className="mb-6 space-y-4">
        {/* Category */}
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <div className="flex gap-2">
            {(
              [
                "All",
                "Music",
                "Nightlife",
                "Art",
                "Holiday",
                "Dating",
                "Hobby",
                "Business",
                "Food & Drink",
              ] as const
            ).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`border-lines rounded-full border px-3 py-1.5 text-sm transition ${
                  category === c
                    ? "bg-primary-invert text-clear-invert"
                    : "bg-tertiary hover:bg-lines"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {c !== "All" && CATEGORY_ICONS[c as EventCategory]}
                  {c}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Location */}
          <div className="bg-secondary border-lines rounded-xl border p-3">
            <label className="mb-1 block text-sm font-medium">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-tertiary border-lines w-full rounded-lg border px-3 py-2"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="bg-secondary border-lines rounded-xl border p-3">
            <label className="mb-1 block text-sm font-medium">When</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { k: "today", label: "Today" },
                  { k: "this-weekend", label: "This Weekend" },
                  { k: "this-month", label: "This Month" },
                  { k: "upcoming", label: "Upcoming" },
                  { k: "all", label: "All" },
                ] as { k: TimeFilter; label: string }[]
              ).map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTime(t.k)}
                  className={`border-lines rounded-lg border px-3 py-2 text-sm ${
                    time === t.k
                      ? "bg-primary-invert text-clear-invert"
                      : "bg-tertiary hover:bg-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="bg-secondary border-lines rounded-xl border p-3">
            <label className="mb-1 block text-sm font-medium">Price</label>
            <div className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />
              Show free only
            </div>
          </div>

          {/* Tags */}
          <div className="bg-secondary border-lines rounded-xl border p-3">
            <label className="mb-1 block text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(tags) as Tag[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTags({ ...tags, [t]: !tags[t] })}
                  className={`border-lines rounded-full border px-3 py-1.5 text-sm ${
                    tags[t]
                      ? "bg-primary-invert text-clear-invert"
                      : "bg-tertiary hover:bg-primary"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <PiTag />
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            Showing <b>{filtered.length}</b> of {EVENTS.length}
          </p>
          <button
            onClick={resetFilters}
            className="border-lines hover:bg-primary-invert hover:text-clear-invert rounded-lg border px-3 py-1.5 text-sm"
          >
            Reset filters
          </button>
        </div>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="border-lines rounded-2xl border border-dashed p-10 text-center">
          <p className="text-lg font-medium">No events match your filters</p>
          <p className="text-muted text-sm">
            Try removing some filters or searching with different keywords.
          </p>
        </div>
      ) : (
        <ul className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <li key={e.id}>
              <article className="group border-lines bg-secondary flex h-full flex-col overflow-hidden rounded-2xl border transition hover:shadow-md">
                <div className="bg-tertiary relative h-36 w-full">
                  <div className="text-muted absolute inset-0 flex items-center justify-center text-5xl">
                    {CATEGORY_ICONS[e.category]}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base leading-snug font-semibold">
                      <Link
                        href={`/events/${e.id}`}
                        className="hover:underline"
                      >
                        {e.title}
                      </Link>
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        e.price === null
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {e.price === null ? "Free" : formatIDR(e.price)}
                    </span>
                  </div>

                  <div className="text-muted space-y-1 text-sm">
                    <p className="flex items-center gap-1.5">
                      <PiClock />
                      {formatDateHuman(e.date)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <PiMapPin />
                      {e.location}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    {e.tags && e.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {e.tags.map((t) => (
                          <span
                            key={t}
                            className="border-lines text-muted rounded-full border px-2 py-0.5 text-xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-end">
                    <Link
                      href={`/events/${e.id}`}
                      className="bg-primary text-clear inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition hover:opacity-95"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
