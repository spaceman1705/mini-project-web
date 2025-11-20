import axios, { type AxiosRequestConfig } from "axios";
import type { EventListResponse } from "@/types/event";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export type EventSortOption = "newest" | "oldest" | "price_asc" | "price_desc";

export type GetEventsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  title?: string;
  category?: string;
  location?: string;
  date?: string;
  start?: string;
  end?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: EventSortOption;
};

export async function getEvents(
  params: GetEventsParams = {},
  config: AxiosRequestConfig = {},
): Promise<EventListResponse> {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API_URL is not set in .env.local");
  }

  try {
    const { data } = await axios.get<EventListResponse>(`${baseUrl}/events`, {
      params,
      ...config,
    });

    return data;
  } catch (error) {
    console.error("[EventService] Fetch events fail:", error);
    throw error;
  }
}
