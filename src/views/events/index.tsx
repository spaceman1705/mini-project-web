"use client";

import { useEffect, useState } from "react";
import EventsViewClient, { type EventsViewInitialData } from "./components";
import type { EventListResponse } from "@/types/event";
import { getEvents } from "@/services/event";
import { EventPageCategories } from "@/types/event";

const defaultPage = 1;
const defaultPageSize = 12;

export default function EventsView() {
  const [initialData, setInitialData] = useState<EventsViewInitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialEvents() {
      try {
        setLoading(true);

        const response: EventListResponse = await getEvents({
          page: defaultPage,
          pageSize: defaultPageSize,
          sort: "newest",
        });

        console.log("📦 Events response:", response);

        const data = response.data;

        setInitialData({
          items: data.items,
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
        });
      } catch (error) {
        console.error("[Events] Error saat fetch events:", error);
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialEvents();
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
    <EventsViewClient
      initialData={initialData}
      initialCategories={EventPageCategories}
    />
  );
}