"use client";

import HomeViewClient from "./components";
import type { HomeEvent, EventTag } from "@/types/event";
import { getEvents } from "@/services/event";
import { HomePageCategories } from "@/types/event";

const defaultPage = 1;
const defaultPageSize = 8;

type HomeInitialData = {
  events: HomeEvent[];
  categories: string[];
};

async function fetchHomeData(): Promise<HomeInitialData> {
  try {
    const eventsRes = await getEvents({
      page: defaultPage,
      pageSize: defaultPageSize,
      sort: "newest",
    });

    console.log("📦 Full eventsRes:", eventsRes);
    console.log("📦 eventsRes.data:", eventsRes.data);
    console.log("📦 eventsRes.data?.items:", eventsRes.data?.items);

    const items =
      eventsRes.data?.items ?? // format: { data: { items: [] } }
      eventsRes.data ?? // format: { data: [] }
      eventsRes ?? // format langsung array []
      [];

    console.log("✅ Final items:", items);

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

    return {
      events: mappedEvents,
      categories: HomePageCategories,
    };
  } catch (err) {
    console.error("[Home] Error while fetching initial data:", err);
    return {
      events: [],
      categories: HomePageCategories,
    };
  }
}

export default async function HomeView() {
  const { events, categories } = await fetchHomeData();

  return (
    <HomeViewClient initialEvents={events} initialCategories={categories} />
  );
}
