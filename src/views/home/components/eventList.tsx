import Link from "next/link";
import { PiMapPin } from "react-icons/pi";

import type { HomeEvent } from "@/types/event";

export type TimeFilter =
  | "all"
  | "today"
  | "this-weekend"
  | "this-month"
  | "upcoming";

type EventListSectionProps = {
  events: HomeEvent[];
  timeFilter: TimeFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
};

export default function EventListSection({
  events,
  timeFilter,
  onTimeFilterChange,
}: EventListSectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold md:text-xl">Upcoming events</h3>

        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              { value: "all", label: "All" },
              { value: "today", label: "Today" },
              { value: "this-weekend", label: "Weekend" },
              { value: "this-month", label: "This month" },
              { value: "upcoming", label: "Upcoming" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onTimeFilterChange(item.value)}
              className={`rounded-full px-3 py-1 text-xs ${
                timeFilter === item.value
                  ? "bg-black text-white"
                  : "border-lines bg-tertiary text-muted border"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-tertiary border-lines flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
          <p className="text-lg font-medium">No event match</p>
          <p className="text-muted mt-1 text-sm">
            Try changing keywords, categories, times, or locations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-secondary border-lines flex h-full flex-col rounded-2xl border p-4 shadow-lg"
            >
              {/* Thumbnail placeholder */}
              <div className="bg-tertiary mb-3 h-32 w-full rounded-xl" />

              <div className="text-muted mb-2 flex items-center justify-between text-xs">
                <span>
                  {new Date(event.date).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span>
                  {new Date(event.date).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <h4 className="line-clamp-2 text-sm font-semibold">
                {event.title}
              </h4>

              <p className="text-muted mt-1 flex items-center gap-1 text-xs">
                <PiMapPin className="inline-block" />
                <span>{event.location}</span>
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted">{event.category}</span>
                <span className="font-medium">
                  {event.price === null || event.price === 0
                    ? "Free"
                    : `IDR ${event.price.toLocaleString("id-ID")}`}
                </span>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-muted border-lines rounded-md border px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between gap-2">
                <Link
                  href={`/events/${event.slug}`}
                  className="bg-primary border-lines hover:bg-tertiary mt-4 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
