import EventsViewClient, { type EventsViewInitialData } from "./components";
import type { EventListResponse } from "@/types/event";

const defaultPage = 1;
const defaultPageSize = 12;

async function fetchInitialEvents(): Promise<EventsViewInitialData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not set in .env.local");
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.set("page", String(defaultPage));
    params.set("pageSize", String(defaultPageSize));
    params.set("sort", "newest");

    const res = await fetch(`${baseUrl}/events?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("[Events] Gagal fetch events, status:", res.status);
      return null;
    }

    const json = (await res.json()) as EventListResponse;
    const data = json.data;

    return {
      items: data.items,
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("[Events] Error saat fetch events:", error);
    return null;
  }
}

export default async function EventsView() {
  const initialData = await fetchInitialEvents();

  return <EventsViewClient initialData={initialData} />;
}
