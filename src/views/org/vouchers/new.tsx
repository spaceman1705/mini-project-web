"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { getMyEvents } from "@/services/event";
import type {
  GetMyEventsParams,
  MyEventsListData,
  MyEventListItem,
} from "@/types/event";

function getAccessTokenFromSession(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;

  const s = session as {
    accessToken?: string | null;
    access_token?: string | null;
    token?: string | null;
    user?: {
      accessToken?: string | null;
      access_token?: string | null;
    };
  };

  return (
    s.accessToken ??
    s.access_token ??
    s.user?.accessToken ??
    s.user?.access_token ??
    s.token ??
    null
  );
}

export default function NewVoucherSelectEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const accessToken = getAccessTokenFromSession(session);

  const [events, setEvents] = useState<MyEventListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      if (!accessToken || status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const params: GetMyEventsParams = {
          page: 1,
          pageSize: 50,
          status: "ALL",
          sort: "newest",
        };

        const response = await getMyEvents(accessToken, params);
        if (cancelled) return;

        const data = response.data as MyEventsListData;
        setEvents(data.items);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load your events.";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [accessToken, status]);

  const handleSelectEvent = (eventId: string) => {
    console.log("Selected eventId:", eventId);

    router.push(`/org/events/${eventId}/vouchers`);
  };

  const handleClose = () => {
    router.push("/org/events");
  };

  return (
    <main className="bg-secondary/60 relative min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/30" />

      <div className="mx-auto flex max-w-2xl items-center justify-center">
        <section className="border-lines bg-tertiary w-full rounded-2xl border shadow-lg">
          <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="text-muted text-[11px] font-semibold tracking-widest uppercase">
                Event promotions
              </p>
              <h1 className="text-sm font-semibold tracking-tight">
                Select event for voucher
              </h1>
              <p className="text-muted mt-1 text-xs">
                Choose one of your events to create a voucher for.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-muted hover:text-clear text-xs"
            >
              Close
            </button>
          </header>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-3">
            {loading && (
              <div className="border-lines bg-secondary text-muted rounded-xl border px-3 py-2 text-xs">
                Loading your events…
              </div>
            )}

            {error && !loading && (
              <div className="border-lines bg-error-bg text-error-text rounded-xl border px-3 py-2 text-xs">
                {error}
              </div>
            )}

            {!loading && !error && events.length === 0 && (
              <div className="border-lines bg-secondary text-muted rounded-xl border px-3 py-3 text-xs">
                You do not have any events yet. Create an event first before
                creating vouchers.
              </div>
            )}

            {!loading &&
              !error &&
              events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelectEvent(event.id)}
                  className="border-lines bg-secondary hover:bg-primary-invert hover:text-clear-invert flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold">
                      {event.title}
                    </span>
                    <span className="text-muted mt-0.5">
                      {event.location} •{" "}
                      {new Date(event.startDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold tracking-widest uppercase">
                    Select
                  </span>
                </button>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
