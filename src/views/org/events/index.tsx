"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import type {
  GetMyEventsParams,
  MyEventListItem,
  MyEventsResponse,
  EventStatus,
  EventSortOption,
} from "@/types/event";
import { getMyEvents } from "@/services/event";

type DateQuickFilter = "all" | "today" | "weekend" | "month" | "upcoming";

const statusStyles: Record<EventStatus, string> = {
  DRAFT:
    "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-700/50",
  PUBLISHED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/50",
  CANCELED:
    "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-700/50",
  FINISHED:
    "bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:ring-slate-700/50",
};

const EVENT_CATEGORIES: string[] = [
  "Music",
  "Nightlife",
  "Art",
  "Holiday",
  "Dating",
  "Hobby",
  "Business",
  "Food & Drink",
];

function formatEventDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const locale: Intl.LocalesArgument = "id-ID";

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(
      start,
    )} – ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} ${timeFormatter.format(
    start,
  )} – ${timeFormatter.format(end)} ${timeFormatter.format(end)}`;
}

function formatPriceIdr(price: number): string {
  if (price === 0) return "Free";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getAccessTokenFromSession(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;

  const s = session as {
    accessToken?: string | null;
    access_token?: string | null;
    token?: string | null;
    user?: {
      accessToken?: string | null;
      access_token?: string | null;
    };
  };

  return (
    s.accessToken ??
    s.access_token ??
    s.user?.accessToken ??
    s.user?.access_token ??
    s.token ??
    null
  );
}

const OrganizerEventsView = () => {
  const { data: session, status } = useSession();

  const accessToken = getAccessTokenFromSession(session);

  const [events, setEvents] = useState<MyEventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | EventStatus>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [location, setLocation] = useState("");
  const [dateFilter, setDateFilter] = useState<DateQuickFilter>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<EventSortOption>("newest");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  const queryParams: GetMyEventsParams = useMemo(() => {
    const params: GetMyEventsParams = {
      page,
      pageSize,
      sort,
    };

    if (debouncedSearch) {
      params.q = debouncedSearch;
    }

    if (statusFilter && statusFilter !== "ALL") {
      params.status = statusFilter;
    } else {
      params.status = "ALL";
    }

    if (category && category !== "ALL") {
      params.category = category;
    }

    if (location.trim()) {
      params.location = location.trim();
    }

    switch (dateFilter) {
      case "today":
        params.date = "today";
        break;
      case "weekend":
        params.date = "weekend";
        break;
      case "month":
        params.date = "month";
        break;
      case "upcoming":
        params.date = "upcoming";
        break;
      case "all":
      default:
        break;
    }

    if (minPrice) {
      const n = Number(minPrice);
      if (!Number.isNaN(n)) {
        params.minPrice = n;
      }
    }

    if (maxPrice) {
      const n = Number(maxPrice);
      if (!Number.isNaN(n)) {
        params.maxPrice = n;
      }
    }

    return params;
  }, [
    page,
    pageSize,
    sort,
    debouncedSearch,
    statusFilter,
    category,
    location,
    dateFilter,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchMyEvents() {
      if (status === "loading") return;

      if (status !== "authenticated" || !accessToken) {
        if (!isCancelled) {
          setError("You must be logged in as organizer to view your events.");
          setEvents([]);
          setTotalItems(0);
          setTotalPages(1);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response: MyEventsResponse = await getMyEvents(
          accessToken,
          queryParams,
        );

        if (isCancelled) return;

        const data = response.data;

        setEvents(data.items);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("[OrganizerEvents] Failed fetching my events:", err);
        if (!isCancelled) {
          setError("Failed to load your events. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMyEvents();

    return () => {
      isCancelled = true;
    };
  }, [status, accessToken, queryParams]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-6 px-4 py-6">
      {/* Header */}
      <header className="border-lines flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-clear text-2xl font-semibold tracking-tight md:text-3xl">
            My Events
          </h1>
          <p className="text-muted mt-1 text-sm">
            Manage and promote your events, track performance, and tweak details
            all in one place.
          </p>
        </div>

        <Link
          href="/org/events/create"
          className="bg-primary-invert text-clear-invert hover:bg-tertiary-invert focus-visible:ring-primary-invert inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          + Create Event
        </Link>
      </header>

      {/* Filters */}
      <section className="border-lines bg-secondary flex flex-col gap-4 rounded-2xl border p-4 shadow-sm">
        {/* Top row: search + sort */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search your events..."
              className="border-lines bg-tertiary focus:border-accent1-hover focus:ring-accent2-hover w-full rounded-full border px-4 py-2.5 text-sm shadow-sm ring-0 transition outline-none focus:ring-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-muted text-xs font-medium tracking-wide uppercase">
              Sort by
            </span>
            <select
              className="border-lines text-muted bg-tertiary focus:border-accent1-hover focus:ring-accent2-hover rounded-full border px-3 py-2 text-xs font-medium shadow-sm outline-none focus:ring-2"
              value={sort}
              onChange={(e) => setSort(e.target.value as EventSortOption)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {/* Bottom row: filters */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-xs font-medium tracking-wide uppercase">
              Status
            </label>
            <select
              className="focus:border-accent1-hover focus:ring-accent2-hover border-lines text-muted bg-tertiary w-full rounded-xl border px-3 py-2 text-xs font-medium shadow-sm outline-none focus:ring-2"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | EventStatus)
              }
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="FINISHED">Finished</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-xs font-medium tracking-wide uppercase">
              Category
            </label>
            <select
              className="focus:border-accent1-hover focus:ring-accent2-hover border-lines text-muted bg-tertiary w-full rounded-xl border px-3 py-2 text-xs font-medium shadow-sm outline-none focus:ring-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ALL">All categories</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-xs font-medium tracking-wide uppercase">
              Date
            </label>
            <select
              className="focus:border-accent1-hover focus:ring-accent2-hover border-lines text-muted bg-tertiary w-full rounded-xl border px-3 py-2 text-xs font-medium shadow-sm outline-none focus:ring-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateQuickFilter)}
            >
              <option value="all">Anytime</option>
              <option value="today">Today</option>
              <option value="weekend">This weekend</option>
              <option value="month">This month</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-xs font-medium tracking-wide uppercase">
              Price range (IDR)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                className="focus:border-accent1-hover focus:ring-accent2-hover border-lines bg-tertiary w-full rounded-xl border px-2.5 py-2 text-xs shadow-sm outline-none focus:ring-2"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Max"
                className="focus:border-accent1-hover focus:ring-accent2-hover border-lines bg-tertiary w-full rounded-xl border px-2.5 py-2 text-xs shadow-sm outline-none focus:ring-2"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="border-lines bg-tertiary animate-pulse rounded-2xl border p-4 shadow-sm"
              >
                <div className="bg-secondary mb-3 h-40 w-full rounded-xl" />
                <div className="bg-secondary mb-2 h-4 w-24 rounded-full" />
                <div className="bg-secondary mb-2 h-5 w-3/4 rounded-full" />
                <div className="bg-secondary mb-2 h-4 w-1/2 rounded-full" />
                <div className="mt-4 flex gap-2">
                  <div className="bg-secondary h-8 flex-1 rounded-full" />
                  <div className="bg-secondary h-8 flex-1 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border-error-border bg-error-bg text-error-text flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-6 text-center text-sm">
            <p>{error}</p>
            <button
              type="button"
              className="bg-tertiary border-error-border text-error-text hover:bg-error-bg mt-1 inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm"
              onClick={() => {
                setPage(1);
              }}
            >
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="border-empty-border bg-empty-bg flex flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-10 text-center">
            <p className="text-empty-text text-base font-medium">
              You don&apos;t have any events that match these filters.
            </p>
            <p className="max-w-md text-sm text-slate-600">
              Try adjusting your filters, or create a new event to start selling
              tickets.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="text-empty-text bg-tertiary border-empty-border hover:bg-empty-bg inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-medium shadow-sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCategory("ALL");
                  setLocation("");
                  setDateFilter("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setSort("newest");
                  setPage(1);
                }}
              >
                Reset filters
              </button>
              <Link
                href="/org/events/create"
                className="bg-primary-invert text-clear-invert hover:bg-tertiary-invert inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium shadow-sm"
              >
                + Create your first event
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Grid events */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                Showing{" "}
                <span className="font-semibold">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold">
                  {Math.min(page * pageSize, totalItems)}
                </span>{" "}
                of <span className="font-semibold">{totalItems}</span> events
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="text-muted bg-tertiary border-lines hover:bg-secondary inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-muted text-[11px] font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                  className="text-muted bg-tertiary border-lines hover:bg-secondary inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default OrganizerEventsView;

type OrganizerEventCardProps = {
  event: MyEventListItem;
};

const OrganizerEventCard = ({ event }: OrganizerEventCardProps) => {
  const dateLabel = formatEventDateRange(event.startDate, event.endDate);
  const priceLabel = formatPriceIdr(event.price);

  return (
    <article className="group border-lines bg-secondary flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md">
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden">
        {event.bannerImg ? (
          <Image
            src={event.bannerImg}
            alt={event.title}
            fill
            className="object-cover transition duration-300"
          />
        ) : (
          <div className="from-accent1-hover to-accent2-hover flex h-full w-full items-center justify-center bg-linear-to-r/oklch text-xs font-medium tracking-wide text-slate-100 uppercase">
            No banner
          </div>
        )}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${statusStyles[event.status]}`}
          >
            {event.status.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">
        {/* Date + location */}
        <div className="text-muted flex flex-wrap items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <span>{dateLabel}</span>
          <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
          <span>{event.location}</span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-muted group-hover:text-clear line-clamp-2 text-sm font-semibold">
            {event.title}
          </h2>
          <p className="text-muted mt-1 text-xs font-medium">
            {event.category}
          </p>
        </div>

        {/* Stats row */}
        <div className="text-muted mt-auto flex items-center justify-between text-xs">
          <span className="font-semibold">{priceLabel}</span>
          <span className="text-muted text-xs">
            {event.availableSeats} seats left
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="text-muted bg-tertiary border-lines hover:bg-secondary inline-flex flex-1 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm"
          >
            View event
          </Link>
          <Link
            href={`/org/events/create?edit=${event.id}&slug=${event.slug}`}
            className="bg-primary-invert text-clear-invert hover:bg-tertiary-invert inline-flex flex-1 items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium shadow-sm"
          >
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
};
