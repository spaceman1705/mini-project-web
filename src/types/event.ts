export type EventCategory =
  | "Music"
  | "Nightlife"
  | "Art"
  | "Holiday"
  | "Dating"
  | "Hobby"
  | "Business"
  | "Food & Drink";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCEL" | "FINISHED";

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number | null;
  availableSeats: number;
  bannerImg: string | null;
  status: EventStatus;
};

export type EventListData = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EventListResponse = {
  message: string;
  data: EventListData;
};

export type HomeEvent = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  date: string;
  price: number | null;
  bannerImg?: string | null;
  tags?: ("Online" | "Family" | "Limited")[];
};
