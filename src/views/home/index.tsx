import HomeViewClient from "./components";
import type { HomeEvent, EventCategory, EventTag } from "@/types/event";
import { getEvents } from "@/services/event";

const defaultPage = 1;
const defaultPageSize = 8;

async function fetchHomeEvents(): Promise<HomeEvent[]> {
  try {
    const res = await getEvents({
      page: defaultPage,
      pageSize: defaultPageSize,
      sort: "newest",
    });

    const items = res.data?.items ?? [];

    const mapped: HomeEvent[] = items.map((event) => {
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
        category: (event.category as EventCategory) ?? "Music",
        location: event.location,
        date: event.startDate,
        price: event.price ?? null,
        bannerImg: event.bannerImg ?? null,
        tags: tags.length > 0 ? tags : undefined,
      };
    });

    return mapped;
  } catch (err) {
    console.error("[Home] Error while fetching events:", err);
    return [];
  }
}

export default async function HomeView() {
  const events = await fetchHomeEvents();

  return <HomeViewClient initialEvents={events} />;
}
