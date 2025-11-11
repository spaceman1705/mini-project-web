"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  PiMicrophoneStage,
  PiDiscoBall,
  PiMaskHappy,
  PiCalendarHeart,
  PiChats,
  PiGameController,
  PiPresentationChart,
  PiMapPin,
  PiClock,
} from "react-icons/pi";
import { IoFastFoodOutline } from "react-icons/io5";

export type EventCategory =
  | "Music"
  | "Nightlife"
  | "Art"
  | "Holiday"
  | "Dating"
  | "Hobby"
  | "Business"
  | "Food & Drink";

type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  date: string;
  price: number | null;
  tags?: ("Online" | "Family" | "Limited")[];
};

type TimeFilter = "all" | "today" | "this-weekend" | "this-month" | "upcoming";

const seed: EventItem[] = [
  {
    id: "e1",
    title: "Jakarta Indie Music Fest",
    category: "Music",
    location: "Jakarta",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1,
      19,
      30,
    ).toISOString(),
    price: 250000,
    tags: ["Limited"],
  },
  {
    id: "e2",
    title: "Afterwork Nightlife Meetup",
    category: "Nightlife",
    location: "Jakarta",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 2,
      21,
      0,
    ).toISOString(),
    price: null,
    tags: ["Family"],
  },
  {
    id: "e3",
    title: "Art & Sketching Jam",
    category: "Art",
    location: "Bandung",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 6,
      10,
      0,
    ).toISOString(),
    price: 50000,
  },
  {
    id: "e4",
    title: "Holiday Market Pop‑Up",
    category: "Holiday",
    location: "Bogor",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 25,
      9,
      0,
    ).toISOString(),
    price: null,
    tags: ["Family"],
  },
  {
    id: "e5",
    title: "Speed Dating — Coffee Edition",
    category: "Dating",
    location: "Jakarta",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 3,
      18,
      0,
    ).toISOString(),
    price: 150000,
  },
  {
    id: "e6",
    title: "Boardgames & Chill",
    category: "Hobby",
    location: "Depok",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 5,
      13,
      0,
    ).toISOString(),
    price: 30000,
    tags: ["Family"],
  },
  {
    id: "e7",
    title: "SMEs Business Breakfast",
    category: "Business",
    location: "Jakarta",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 12,
      8,
      0,
    ).toISOString(),
    price: 100000,
  },
  {
    id: "e8",
    title: "Street Food Night Crawl",
    category: "Food & Drink",
    location: "Tangerang",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 7,
      19,
      0,
    ).toISOString(),
    price: 80000,
  },
];

const CATEGORIES: { title: EventCategory; icon: ReactNode }[] = [
  { title: "Music", icon: <PiMicrophoneStage className="size-6" /> },
  { title: "Nightlife", icon: <PiDiscoBall className="size-6" /> },
  { title: "Art", icon: <PiMaskHappy className="size-6" /> },
  { title: "Holiday", icon: <PiCalendarHeart className="size-6" /> },
  { title: "Dating", icon: <PiChats className="size-6" /> },
  { title: "Hobby", icon: <PiGameController className="size-6" /> },
  { title: "Business", icon: <PiPresentationChart className="size-6" /> },
  { title: "Food & Drink", icon: <IoFastFoodOutline className="size-6" /> },
];

function isWithinRange(d: Date, kind: TimeFilter) {
  const now = new Date();
  const day = d.getDay();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  if (kind === "all") return true;
  if (kind === "today") return d >= startOfToday && d <= endOfToday;
  if (kind === "this-weekend") {
    return day === 6 || day === 0;
  }
  if (kind === "this-month") {
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }
  if (kind === "upcoming") return d > now;
  return true;
}

export default function LandingPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState<EventCategory | "All">(
    "All",
  );
  const [time, setTime] = useState<TimeFilter>("upcoming");
  const [onlyFree, setOnlyFree] = useState(false);

  const events = useMemo(() => {
    return seed
      .filter((e) =>
        activeCategory === "All" ? true : e.category === activeCategory,
      )
      .filter((e) =>
        keyword ? e.title.toLowerCase().includes(keyword.toLowerCase()) : true,
      )
      .filter((e) =>
        location
          ? e.location.toLowerCase().includes(location.toLowerCase())
          : true,
      )
      .filter((e) => isWithinRange(new Date(e.date), time))
      .filter((e) => (onlyFree ? e.price === null : true))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeCategory, keyword, location, time, onlyFree]);

  return (
    <div className="mx-auto mt-4 max-w-[1440px] px-4">
      {/* Hero */}
      <section className="bg-secondary relative isolate overflow-hidden rounded-3xl p-8 md:p-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold md:text-5xl">
              Find & Make Fun Events Near You
            </h1>
            <p className="text-muted mt-3 text-base md:text-lg">
              Explore concerts, workshops, and meetups. Filter by time,
              category, and location.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex flex-col gap-3 xl:flex-row">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Find events (e.g. Music)"
                  className="bg-tertiary border-lines h-12 rounded-xl border px-4 outline-none"
                />
                <div className="relative">
                  <PiMapPin className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (e.g. Jakarta)"
                    className="bg-tertiary border-lines h-12 w-full rounded-xl border pr-3 pl-8 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTime("today")}
                  className={`border-lines h-12 rounded-xl border px-4 text-sm font-medium ${time === "today" ? "from-accent1-hover to-accent2-hover text-muted bg-linear-to-r" : "bg-tertiary"}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTime("this-weekend")}
                  className={`border-lines h-12 rounded-xl border px-4 text-sm font-medium ${time === "this-weekend" ? "from-accent1-hover to-accent2-hover text-muted bg-linear-to-r" : "bg-tertiary"}`}
                >
                  Weekend
                </button>
                <button
                  onClick={() => setTime("this-month")}
                  className={`border-lines h-12 rounded-xl border px-4 text-sm font-medium ${time === "this-month" ? "from-accent1-hover to-accent2-hover text-muted bg-linear-to-r" : "bg-tertiary"}`}
                >
                  This Month
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyFree}
                  onChange={(e) => setOnlyFree(e.target.checked)}
                />
                Show only free events
              </label>
              <button
                onClick={() => {
                  setKeyword("");
                  setLocation("");
                  setActiveCategory("All");
                  setTime("upcoming");
                  setOnlyFree(false);
                }}
                className="text-sm underline"
              >
                Reset filter
              </button>
            </div>
          </div>

          <div className="bg-tertiary mx-auto mt-8 aspect-4/3 w-full max-w-xl rounded-2xl shadow-inner md:mx-0 md:mt-0" />
        </div>
      </section>

      {/* Category filter */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold md:text-2xl">Category</h2>
          <div className="flex items-center gap-2 text-sm">
            <PiClock />
            <span className="text-muted">
              {events.length} {events.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <button
            onClick={() => setActiveCategory("All")}
            className={`text-muted border-lines flex items-center gap-2 rounded-xl border p-3 text-sm ${activeCategory === "All" ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
          >
            <span className="inline-block size-6 rounded-full border border-white" />
            <span>All</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.title}
              onClick={() => setActiveCategory(c.title)}
              className={`text-muted border-lines flex items-center gap-2 rounded-xl border p-3 text-sm ${activeCategory === c.title ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
              title={c.title}
            >
              {c.icon}
              <span className="truncate">{c.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold md:text-xl">Upcoming Events</h3>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setTime("upcoming")}
              className={`text-muted border-lines rounded-md border px-3 py-1 ${time === "upcoming" ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
            >
              All upcoming events
            </button>
            <button
              onClick={() => setTime("today")}
              className={`text-muted border-lines rounded-md border px-3 py-1 ${time === "today" ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
            >
              Today
            </button>
            <button
              onClick={() => setTime("this-weekend")}
              className={`text-muted border-lines rounded-md border px-3 py-1 ${time === "this-weekend" ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
            >
              Weekend
            </button>
            <button
              onClick={() => setTime("this-month")}
              className={`text-muted border-lines rounded-md border px-3 py-1 ${time === "this-month" ? "from-accent1-hover to-accent2-hover bg-linear-to-r" : "bg-tertiary"}`}
            >
              This Month
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 p-8 text-center">
            <p className="text-lg font-medium">No event match</p>
            <p className="text-muted mt-1 text-sm">
              Try changing keywords, categories, times, or locations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <article
                key={e.id}
                className="group bg-secondary border-lines flex h-full flex-col overflow-hidden rounded-2xl border"
              >
                <div className="bg-tertiary relative h-40 w-full" />

                <div className="flex flex-1 flex-col gap-y-2 p-4">
                  <div className="text-clear flex items-center justify-between text-xs">
                    <span>{e.location}</span>
                    <time dateTime={e.date}>
                      {new Date(e.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                      })}
                    </time>
                  </div>

                  <h4 className="line-clamp-2 text-base font-semibold">
                    {e.title}
                  </h4>

                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-primary rounded-md px-2 py-1">
                      {e.category}
                    </span>
                    <span className="font-medium">
                      {e.price === null
                        ? "Free"
                        : `IDR ${e.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  {e.tags && e.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          className="text-muted border-lines rounded-md border px-2 py-0.5 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <button className="bg-tertiary border-lines mt-auto w-full cursor-pointer rounded-xl border py-2 text-sm font-medium transition">
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Top organizer */}
      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-xl font-semibold md:text-2xl">Top Organizers</h3>
          <a href="#" className="text-sm underline">
            View All
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary border-lines rounded-2xl border p-4"
            >
              <div className="bg-tertiary h-16 w-16 rounded-xl" />
              <div className="mt-3 font-medium">Organizer {i + 1}</div>
              <div className="text-muted text-sm">12 event · ★ 4.{i + 1}</div>
              <button className="bg-tertiary border-lines mt-3 w-full rounded-xl border py-2 text-sm">
                Visit
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="bg-secondary my-16 rounded-3xl p-8 text-center">
        <h3 className="text-xl font-semibold md:text-2xl">
          Get the latest event updates
        </h3>
        <p className="text-muted mt-1">
          Enter your email to receive weekly updates on popular events.
        </p>
        <form className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            className="bg-tertiary border-lines h-12 flex-1 rounded-xl border px-4"
            placeholder="your@email.com"
          />
          <button className="h-12 rounded-xl bg-black px-5 text-white">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
