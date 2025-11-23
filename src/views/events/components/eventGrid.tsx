import React from "react";
import Link from "next/link";
import { PiClock, PiMapPin } from "react-icons/pi";
import Image from "next/image";

import type { UiEventItem } from "./index";

type EventsGridProps = {
  events: UiEventItem[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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

export default function EventsGrid({
  events,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
}: EventsGridProps) {
  if (error) {
    return (
      <div className="border-lines rounded-2xl border bg-red-50 p-4 text-sm text-red-700">
        Failed to load events: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-lines text-muted rounded-2xl border border-dashed p-10 text-center">
        Loading events…
      </div>
    );
  }

  if (!loading && events.length === 0) {
    return (
      <div className="border-lines bg-tertiary rounded-2xl border border-dashed p-10 text-center">
        <p className="text-lg font-medium">No events match your filters</p>
        <p className="text-muted text-sm">
          Try removing some filters or searching with different keywords.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((e) => (
          <li key={e.id}>
            <article className="group border-lines bg-secondary flex h-full flex-col overflow-hidden rounded-2xl border transition hover:shadow-md">
              <div className="bg-tertiary relative h-36 w-full">
                {e.bannerImg ? (
                  <Image
                    src={e.bannerImg}
                    alt={e.title}
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
                  <h3 className="line-clamp-2 text-base leading-snug font-semibold">
                    <Link
                      href={`/events/${e.slug ?? e.id}`}
                      className="hover:underline"
                    >
                      {e.title}
                    </Link>
                  </h3>
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-xs " +
                      (e.price === null
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700")
                    }
                  >
                    {e.price === null
                      ? "Free"
                      : `IDR ${e.price.toLocaleString("id-ID")}`}
                  </span>
                </div>

                <div className="text-muted flex items-center gap-2 text-sm">
                  <PiMapPin className="shrink-0" />
                  <span className="line-clamp-1">
                    {e.location || "Location TBA"}
                  </span>
                </div>
                <div className="text-muted flex items-center gap-2 text-sm">
                  <PiClock className="shrink-0" />
                  <span>{formatDateTime(e.date)}</span>
                </div>

                {e.tags && e.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="border-lines bg-tertiary text-muted rounded-full border px-2 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="border-lines disabled:bg-secondary disabled:text-muted rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-muted text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="border-lines disabled:bg-secondary disabled:text-muted rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
