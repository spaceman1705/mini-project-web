"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  IoCalendar,
  IoPeople,
  IoTrendingUp,
  IoTicket,
  IoAdd,
  IoEye,
  IoStatsChart,
  IoTime
} from "react-icons/io5";

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Mock data
  const stats = [
    { label: "Active Events", value: "5", change: "+2", icon: IoCalendar, color: "accent1" },
    { label: "Total Attendees", value: "1,234", change: "+156", icon: IoPeople, color: "accent2" },
    { label: "Revenue", value: "$12,450", change: "+$2,340", icon: IoTrendingUp, color: "green" },
    { label: "Tickets Sold", value: "856", change: "+89", icon: IoTicket, color: "blue" }
  ];

  const recentEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      status: "Active",
      attendees: 234,
      revenue: "$5,600",
      date: "2024-12-25",
      ticketsSold: 234,
      totalTickets: 500
    },
    {
      id: 2,
      title: "Music Festival",
      status: "Active",
      attendees: 456,
      revenue: "$8,900",
      date: "2024-12-30",
      ticketsSold: 456,
      totalTickets: 1000
    }
  ];

  const upcomingSales = [
    { day: "Mon", sales: 45 },
    { day: "Tue", sales: 67 },
    { day: "Wed", sales: 89 },
    { day: "Thu", sales: 56 },
    { day: "Fri", sales: 123 },
    { day: "Sat", sales: 145 },
    { day: "Sun", sales: 98 }
  ];

  const maxSales = Math.max(...upcomingSales.map(d => d.sales));

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clear mb-2">
              Organizer <span className="text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
                Dashboard
              </span>
            </h1>
            <p className="text-muted">Monitor your events and track performance</p>
          </div>
          <Link
            href="/org/events/create"
            className="flex items-center gap-2 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <IoAdd className="h-5 w-5" />
            Create Event
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-tertiary rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-${stat.color}-500/10 p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-semibold">
                  {stat.change}
                </span>
              </div>
              <p className="text-muted text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-clear">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events Table */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-clear">Your Events</h2>
                <Link
                  href="/org/events"
                  className="text-accent1-primary hover:text-accent1-hover text-sm font-semibold"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-clear">{event.title}</h3>
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-semibold">
                            {event.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <IoTime className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Attendees</p>
                        <p className="text-lg font-bold text-clear">{event.attendees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Revenue</p>
                        <p className="text-lg font-bold text-green-500">{event.revenue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Tickets</p>
                        <p className="text-lg font-bold text-clear">{event.ticketsSold}/{event.totalTickets}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r/oklch from-accent1-primary to-accent2-primary"
                          style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {Math.round((event.ticketsSold / event.totalTickets) * 100)}% tickets sold
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-tertiary hover:bg-tertiary/80 text-clear font-semibold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2">
                        <IoEye className="h-4 w-4" />
                        View Details
                      </button>
                      <button className="flex-1 bg-tertiary hover:bg-tertiary/80 text-clear font-semibold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2">
                        <IoStatsChart className="h-4 w-4" />
                        Analytics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-clear mb-6">Weekly Ticket Sales</h2>
              <div className="flex items-end justify-between gap-2 h-48">
                {upcomingSales.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-secondary rounded-t-lg relative" style={{ height: `${(data.sales / maxSales) * 100}%` }}>
                      <div className="absolute inset-0 bg-linear-to-t/oklch from-accent1-primary to-accent2-primary rounded-t-lg"></div>
                    </div>
                    <p className="text-xs text-muted font-semibold">{data.day}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Avg. Ticket Price</span>
                  <span className="text-lg font-bold text-clear">$14.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Conversion Rate</span>
                  <span className="text-lg font-bold text-green-500">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Total Events</span>
                  <span className="text-lg font-bold text-clear">12</span>
                </div>
              </div>
            </div>

            {/* Top Performing */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">Top Performing</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-secondary p-3 rounded-lg">
                  <div className="bg-accent1-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-clear">Music Festival</p>
                    <p className="text-xs text-muted">456 tickets</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-secondary p-3 rounded-lg">
                  <div className="bg-accent2-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-clear">Tech Conference</p>
                    <p className="text-xs text-muted">234 tickets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-500">
                      ★★★★★
                    </div>
                  </div>
                  <p className="text-xs text-muted">"Amazing event! Well organized."</p>
                  <p className="text-xs text-muted/60 mt-1">- John Doe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}