"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  EventCategory,
  EventListItem,
  EventListResponse,
} from "@/types/event";

import SearchBar from "./searchBar";
import FiltersBar from "./filters";
import EventsGrid from "./eventGrid";

export type TimeFilter =
  | "all"
  | "today"
  | "this-weekend"
  | "this-month"
  | "upcoming";

export type Tag = "Online" | "Family" | "Limited";

export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

export type UiEventItem = {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  location: string;
  date: string;
  price: number | null;
  bannerImg?: string | null;
  tags?: Tag[];
};

export type EventsViewInitialData = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EventsViewClientProps = {
  initialData: EventsViewInitialData | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

type EventWithMeta = EventListItem & {
  availableSeats?: number | null;
  bannerImg?: string | null;
};

function mapToUiEvent(item: EventListItem): UiEventItem {
  const category = (item.category as EventCategory) ?? "Music";
  const withMeta = item as EventWithMeta;

  const tags: Tag[] = [];
  if (withMeta.location.toLowerCase() === "online") tags.push("Online");
  if (
    typeof withMeta.availableSeats === "number" &&
    withMeta.availableSeats <= 20
  ) {
    tags.push("Limited");
  }

  return {
    id: withMeta.id,
    slug: withMeta.slug,
    title: withMeta.title,
    category,
    location: withMeta.location,
    date: withMeta.startDate,
    price: withMeta.price,
    bannerImg: withMeta.bannerImg ?? null,
    tags,
  };
}

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function EventsViewClient({
  initialData,
}: EventsViewClientProps) {
  // data awal dari server
  const [events, setEvents] = useState<UiEventItem[]>(() =>
    (initialData?.items ?? []).map(mapToUiEvent),
  );

  const [page, setPage] = useState(initialData?.page ?? 1);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);

  // search & filter state
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q);

  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [location, setLocation] = useState<string | "All">("All");
  const [time, setTime] = useState<TimeFilter>("upcoming");
  const [freeOnly, setFreeOnly] = useState(false);
  const [tags, setTags] = useState<Record<Tag, boolean>>({
    Online: false,
    Family: false,
    Limited: false,
  });
  const [sort, setSort] = useState<SortOption>("newest");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locations = useMemo(() => {
    const set = new Set<string>();
    set.add("Online");
    events.forEach((e) => {
      if (e.location) set.add(e.location);
    });
    return ["All", ...Array.from(set)];
  }, [events]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", "12");

        if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
        if (category !== "All") params.set("category", category);
        if (location !== "All") params.set("location", location);

        if (time !== "all") {
          let dateParam: string | null = null;
          switch (time) {
            case "today":
              dateParam = "today";
              break;
            case "this-weekend":
              dateParam = "weekend";
              break;
            case "this-month":
              dateParam = "month";
              break;
            case "upcoming":
              dateParam = "upcoming";
              break;
          }
          if (dateParam) params.set("date", dateParam);
        }

        if (freeOnly) {
          params.set("minPrice", "0");
          params.set("maxPrice", "0");
        }

        if (sort) {
          params.set("sort", sort);
        }

        const res = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load events (${res.status})`);
        }

        const json: EventListResponse = await res.json();
        const data = json.data;

        setEvents(data.items.map(mapToUiEvent));
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("[Events] Error saat load events:", err);

        const message =
          err instanceof Error ? err.message : "Failed to load events";

        setError(message);
        setEvents([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [page, debouncedQ, category, location, time, freeOnly, sort]);

  // filter tag di client-side
  const activeTags = useMemo(
    () => (Object.keys(tags) as Tag[]).filter((t) => tags[t]),
    [tags],
  );

  const filteredEvents = useMemo(() => {
    if (activeTags.length === 0) return events;
    return events.filter((e) =>
      activeTags.every((t) => (e.tags ?? []).includes(t)),
    );
  }, [events, activeTags]);

  const handleResetFilters = () => {
    setCategory("All");
    setLocation("All");
    setTime("upcoming");
    setFreeOnly(false);
    setTags({ Online: false, Family: false, Limited: false });
    setSort("newest");
    setQ("");
    setPage(1);
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

      <SearchBar
        value={q}
        onChange={(value) => {
          setQ(value);
          setPage(1);
        }}
      />

      <FiltersBar
        category={category}
        onCategoryChange={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
        locations={locations}
        location={location}
        onLocationChange={(loc) => {
          setLocation(loc);
          setPage(1);
        }}
        time={time}
        onTimeChange={(t) => {
          setTime(t);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        freeOnly={freeOnly}
        onToggleFreeOnly={() => {
          setFreeOnly((v) => !v);
          setPage(1);
        }}
        tags={tags}
        onToggleTag={(tag) => {
          setTags((prev) => ({ ...prev, [tag]: !prev[tag] }));
          setPage(1);
        }}
        filteredCount={filteredEvents.length}
        totalCount={total}
        onReset={handleResetFilters}
      />

      <EventsGrid
        events={filteredEvents}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </main>
  );
}
