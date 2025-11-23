"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PiCalendarHeart,
  PiClock,
  PiMapPin,
  PiTicket,
  PiUsersThree,
  PiStarFill,
} from "react-icons/pi";

import type { EventDetail } from "@/types/event";

type EventDetailViewClientProps = {
  event: EventDetail;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTimeRange(start: string, end: string) {
  const dStart = new Date(start);
  const dEnd = new Date(end);

  const sameDay =
    dStart.getFullYear() === dEnd.getFullYear() &&
    dStart.getMonth() === dEnd.getMonth() &&
    dStart.getDate() === dEnd.getDate();

  if (sameDay) {
    const date = formatDate(start);
    const timeRange = `${formatTime(start)} - ${formatTime(end)}`;
    return { date, timeRange };
  }

  return {
    date: `${formatDate(start)} - ${formatDate(end)}`,
    timeRange: `${formatTime(start)} - ${formatTime(end)}`,
  };
}

function calcRatingInfo(event: EventDetail) {
  const reviews = event.review ?? [];
  if (reviews.length === 0) {
    return { avg: 0, count: 0 };
  }

  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;
  return { avg, count: reviews.length };
}

export default function EventDetailViewClient({
  event,
}: EventDetailViewClientProps) {
  const { date, timeRange } = formatDateTimeRange(
    event.startDate,
    event.endDate,
  );
  const { avg, count } = calcRatingInfo(event);

  const categoryLabel = event.category || "Other";

  const isFree = event.price === 0;
  const priceLabel = isFree
    ? "Free"
    : `IDR ${event.price.toLocaleString("id-ID")}`;

  const remainingSeats = event.availableSeats;

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="text-muted mb-4 text-xs sm:mb-6">
        <Link href="/events" className="hover:underline">
          Events
        </Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1">{event.title}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: main content */}
        <section className="flex-1 space-y-6">
          {/* Banner */}
          <div className="bg-secondary overflow-hidden rounded-3xl">
            <div className="relative h-56 w-full sm:h-72 lg:h-80">
              {event.bannerImg ? (
                <Image
                  src={event.bannerImg}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-muted flex h-full w-full items-center justify-center text-sm">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Title & meta */}
          <header className="space-y-2">
            <div className="bg-tertiary text-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
              <span>{categoryLabel}</span>
            </div>

            <h1 className="text-2xl leading-tight font-semibold sm:text-3xl">
              {event.title}
            </h1>

            <div className="text-muted flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <PiMapPin className="text-base" />
                <span>{event.location}</span>
              </div>
              <span className="bg-muted hidden h-1 w-1 rounded-full sm:inline-block" />
              <div className="flex items-center gap-1.5">
                <PiClock className="text-base" />
                <span>{date}</span>
                <span>•</span>
                <span>{timeRange}</span>
              </div>
            </div>

            {count > 0 && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                <PiStarFill className="text-amber-400" />
                <span className="font-semibold">{avg.toFixed(1)}</span>
                <span className="text-muted">({count} reviews)</span>
              </div>
            )}
          </header>

          {/* Description */}
          <section className="bg-secondary border-lines rounded-3xl border p-4 sm:p-6">
            <h2 className="mb-2 text-lg font-semibold">About this event</h2>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>

          {/* Tickets */}
          {event.ticketType && event.ticketType.length > 0 && (
            <section className="bg-secondary border-lines rounded-3xl border p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Tickets</h2>
                <span className="text-muted text-xs">
                  {remainingSeats != null
                    ? `${remainingSeats} seats remaining`
                    : "Limited seats"}
                </span>
              </div>

              <div className="space-y-3">
                {event.ticketType.map((t) => (
                  <div
                    key={t.id}
                    className="bg-tertiary border-lines flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <PiTicket className="text-muted" />
                        <span className="font-medium">{t.name}</span>
                      </div>
                      {t.description && (
                        <p className="text-muted mt-1 text-xs">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        IDR {t.price.toLocaleString("id-ID")}
                      </div>
                      <div className="text-muted text-xs">
                        {t.availableQuota} of {t.quota} available
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Organizer */}
          <section className="bg-secondary border-lines rounded-3xl border p-4 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold">Organizer</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-tertiary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                {event.organizer.firstname.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {event.organizer.firstname} {event.organizer.lastname}
                </p>
                <p className="text-muted text-xs">{event.organizer.email}</p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-secondary border-lines rounded-3xl border p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews</h2>
              {count > 0 && (
                <span className="text-muted text-sm">
                  {avg.toFixed(1)} • {count} reviews
                </span>
              )}
            </div>

            {count === 0 ? (
              <p className="text-muted text-sm">
                There are no reviews yet. Be the first to share your experience
                after attending this event.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {event.review.slice(0, 3).map((r, idx) => (
                  <li
                    key={`${r.createdAt}-${idx}`}
                    className="bg-tertiary border-lines rounded-2xl border p-3"
                  >
                    <div className="text-muted mb-1 flex items-center gap-2 text-xs">
                      <PiStarFill className="text-amber-400" />
                      <span>{r.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>
                        {new Date(r.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {r.comment || "No comment provided."}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>

        {/* Right: sidebar */}
        <aside className="w-full space-y-4 lg:w-[320px]">
          <div className="bg-secondary border-lines rounded-3xl border p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-muted text-xs">From</span>
              {remainingSeats != null && (
                <span className="text-muted text-xs">
                  {remainingSeats} seats left
                </span>
              )}
            </div>
            <div className="mb-4 text-2xl font-semibold">{priceLabel}</div>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-900"
            >
              Get Tickets
            </button>

            <p className="text-muted mt-2 text-xs">
              You&apos;ll be redirected to checkout to complete your booking.
            </p>
          </div>

          <div className="bg-secondary border-lines space-y-2 rounded-3xl border p-4 text-sm">
            <div className="flex items-start gap-2">
              <PiCalendarHeart className="text-muted mt-0.5 text-base" />
              <div>
                <p className="font-medium">Date &amp; time</p>
                <p className="text-muted">
                  {date}
                  <br />
                  {timeRange}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <PiMapPin className="text-muted mt-0.5 text-base" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <PiUsersThree className="text-muted mt-0.5 text-base" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-muted">
                  {event.availableSeats != null
                    ? `${event.availableSeats} seats available`
                    : "Limited seats"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
