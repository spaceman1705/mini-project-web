"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    IoTicket,
    IoCalendar,
    IoTime,
    IoLocation,
    IoTrendingUp,
    IoHeart,
    IoArrowForward,
    IoSearch
} from "react-icons/io5";
import { getCustomerStats, getCustomerUpcomingEvents } from "@/services/dashboard";

// Type definitions
interface CustomerStats {
    activeTickets: number;
    upcomingEvents: number;
    favorites: number;
}

interface UpcomingEvent {
    id: string;
    title: string;
    slug: string;
    category: string;
    location: string;
    startDate: string;
    endDate: string;
    bannerImg?: string;
    ticketCount?: number;
}

export default function CustomerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState<CustomerStats>({
        activeTickets: 0,
        upcomingEvents: 0,
        favorites: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchData() {
            if (!session?.access_token) return;

            try {
                setLoading(true);

                // Fetch stats
                const statsResponse = await getCustomerStats(session.access_token);
                if (statsResponse?.data) {
                    setStats({
                        activeTickets: statsResponse.data.activeTickets || 0,
                        upcomingEvents: statsResponse.data.upcomingEvents || 0,
                        favorites: statsResponse.data.favorites || 0
                    });
                }

                // Fetch upcoming events
                const eventsResponse = await getCustomerUpcomingEvents(session.access_token);
                if (eventsResponse?.data && Array.isArray(eventsResponse.data)) {
                    setUpcomingEvents(eventsResponse.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Set default values on error
                setStats({ activeTickets: 0, upcomingEvents: 0, favorites: 0 });
                setUpcomingEvents([]);
            } finally {
                setLoading(false);
            }
        }

        if (session?.access_token) {
            fetchData();
        }
    }, [session?.access_token]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

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

    const statsData = [
        { label: "Active Tickets", value: stats.activeTickets.toString(), icon: IoTicket, color: "accent1" },
        { label: "Upcoming Events", value: stats.upcomingEvents.toString(), icon: IoCalendar, color: "accent2" },
        { label: "Favorites", value: stats.favorites.toString(), icon: IoHeart, color: "red" }
    ];

    return (
        <div className="min-h-screen bg-secondary py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-clear mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
                            {session.user.firstname}
                        </span>! 👋
                    </h1>
                    <p className="text-muted">Here&#39;s what&#39;s happening with your events</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                        <div key={index} className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted text-sm mb-1">{stat.label}</p>
                                    <p className="text-4xl font-bold text-clear">{stat.value}</p>
                                </div>
                                <div className={`bg-${stat.color}-500/10 p-4 rounded-xl`}>
                                    <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Events */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-clear">Your Upcoming Events</h2>
                            <Link
                                href="/me/tickets"
                                className="text-accent1-primary hover:text-accent1-hover text-sm font-semibold flex items-center gap-1"
                            >
                                View All <IoArrowForward />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <div key={event.id} className="bg-tertiary rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full md:w-48 h-48 md:h-auto bg-gradient-to-br from-accent1-primary to-accent2-primary"></div>
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="text-xs bg-accent1-primary/10 text-accent1-primary px-3 py-1 rounded-full font-semibold">
                                                            {event.category}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-clear mt-2">{event.title}</h3>
                                                    </div>
                                                    <button className="text-red-500 hover:text-red-600">
                                                        <IoHeart className="h-6 w-6" />
                                                    </button>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-muted text-sm">
                                                        <IoCalendar className="h-4 w-4" />
                                                        {new Date(event.startDate).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted text-sm">
                                                        <IoTime className="h-4 w-4" />
                                                        {new Date(event.startDate).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted text-sm">
                                                        <IoLocation className="h-4 w-4" />
                                                        {event.location}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button className="flex-1 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold py-2 rounded-lg hover:opacity-90 transition">
                                                        View Ticket
                                                    </button>
                                                    <button className="px-4 bg-secondary text-muted font-semibold py-2 rounded-lg hover:bg-secondary/80 transition">
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-tertiary rounded-2xl shadow-xl p-12 text-center">
                                    <IoTicket className="h-16 w-16 text-muted/30 mx-auto mb-4" />
                                    <p className="text-muted mb-4">No upcoming events yet</p>
                                    <Link
                                        href="/events"
                                        className="inline-flex items-center gap-2 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
                                    >
                                        <IoSearch className="h-5 w-5" />
                                        Explore Events
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-bold text-clear mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/events"
                                    className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                                >
                                    <IoSearch className="h-5 w-5 text-accent1-primary" />
                                    <span className="text-sm font-semibold text-clear">Browse Events</span>
                                </Link>
                                <Link
                                    href="/me/tickets"
                                    className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                                >
                                    <IoTicket className="h-5 w-5 text-accent2-primary" />
                                    <span className="text-sm font-semibold text-clear">My Tickets</span>
                                </Link>
                                <Link
                                    href="/me/transactions"
                                    className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                                >
                                    <IoTrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-semibold text-clear">Transactions</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-bold text-clear mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="bg-green-500/10 p-2 rounded-lg h-fit">
                                        <IoTicket className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-clear font-semibold">Ticket Purchased</p>
                                        <p className="text-xs text-muted">Tech Conference 2024</p>
                                        <p className="text-xs text-muted/60">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-red-500/10 p-2 rounded-lg h-fit">
                                        <IoHeart className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-clear font-semibold">Added to Favorites</p>
                                        <p className="text-xs text-muted">Music Festival</p>
                                        <p className="text-xs text-muted/60">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Events */}
                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-bold text-clear mb-4">Recommended For You</h3>
                            <div className="space-y-3">
                                <div className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition cursor-pointer">
                                    <p className="text-sm font-semibold text-clear mb-1">Art Exhibition</p>
                                    <p className="text-xs text-muted">National Gallery</p>
                                </div>
                                <div className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition cursor-pointer">
                                    <p className="text-sm font-semibold text-clear mb-1">Food Festival</p>
                                    <p className="text-xs text-muted">BSD City</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}