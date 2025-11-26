"use client";

import { useMemo, useState } from "react";
import type { HomeEvent } from "@/types/event";

import HeroSection from "./hero";
import CategorySection from "./category";
import EventListSection, { type TimeFilter } from "./eventList";

export type HomeViewClientProps = {
  initialEvents: HomeEvent[];
  initialCategories: string[];
};

function isWithinRange(date: Date, filter: TimeFilter): boolean {
  const now = new Date();

  if (filter === "all") return true;

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

  if (filter === "today") {
    return date >= startOfToday && date <= endOfToday;
  }

  if (filter === "this-weekend") {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  if (filter === "this-month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  if (filter === "upcoming") {
    return date >= now;
  }

  return true;
}

export default function HomeViewClient({
  initialEvents,
  initialCategories,
}: HomeViewClientProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [onlyFree, setOnlyFree] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");

  const filteredEvents = useMemo(() => {
    return (initialEvents ?? [])
      .filter((event) =>
        activeCategory === "All" ? true : event.category === activeCategory,
      )
      .filter((event) =>
        keyword.trim()
          ? event.title.toLowerCase().includes(keyword.trim().toLowerCase())
          : true,
      )
      .filter((event) =>
        location.trim()
          ? event.location.toLowerCase().includes(location.trim().toLowerCase())
          : true,
      )
      .filter((event) => isWithinRange(new Date(event.date), timeFilter))
      .filter((event) =>
        onlyFree ? event.price === null || event.price === 0 : true,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialEvents, activeCategory, keyword, location, timeFilter, onlyFree]);

  return (
    <div className="mx-auto mt-4 max-w-[1440px] px-4 pb-4">
      <HeroSection
        keyword={keyword}
        location={location}
        timeFilter={timeFilter}
        onlyFree={onlyFree}
        onKeywordChange={setKeyword}
        onLocationChange={setLocation}
        onTimeFilterChange={setTimeFilter}
        onOnlyFreeChange={setOnlyFree}
      />

      <CategorySection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        totalEvents={filteredEvents.length}
        categories={initialCategories}
      />

      <EventListSection
        events={filteredEvents}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />
    </div>
  );
}
