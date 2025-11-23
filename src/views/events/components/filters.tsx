import React from "react";
import { PiClock, PiMapPin, PiTag } from "react-icons/pi";

import type { SortOption, Tag, TimeFilter } from "./index";

type FiltersBarProps = {
  category: string | "All";
  onCategoryChange: (value: string | "All") => void;

  categories: string[];

  locations: string[];
  location: string | "All";
  onLocationChange: (value: string | "All") => void;

  time: TimeFilter;
  onTimeChange: (value: TimeFilter) => void;

  sort: SortOption;
  onSortChange: (value: SortOption) => void;

  freeOnly: boolean;
  onToggleFreeOnly: () => void;

  tags: Record<Tag, boolean>;
  onToggleTag: (tag: Tag) => void;

  filteredCount: number;
  totalCount: number;
  onReset: () => void;
};

export default function FiltersBar({
  category,
  onCategoryChange,
  categories,
  locations,
  location,
  onLocationChange,
  time,
  onTimeChange,
  sort,
  onSortChange,
  freeOnly,
  onToggleFreeOnly,
  tags,
  onToggleTag,
  filteredCount,
  totalCount,
  onReset,
}: FiltersBarProps) {
  const allCategories: (string | "All")[] = [
    "All",
    ...categories.filter((c) => c && c.trim().length > 0),
  ];

  return (
    <section className="mb-6 space-y-4">
      {/* Category chips */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={
                "border-lines flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
                (category === cat
                  ? "bg-primary-invert text-clear-invert"
                  : "bg-tertiary hover:bg-primary-invert hover:text-clear-invert")
              }
            >
              <span>{cat === "All" ? "All" : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Second row filters */}
      <div className="flex flex-wrap gap-3">
        {/* Location */}
        <div className="flex items-center gap-2">
          <PiMapPin className="text-muted" />
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value as string | "All")}
            className="border-lines bg-tertiary rounded-lg border px-2 py-1.5 text-sm"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "All locations" : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Time filter */}
        <div className="flex items-center gap-2">
          <PiClock className="text-muted" />
          <select
            value={time}
            onChange={(e) => onTimeChange(e.target.value as TimeFilter)}
            className="border-lines bg-tertiary rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="all">Any time</option>
            <option value="today">Today</option>
            <option value="this-weekend">This weekend</option>
            <option value="this-month">This month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="border-lines bg-tertiary rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* Free only */}
        <button
          onClick={onToggleFreeOnly}
          className={
            "border-lines flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
            (freeOnly
              ? "bg-primary-invert text-clear-invert"
              : "bg-tertiary hover:bg-primary-invert hover:text-clear-invert")
          }
        >
          <PiTag />
          <span>Free only</span>
        </button>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(tags) as Tag[]).map((t) => (
            <button
              key={t}
              onClick={() => onToggleTag(t)}
              className={
                "border-lines flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition " +
                (tags[t]
                  ? "bg-primary-invert text-clear-invert"
                  : "bg-tertiary hover:bg-primary-invert hover:text-clear-invert")
              }
            >
              <PiTag className="text-[0.9rem]" />
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary & reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-sm">
          Showing <b>{filteredCount}</b>
          {totalCount ? (
            <>
              {" "}
              of <b>{totalCount}</b> events
            </>
          ) : null}
        </p>
        <button
          onClick={onReset}
          className="border-lines hover:bg-primary-invert hover:text-clear-invert bg-tertiary rounded-lg border px-3 py-1.5 text-sm"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}
