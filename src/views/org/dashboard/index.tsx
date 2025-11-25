"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
  IoCalendarOutline,
  IoTicketOutline,
  IoTrendingUp,
  IoCashOutline,
  IoAddCircle,
  IoEyeOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoEllipsisVertical,
  IoCreate,
  IoTrash,
  IoAnalytics,
  IoPeople
} from "react-icons/io5";
import {
  getOrganizerStats,
  getOrganizerEvents,
  getOrganizerWeeklySales,
  deleteOrganizerEvent
} from "@/services/dashboard";

interface Stats {
  activeEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  ticketsSold: number;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  availableSeats: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  image?: string;
  _count?: {
    transaction: number;
  };
}

interface WeeklySale {
  day: string;
  sales: number;
}

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [stats, setStats] = useState<Stats>({
    activeEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    ticketsSold: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!session?.access_token) return;

      try {
        setLoading(true);

        // Fetch data dari API
        const [statsResponse, eventsResponse, salesResponse] = await Promise.all([
          getOrganizerStats(session.access_token),
          getOrganizerEvents(session.access_token),
          getOrganizerWeeklySales(session.access_token)
        ]);

        console.log("Stats:", statsResponse);
        console.log("Events:", eventsResponse);
        console.log("Weekly Sales:", salesResponse);

        setStats(statsResponse.data);
        setEvents(eventsResponse.data);
        setWeeklySales(salesResponse.data);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        enqueueSnackbar("Failed to load dashboard data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      fetchDashboardData();
    }
  }, [session?.access_token, enqueueSnackbar]);

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: "bg-yellow-500/10 text-yellow-500",
      APPROVED: "bg-green-500/10 text-green-500",
      REJECTED: "bg-red-500/10 text-red-500"
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  const getStatusIcon = (status: string) => {
    if (status === "APPROVED") return <IoCheckmarkCircle className="h-4 w-4" />;
    if (status === "REJECTED") return <IoCloseCircle className="h-4 w-4" />;
    return <IoTimeOutline className="h-4 w-4" />;
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;
    if (!session?.access_token) return;

    try {
      await deleteOrganizerEvent(session.access_token, eventId);

      setEvents(prev => prev.filter(e => e.id !== eventId));
      enqueueSnackbar("Event deleted successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete event", { variant: "error" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1-primary mx-auto mb-4"></div>
          <div className="text-muted">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Calculate additional stats
  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;
  const pendingApproval = events.filter(e => e.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-muted">Welcome back, {session.user.firstname}!</p>
          </div>
          <button
            onClick={() => router.push("/org/events/create")}
            className="flex items-center gap-2 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition shadow-lg"
          >
            <IoAddCircle className="h-5 w-5" />
            Create Event
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-tertiary rounded-2xl shadow-xl p-6 border-l-4 border-accent1-primary">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Active Events</p>
              <IoCalendarOutline className="h-8 w-8 text-accent1-primary opacity-20" />
            </div>
            <p className="text-3xl font-bold text-clear">{stats.activeEvents}</p>
          </div>

          <div className="bg-tertiary rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Upcoming</p>
              <IoTimeOutline className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
            <p className="text-3xl font-bold text-clear">{upcomingEvents}</p>
          </div>

          <div className="bg-tertiary rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Tickets Sold</p>
              <IoTicketOutline className="h-8 w-8 text-green-500 opacity-20" />
            </div>
            <p className="text-3xl font-bold text-clear">{stats.ticketsSold}</p>
          </div>

          <div className="bg-tertiary rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Total Revenue</p>
              <IoCashOutline className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-clear">
              Rp {(stats.totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-tertiary rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Pending</p>
              <IoTimeOutline className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
            <p className="text-3xl font-bold text-clear">{pendingApproval}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-clear">My Events</h2>
                <button
                  onClick={() => router.push("/organizer/events")}
                  className="text-accent1-primary hover:underline text-sm font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-clear group-hover:text-accent1-primary transition">
                            {event.title}
                          </h3>
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadge(event.status)}`}>
                            {getStatusIcon(event.status)}
                            {event.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-muted mb-3">
                          <p className="flex items-center gap-2">
                            <IoCalendarOutline className="h-4 w-4" />
                            {new Date(event.startDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="flex items-center gap-2">
                            <IoTicketOutline className="h-4 w-4" />
                            {event.availableSeats} seats • Rp {event.price.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-green-500">
                            <IoTrendingUp className="h-4 w-4" />
                            <span className="font-semibold">{event._count?.transaction || 0} sold</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                          className="p-2 hover:bg-tertiary rounded-lg transition text-muted"
                        >
                          <IoEllipsisVertical className="h-5 w-5" />
                        </button>

                        {activeMenu === event.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-tertiary rounded-lg shadow-xl border border-secondary z-10">
                            <button
                              onClick={() => {
                                router.push(`/organizer/events/${event.id}`);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-clear text-sm"
                            >
                              <IoEyeOutline className="h-5 w-5" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/organizer/events/${event.id}/edit`);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-clear text-sm"
                            >
                              <IoCreate className="h-5 w-5" />
                              Edit Event
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/organizer/events/${event.id}/analytics`);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-clear text-sm"
                            >
                              <IoAnalytics className="h-5 w-5" />
                              Analytics
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteEvent(event.id, event.title);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-red-500 text-sm border-t border-secondary"
                            >
                              <IoTrash className="h-5 w-5" />
                              Delete Event
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {events.length === 0 && (
                <div className="text-center py-12">
                  <IoCalendarOutline className="h-16 w-16 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted mb-4">You haven&apos;t created any events yet</p>
                  <button
                    onClick={() => router.push("/organizer/events/create")}
                    className="text-accent1-primary hover:underline font-semibold"
                  >
                    Create your first event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Sales Chart */}
          <div className="lg:col-span-1">
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-clear mb-6">Weekly Sales</h2>

              <div className="space-y-3">
                {weeklySales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted font-medium w-12">{sale.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent1-primary to-accent2-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (sale.sales / Math.max(...weeklySales.map(s => s.sales))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-clear w-8 text-right">{sale.sales}</span>
                  </div>
                ))}
              </div>

              {weeklySales.every(s => s.sales === 0) && (
                <div className="text-center py-8">
                  <IoTrendingUp className="h-12 w-12 text-muted/30 mx-auto mb-3" />
                  <p className="text-muted text-sm">No sales data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}