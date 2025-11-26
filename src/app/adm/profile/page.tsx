"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoPersonCircle, IoMail, IoShieldCheckmark, IoSettings, IoPeople, IoCalendar, IoStatsChart, IoPencil, IoGift } from "react-icons/io5";

export default function AdminProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

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

    return (
        <div className="min-h-screen bg-secondary py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
                        Admin Profile
                    </h1>
                    <p className="text-muted mt-2">System administrator account management</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <div className="md:col-span-2 bg-tertiary rounded-2xl shadow-xl p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-linear-to-r/oklch from-accent1-primary to-accent2-primary p-4 rounded-full">
                                    <IoShieldCheckmark className="h-12 w-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-clear">
                                        {session.user.firstname} {session.user.lastname}
                                    </h2>
                                    <p className="text-sm text-accent1-primary font-semibold">System Administrator</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-muted px-4 py-2 rounded-lg transition"
                            >
                                <IoPencil className="h-4 w-4" />
                                {isEditing ? "Cancel" : "Edit"}
                            </button>
                        </div>

                        {/* Admin Badge */}
                        <div className="bg-accent1-primary/10 border border-accent1-primary/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <IoShieldCheckmark className="h-6 w-6 text-accent1-primary" />
                                <div>
                                    <p className="text-sm font-semibold text-accent1-primary">Administrator Access</p>
                                    <p className="text-xs text-muted/60">Full system permissions and control</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted font-medium mb-2">
                                    <IoPersonCircle className="h-4 w-4" />
                                    First Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        defaultValue={session.user.firstname}
                                        className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                                    />
                                ) : (
                                    <p className="text-lg text-clear bg-secondary px-4 py-3 rounded-lg">
                                        {session.user.firstname}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted font-medium mb-2">
                                    <IoPersonCircle className="h-4 w-4" />
                                    Last Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        defaultValue={session.user.lastname}
                                        className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                                    />
                                ) : (
                                    <p className="text-lg text-clear bg-secondary px-4 py-3 rounded-lg">
                                        {session.user.lastname}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted font-medium mb-2">
                                    <IoMail className="h-4 w-4" />
                                    Admin Email
                                </label>
                                <p className="text-lg text-clear bg-secondary px-4 py-3 rounded-lg">
                                    {session.user.email}
                                </p>
                                <p className="text-xs text-muted/60 mt-1">Primary contact for system notifications</p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted font-medium mb-2">
                                    <IoGift className="h-4 w-4" />
                                    Refferal Code
                                </label>
                                <p className="text-lg text-clear bg-secondary px-4 py-3 rounded-lg">
                                    {session.user.refferalCode}
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted font-medium mb-2">
                                    <IoShieldCheckmark className="h-4 w-4" />
                                    Access Level
                                </label>
                                <p className="text-lg text-clear bg-secondary px-4 py-3 rounded-lg capitalize">
                                    {session.user.role} - Full Access
                                </p>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                    <button className="flex-1 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition">
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 bg-secondary text-muted font-semibold py-3 rounded-lg hover:bg-secondary/80 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Stats */}
                    <div className="space-y-6">
                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-accent1-primary/10 p-3 rounded-lg">
                                    <IoPeople className="h-6 w-6 text-accent1-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-clear">0</p>
                                    <p className="text-sm text-muted">Total Users</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-accent2-primary/10 p-3 rounded-lg">
                                    <IoCalendar className="h-6 w-6 text-accent2-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-clear">0</p>
                                    <p className="text-sm text-muted">Active Events</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-500/10 p-3 rounded-lg">
                                    <IoStatsChart className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-clear">0</p>
                                    <p className="text-sm text-muted">Reports</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-tertiary rounded-2xl shadow-xl p-6">
                            <p className="text-sm text-muted mb-2">Admin Since</p>
                            <p className="text-lg font-semibold text-clear">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}