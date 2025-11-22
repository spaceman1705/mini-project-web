import HomeViewClient from "./components";
import type { HomeEvent, EventTag } from "@/types/event";
import { getEvents, getEventCategories } from "@/services/event";

const defaultPage = 1;
const defaultPageSize = 8;

type HomeInitialData = {
  events: HomeEvent[];
  categories: string[];
};

async function fetchHomeData(): Promise<HomeInitialData> {
  try {
    const [eventsRes, categoriesRes] = await Promise.all([
      getEvents({
        page: defaultPage,
        pageSize: defaultPageSize,
        sort: "newest",
      }),
      getEventCategories(),
    ]);

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

    const categories = Array.isArray(categoriesRes.data)
      ? categoriesRes.data
      : [];

    return {
      events: mappedEvents,
      categories,
    };
  } catch (err) {
    console.error("[Home] Error while fetching initial data:", err);
    return {
      events: [],
      categories: [],
    };
  }
}

export default async function HomeView() {
  const { events, categories } = await fetchHomeData();

  return (
    <HomeViewClient initialEvents={events} initialCategories={categories} />
  );
}
