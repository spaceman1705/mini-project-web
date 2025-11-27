"use client";

import EventsView from "@/views/events";
import { Suspense } from "react";

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsView />
    </Suspense>
  );
}