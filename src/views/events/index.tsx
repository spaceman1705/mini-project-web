"use client";

import EventsViewClient, { type EventsViewInitialData } from "./components";
import type { EventListResponse } from "@/types/event";
import { getEvents } from "@/services/event";
import { EventPageCategories } from "@/types/event";

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

export default async function EventsView() {
  const initialData = await fetchInitialEvents();

  const initialCategories = EventPageCategories;

  return (
    <EventsViewClient
      initialData={initialData}
      initialCategories={initialCategories}
    />
  );
}
