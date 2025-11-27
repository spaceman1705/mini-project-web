"use client";

import { useEffect, useState } from "react";
import HomeViewClient from "./components";
import type { HomeEvent, EventTag } from "@/types/event";
import { getEvents } from "@/services/event";
import { HomePageCategories } from "@/types/event";

const defaultPage = 1;
const defaultPageSize = 8;

export default function HomeView() {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);

        const eventsRes = await getEvents({
          page: defaultPage,
          pageSize: defaultPageSize,
          sort: "newest",
        });

        console.log("📦 eventsRes:", eventsRes);

        const items = eventsRes.data?.items ?? [];

        const mappedEvents: HomeEvent[] = items.map((event) => {
          const tags: EventTag[] = [];

          if (event.location.toLowerCase() === "online") {
            tags.push("Online");
          }

          if (
            typeof event.availableSeats === "number" &&
            event.availableSeats <= 20
          ) {
            tags.push("Limited");
          }

          return {
            id: event.id,
            slug: event.slug,
            title: event.title,
            category: event.category || "Other",
            location: event.location,
            date: event.startDate,
            price: event.price ?? null,
            bannerImg: event.bannerImg ?? null,
            tags: tags.length > 0 ? tags : undefined,
          };
        });

        console.log("✅ Mapped events:", mappedEvents);
        setEvents(mappedEvents);
      } catch (err) {
        console.error("[Home] Error while fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeViewClient initialEvents={events} initialCategories={HomePageCategories} />
  );
}