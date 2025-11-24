import { notFound } from "next/navigation";

import type { EventDetail } from "@/types/event";
import { getEventDetail } from "@/services/event";
import EventDetailViewClient from "./components";

type EventDetailViewProps = {
  slug: string;
};

async function fetchEventDetail(slug: string): Promise<EventDetail | null> {
  try {
    const res = await getEventDetail(slug);
    return res.data;
  } catch (err) {
    console.error("[EventDetail] Error saat fetch event detail:", err);
    return null;
  }
}

export default async function EventDetailView({ slug }: EventDetailViewProps) {
  const event = await fetchEventDetail(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailViewClient event={event} />;
}
