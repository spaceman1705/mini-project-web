// src/services/event/index.ts

import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  EventListResponse,
  EventDetailResponse,
  MyEventsResponse,
  GetEventsParams,
  GetMyEventsParams,
  CreateEventPayload,
  UpdateEventPayload,
  TicketTypeInput,
  CreateVoucherPayload,
} from "@/types/event";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

// helper sama seperti di services/dashboard
const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export async function getEvents(params: GetEventsParams = {}) {
  try {
    const { data } = await axios.get<EventListResponse>(`${baseUrl}/events`, {
      params,
    });

    return data;
  } catch (err) {
    console.error("getEvents error:", err);
    throw err;
  }
}

export async function getEventDetail(slug: string) {
  try {
    const { data } = await axios.get<EventDetailResponse>(
      `${baseUrl}/events/${slug}`,
    );

    return data;
  } catch (err) {
    console.error("getEventDetail error:", err);
    throw err;
  }
}

export async function getMyEvents(
  token: string,
  params: GetMyEventsParams = {},
) {
  try {
    const { data } = await axios.get<MyEventsResponse>(`${baseUrl}/events/me`, {
      params,
      headers: getAuthHeader(token),
    });

    return data;
  } catch (err) {
    console.error("getMyEvents error:", err);
    throw err;
  }
}

export async function createEventApi(
  token: string,
  payload: CreateEventPayload,
) {
  try {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("category", payload.category);
    formData.append("location", payload.location);
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);
    formData.append("price", String(payload.price));
    formData.append("availableSeats", String(payload.availableSeats));

    if (payload.status) {
      formData.append("status", payload.status);
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

    const { data } = await axios.post<ApiResponse>(
      `${baseUrl}/events`,
      formData,
      {
        headers: {
          ...getAuthHeader(token),
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  } catch (err) {
    console.error("createEventApi error:", err);
    throw err;
  }
}

export async function updateEventApi(
  token: string,
  eventId: string,
  payload: UpdateEventPayload,
) {
  try {
    const { data } = await axios.patch<ApiResponse>(
      `${baseUrl}/events/${eventId}`,
      payload,
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("updateEventApi error:", err);
    throw err;
  }
}

export async function publishEventApi(token: string, eventId: string) {
  try {
    const { data } = await axios.patch<ApiResponse>(
      `${baseUrl}/events/${eventId}/publish`,
      {},
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("publishEventApi error:", err);
    throw err;
  }
}

export async function cancelEventApi(token: string, eventId: string) {
  try {
    const { data } = await axios.patch<ApiResponse>(
      `${baseUrl}/events/${eventId}/cancel`,
      {},
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("cancelEventApi error:", err);
    throw err;
  }
}

export async function addTicketTypesApi(
  token: string,
  eventId: string,
  items: TicketTypeInput[],
) {
  try {
    const { data } = await axios.post<ApiResponse>(
      `${baseUrl}/events/${eventId}/tickets`,
      { items },
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("addTicketTypesApi error:", err);
    throw err;
  }
}

export async function createVoucherApi(
  token: string,
  eventId: string,
  payload: CreateVoucherPayload,
) {
  try {
    const { data } = await axios.post<ApiResponse>(
      `${baseUrl}/events/${eventId}/vouchers`,
      payload,
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("createVoucherApi error:", err);
    throw err;
  }
}
