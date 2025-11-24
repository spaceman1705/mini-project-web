import EventsViewClient, { type EventsViewInitialData } from "./components";
import type { EventListResponse } from "@/types/event";
import { getEvents, getEventCategories } from "@/services/event";

const defaultPage = 1;
const defaultPageSize = 12;

async function fetchInitialEvents(): Promise<EventsViewInitialData | null> {
  try {
    const response: EventListResponse = await getEvents({
      page: defaultPage,
      pageSize: defaultPageSize,
      sort: "newest",
    });

    const data = response.data;

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

async function fetchCategories(): Promise<string[]> {
  try {
    const res = await getEventCategories();
    const categories = Array.isArray(res.data) ? res.data : [];
    return categories;
  } catch (error) {
    console.error("[Events] Error saat fetch categories:", error);
    return [];
  }
}

export default async function EventsView() {
  const [initialData, initialCategories] = await Promise.all([
    fetchInitialEvents(),
    fetchCategories(),
  ]);

  return (
    <EventsViewClient
      initialData={initialData}
      initialCategories={initialCategories}
    />
  );
}
