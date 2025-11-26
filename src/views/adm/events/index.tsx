"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getAllEvents } from "@/services/admin";
import EventManagementClient from "./components/EventManagementClient";

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELED' | 'FINISHED'; // ✅ Sesuaikan dengan Prisma schema
  organizer: {
    firstname: string;
    lastname: string;
  };
  createdAt: string;
}

export default function AdminEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.access_token) return;

      try {
        setLoading(true);

        const res = await getAllEvents(session.access_token);

        console.log("EVENT RESPONSE:", res);

        if (Array.isArray(res.data)) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.access_token]);

  if (loading) return <p>Loading...</p>;

  return <EventManagementClient initialEvents={events} />;

}
