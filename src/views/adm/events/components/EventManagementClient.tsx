"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSnackbar } from "notistack";
import {
    IoCalendar,
    IoTrash,
    IoCheckmarkCircle,
    IoWarning,
    IoCloseCircle,
    IoTime,
    IoSearch,
    IoEye
} from "react-icons/io5";
import { deleteEvent, approveEvent } from "@/services/admin";

// Interface untuk Event Admin
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

type EventManagementClientProps = {
    initialEvents: AdminEvent[];
};

// Helper function untuk mendapatkan style badge status
const getStatusBadge = (status: AdminEvent['status']) => {
    switch (status) {
        case 'PUBLISHED':
            return { icon: IoCheckmarkCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
        case 'DRAFT':
            return { icon: IoTime, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
        case 'CANCELED':
            return { icon: IoCloseCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
        case 'FINISHED':
            return { icon: IoWarning, color: 'text-gray-500', bg: 'bg-gray-500/10' };
        default:
            return { icon: IoWarning, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
};

export default function EventManagementClient({ initialEvents }: EventManagementClientProps) {
    const { data: session, status } = useSession(); // ✅ Get session
    const router = useRouter(); // ✅ Get router
    const { enqueueSnackbar } = useSnackbar(); // ✅ Get snackbar

    const [events, setEvents] = useState(initialEvents);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/auth/login");
        return null;
    }

    // ✅ Loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1-primary mx-auto mb-4"></div>
                    <div className="text-muted">Loading...</div>
                </div>
            </div>
        );
    }
    const handleApprove = async (id: string) => {
        try {
            if (!session?.access_token) {
                console.error("No token found");
                return;
            }

            await approveEvent(id, session.access_token);

            // Update UI langsung
            setEvents(prev =>
                prev.map(e =>
                    e.id === id ? { ...e, status: "PUBLISHED" } : e
                )
            );

            enqueueSnackbar("Event approved!", { variant: "success" });

        } catch (err) {
            console.error("Approve error:", err);
            enqueueSnackbar("Failed to approve event", { variant: "error" });
        }
    };

    // --- LOGIKA HAPUS EVENT ---
    const handleDelete = async (eventId: string, eventTitle: string) => {
        if (!confirm(`Are you sure you want to delete the event: "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        // ✅ Check session
        if (!session?.access_token) {
            enqueueSnackbar("You are not authenticated", { variant: "error" });
            return;
        }

        setIsDeleting(true);

        try {
            // ✅ Use real access token from session
            await deleteEvent(session.access_token, eventId);

            // Perbarui state setelah sukses dihapus
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

            enqueueSnackbar(`Event "${eventTitle}" successfully deleted`, { variant: "success" });

        } catch (error: unknown) {
            console.error("Failed to delete event:", error);

            const errorMessage = "Failed to delete event";
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setIsDeleting(false);
        }
    };
    // ----------------------------

    // --- LOGIKA FILTER SEARCH ---
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // ----------------------------

    return (
        <div className="min-h-screen bg-secondary py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-clear mb-2 flex items-center gap-3">
                        <IoCalendar className="h-8 w-8 text-accent1-primary" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
                            Event Management
                        </span>
                    </h1>
                    <p className="text-muted">Review and manage all events on the platform.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                        <p className="text-muted text-sm mb-1">Total Events</p>
                        <p className="text-3xl font-bold text-clear">{events.length}</p>
                    </div>
                    <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                        <p className="text-muted text-sm mb-1">Published</p>
                        <p className="text-3xl font-bold text-green-500">
                            {events.filter(e => e.status === 'PUBLISHED').length}
                        </p>
                    </div>
                    <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                        <p className="text-muted text-sm mb-1">Draft</p>
                        <p className="text-3xl font-bold text-yellow-500">
                            {events.filter(e => e.status === 'DRAFT').length}
                        </p>
                    </div>
                    <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                        <p className="text-muted text-sm mb-1">Finished</p>
                        <p className="text-3xl font-bold text-gray-500">
                            {events.filter(e => e.status === 'FINISHED').length}
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by title, organizer, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-tertiary text-clear border border-tertiary rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent1-primary transition"
                        />
                    </div>
                </div>

                <div className="bg-tertiary rounded-2xl shadow-xl overflow-hidden">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-10">
                            <IoWarning className="h-10 w-10 text-muted/50 mx-auto mb-3" />
                            <p className="text-muted">No events found matching the criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-secondary">
                                <thead className="bg-secondary">
                                    <tr>
                                        {['Title', 'Organizer', 'Date', 'Category', 'Status', 'Actions'].map(header => (
                                            <th
                                                key={header}
                                                className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {filteredEvents.map((event) => {
                                        const badge = getStatusBadge(event.status);
                                        return (
                                            <tr key={event.id} className="hover:bg-secondary/50 transition">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/events/${event.slug}`}
                                                        className="text-sm font-semibold text-clear hover:text-accent1-primary transition"
                                                    >
                                                        {event.title}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-muted">
                                                        {event.organizer.firstname} {event.organizer.lastname}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                                    {event.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.color}`}>
                                                        <badge.icon className="h-3 w-3" />
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {event.status === "DRAFT" && (
                                                            <button
                                                                onClick={() => handleApprove(event.id)}
                                                                className="text-green-500 hover:text-green-700 transition"
                                                                title="Approve Event"
                                                            >
                                                                <IoCheckmarkCircle className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/adm/events/${event.id}`}
                                                            className="text-accent1-primary hover:text-accent1-hover transition"
                                                            title="View Details"
                                                        >
                                                            <IoEye className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(event.id, event.title)}
                                                            disabled={isDeleting}
                                                            className="text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                                                            title="Delete Event"
                                                        >
                                                            <IoTrash className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Showing count */}
                <div className="mt-4 text-sm text-muted text-center">
                    Showing {filteredEvents.length} of {events.length} events
                </div>
            </div>
        </div>
    );
}