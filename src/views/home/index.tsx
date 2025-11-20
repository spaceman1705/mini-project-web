import HomeViewClient from "./components";
import type { HomeEvent, EventCategory } from "@/types/event";
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

    const mapped: HomeEvent[] = items.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category as EventCategory,
      location: event.location,
      date: event.startDate,
      price: event.price,
      bannerImg: event.bannerImg ?? null,
    }));

    return mapped;
  } catch (err) {
    console.error("[Home] Error saat fetch events:", err);
    return [];
  }
}

export default async function HomeView() {
  const events = await fetchHomeEvents();

  return <HomeViewClient initialEvents={events} />;
}
