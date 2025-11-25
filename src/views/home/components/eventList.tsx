import Link from "next/link";
import Image from "next/image";
import { PiClock, PiMapPin } from "react-icons/pi";

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

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <li key={event.id}>
              <article className="group border-lines bg-secondary flex h-full flex-col overflow-hidden rounded-2xl border transition hover:shadow-md">
                <div className="bg-tertiary relative h-36 w-full">
                  {event.bannerImg ? (
                    <Image
                      src={event.bannerImg}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted absolute inset-0 flex items-center justify-center text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="line-clamp-2 text-base leading-snug font-semibold">
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </h4>

                    <span
                      className={
                        "shrink-0 rounded-full px-2 py-0.5 text-xs " +
                        (event.price === null || event.price === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {event.price === null || event.price === 0
                        ? "Free"
                        : `IDR ${event.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  <div className="text-muted flex items-center gap-2 text-sm">
                    <PiMapPin className="shrink-0" />
                    <span className="line-clamp-1">
                      {event.location || "Location TBA"}
                    </span>
                  </div>

                  <div className="text-muted flex items-center gap-2 text-sm">
                    <PiClock className="shrink-0" />
                    <span>{formatDateTime(event.date)}</span>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-lines bg-tertiary text-muted rounded-full border px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
