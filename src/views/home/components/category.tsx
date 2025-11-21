import type { ReactNode } from "react";
import {
  PiMicrophoneStage,
  PiDiscoBall,
  PiMaskHappy,
  PiCalendarHeart,
  PiChats,
  PiGameController,
  PiPresentationChart,
} from "react-icons/pi";
import { IoFastFoodOutline } from "react-icons/io5";

import type { EventCategory } from "@/types/event";

type CategorySectionProps = {
  activeCategory: EventCategory | "All";
  onCategoryChange: (value: EventCategory | "All") => void;
  totalEvents: number;
};

type CategoryItem = {
  title: EventCategory;
  icon: ReactNode;
};

const CATEGORIES: CategoryItem[] = [
  { title: "Music", icon: <PiMicrophoneStage className="size-6" /> },
  { title: "Nightlife", icon: <PiDiscoBall className="size-6" /> },
  { title: "Art", icon: <PiMaskHappy className="size-6" /> },
  { title: "Holiday", icon: <PiCalendarHeart className="size-6" /> },
  { title: "Dating", icon: <PiChats className="size-6" /> },
  { title: "Hobby", icon: <PiGameController className="size-6" /> },
  { title: "Business", icon: <PiPresentationChart className="size-6" /> },
  { title: "Food & Drink", icon: <IoFastFoodOutline className="size-6" /> },
];

export default function CategorySection({
  activeCategory,
  onCategoryChange,
  totalEvents,
}: CategorySectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">Category</h2>
        <div className="text-muted text-sm">
          {totalEvents} {totalEvents === 1 ? "event found" : "events found"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        <button
          type="button"
          onClick={() => onCategoryChange("All")}
          className={`text-muted border-lines flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
            activeCategory === "All"
              ? "from-accent1-hover to-accent2-hover bg-linear-to-r"
              : "bg-tertiary"
          }`}
        >
          <span className="inline-block size-6 rounded-full border border-white" />
          <span>All</span>
        </button>

        {CATEGORIES.map((category) => (
          <button
            key={category.title}
            type="button"
            onClick={() => onCategoryChange(category.title)}
            className={`text-muted border-lines flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
              activeCategory === category.title
                ? "from-accent1-hover to-accent2-hover bg-linear-to-r"
                : "bg-tertiary"
            }`}
            title={category.title}
          >
            {category.icon}
            <span className="truncate">{category.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
