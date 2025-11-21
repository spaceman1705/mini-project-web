import { PiClock, PiMapPin } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import type { TimeFilter } from "./eventList";

type HeroSectionProps = {
  keyword: string;
  location: string;
  timeFilter: TimeFilter;
  onlyFree: boolean;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onTimeFilterChange: (value: TimeFilter) => void;
  onOnlyFreeChange: (value: boolean) => void;
};

export default function HeroSection({
  keyword,
  location,
  timeFilter,
  onlyFree,
  onKeywordChange,
  onLocationChange,
  onTimeFilterChange,
  onOnlyFreeChange,
}: HeroSectionProps) {
  return (
    <section className="bg-secondary relative isolate overflow-hidden rounded-3xl p-8 md:p-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold md:text-5xl">
            Find &amp; make fun events near you
          </h1>
          <p className="text-muted mt-3 text-base md:text-lg">
            Explore concerts, workshops, meetups, and more. Filter by category,
            time, and location.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative">
                <IoSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  value={keyword}
                  onChange={(e) => onKeywordChange(e.target.value)}
                  placeholder="Find events (e.g. Music, Workshop)"
                  className="bg-tertiary border-lines h-12 w-full rounded-xl border pr-3 pl-8 outline-none"
                />
              </div>

              <div className="relative">
                <PiMapPin className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  placeholder="Location (e.g. Jakarta, Bandung)"
                  className="bg-tertiary border-lines h-12 w-full rounded-xl border pr-3 pl-8 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "upcoming", label: "All upcoming events" },
                  { value: "today", label: "Today" },
                  { value: "this-weekend", label: "Weekend" },
                  { value: "this-month", label: "This month" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onTimeFilterChange(item.value)}
                  className={`border-lines text-muted h-10 rounded-xl px-4 text-sm transition ${
                    timeFilter === item.value
                      ? "from-accent1-hover to-accent2-hover bg-linear-to-r"
                      : "bg-tertiary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-muted mt-3 flex flex-wrap items-center gap-4 text-xs">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={onlyFree}
                onChange={(e) => onOnlyFreeChange(e.target.checked)}
                className="border-lines size-4 rounded border"
              />
            </label>
            <span>Show free events only</span>

            <span className="flex items-center gap-2">
              <PiClock className="text-sm" />
              <span>Updated daily</span>
            </span>
          </div>
        </div>

        <div className="from-accent1 to-accent2-hover mt-6 h-48 flex-1 rounded-2xl bg-linear-to-br p-1 md:mt-0 md:h-64">
          <div className="bg-tertiary flex h-full w-full items-center justify-center rounded-2xl">
            <p className="text-muted text-center text-sm">Banner</p>
          </div>
        </div>
      </div>
    </section>
  );
}
