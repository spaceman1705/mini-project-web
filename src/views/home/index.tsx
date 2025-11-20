import HomeViewClient from "./components";
import type {
  EventListResponse,
  HomeEvent,
  EventCategory,
} from "@/types/event";

const defaultPage = 1;
const defaultPageSize = 8;

async function fetchHomeEvents(): Promise<HomeEvent[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not set in .env.local");
    return [];
  }

  const url = `${baseUrl}/events?page=${defaultPage}&pageSize=${defaultPageSize}&sort=newest`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "[Home] Gagal mengambil events:",
        res.status,
        res.statusText,
      );
      return [];
    }

    const json = (await res.json()) as EventListResponse;
    const items = json.data?.items ?? [];

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
  } catch (error) {
    console.error("[Home] Error saat fetch events:", error);
    return [];
  }
}

export default async function HomeView() {
  const events = await fetchHomeEvents();

  return <HomeViewClient initialEvents={events} />;
}
