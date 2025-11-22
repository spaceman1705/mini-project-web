import Image from "next/image";
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
  onlyFree,
  onKeywordChange,
  onLocationChange,
  onOnlyFreeChange,
}: HeroSectionProps) {
  return (
    <section className="bg-secondary flex flex-col gap-4 rounded-3xl shadow-lg">
      <div className="relative">
        <Image
          src="/hero-img.webp"
          alt="hero"
          width={4096}
          height={1265}
          className="h-auto w-full rounded-3xl object-cover"
          priority
        />
      </div>

      <div className="flex flex-col gap-6 p-8 md:justify-between">
        <h1 className="text-3xl font-bold md:text-5xl">
          Find &amp; make fun events near you
        </h1>

        <p className="text-muted text-base md:text-lg">
          Explore concerts, workshops, meetups, and more. Filter by category,
          time, and location.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex max-w-3xl flex-col gap-3">
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
        </div>
        <div className="text-muted mt-3 flex flex-wrap items-center gap-2 text-xs">
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
    </section>
  );
}
