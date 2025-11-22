import type { ApiResponse } from "./api";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELED" | "FINISHED";

export type EventCategory =
  | "Music"
  | "Nightlife"
  | "Art"
  | "Holiday"
  | "Dating"
  | "Hobby"
  | "Business"
  | "Food & Drink";

export type EventTag = "Online" | "Family" | "Limited";

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  category: EventCategory | string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  bannerImg?: string | null;
  availableSeats?: number | null;
};

export type EventListData = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EventListResponse = ApiResponse<EventListData>;

// for /events/categories endpoint
export type EventCategoriesResponse = ApiResponse<string[]>;

export type EventDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  status: EventStatus;
  bannerImg?: string | null;
  organizer: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  ticketType: {
    id: string;
    name: string;
    description: string;
    price: number;
    quota: number;
    availableQuota: number;
  }[];
  voucher: {
    id: string;
    code: string;
    discountAmount: number;
    expiredAt: string;
    maxUsage: number | null;
    usedCount: number;
  }[];
  review: {
    rating: number;
    comment: string | null;
    createdAt: string;
  }[];
};

export type EventDetailResponse = ApiResponse<EventDetail>;

export type MyEventListItem = {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  bannerImg?: string | null;
};

export type MyEventsListData = {
  items: MyEventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type MyEventsResponse = ApiResponse<MyEventsListData>;

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

export type GetMyEventsParams = {
  page?: number;
  pageSize?: number;
  status?: EventStatus;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  status?: EventStatus;
  image?: File | null;
};

export type UpdateEventPayload = {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  availableSeats?: number;
  status?: EventStatus;
};

export type TicketTypeInput = {
  name: string;
  description?: string;
  price: number;
  quota: number;
};

export type CreateVoucherPayload = {
  code: string;
  discountAmount: number;
  expiredAt: string;
  maxUsage?: number;
};

export type HomeEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  date: string;
  price: number | null;
  bannerImg?: string | null;
  tags?: EventTag[];
};
