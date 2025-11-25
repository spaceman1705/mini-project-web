"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IoPeople,
  IoCalendar,
  IoTrendingUp,
  IoShieldCheckmark,
  IoWarning,
  IoCheckmarkCircle,
  IoStatsChart,
  IoTime
} from "react-icons/io5";
import {
  getAdminStats,
  getAdminRecentUsers,
  getAdminPendingEvents,
  getAdminUserGrowth
} from "@/services/dashboard";

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  platformRevenue: number;
  systemHealth: number;
}

interface RecentUser {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  organizer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  status: string;
  submitted: string;
}

interface UserGrowth {
  month: string;
  users: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeEvents: 0,
    platformRevenue: 0,
    systemHealth: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
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
        const statsResponse = await getAdminStats(session.access_token);
        if (statsResponse?.data) {
          setStats({
            totalUsers: statsResponse.data.totalUsers || 0,
            activeEvents: statsResponse.data.activeEvents || 0,
            platformRevenue: statsResponse.data.platformRevenue || 0,
            systemHealth: statsResponse.data.systemHealth || 0
          });
        }

        // Fetch recent users
        const usersResponse = await getAdminRecentUsers(session.access_token, 3);
        if (usersResponse?.data && Array.isArray(usersResponse.data)) {
          setRecentUsers(usersResponse.data);
        }

        // Fetch pending events
        const eventsResponse = await getAdminPendingEvents(session.access_token);
        if (eventsResponse?.data && Array.isArray(eventsResponse.data)) {
          setPendingEvents(eventsResponse.data);
        }

        // Fetch user growth
        const growthResponse = await getAdminUserGrowth(session.access_token);
        if (growthResponse?.data && Array.isArray(growthResponse.data)) {
          setUserGrowth(growthResponse.data);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      fetchData();
    }
  }, [session?.access_token]);

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
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      change: stats.totalUsers > 0 ? `+${Math.floor(stats.totalUsers * 0.05)}` : "+0",
      icon: IoPeople,
      color: "accent1"
    },
    {
      label: "Active Events",
      value: stats.activeEvents.toString(),
      change: stats.activeEvents > 0 ? `+${Math.floor(stats.activeEvents * 0.1)}` : "+0",
      icon: IoCalendar,
      color: "accent2"
    },
    {
      label: "Platform Revenue",
      value: `${stats.platformRevenue.toFixed(2)}`,
      change: stats.platformRevenue > 0 ? `+${(stats.platformRevenue * 0.12).toFixed(0)}` : "+$0",
      icon: IoTrendingUp,
      color: "green"
    },
    {
      label: "System Health",
      value: `${stats.systemHealth}%`,
      change: "+2%",
      icon: IoShieldCheckmark,
      color: "blue"
    }
  ];
  console.log("pending event api result: ", pendingEvents);

  const maxUsers = Math.max(...userGrowth.map(d => d.users));

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-clear mb-2">
            Admin <span className="text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
              Dashboard
            </span>
          </h1>
          <p className="text-muted">Platform overview and system management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Growth Chart */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-clear mb-6">User Growth</h2>
              <div className="flex items-end justify-between gap-2 h-48">
                {userGrowth.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-clear font-semibold mb-1">{data.users}</div>
                    <div className="w-full bg-secondary rounded-t-lg relative" style={{ height: `${(data.users / maxUsers) * 100}%` }}>
                      <div className="absolute inset-0 bg-linear-to-t/oklch from-accent1-primary to-accent2-primary rounded-t-lg"></div>
                    </div>
                    <p className="text-xs text-muted font-semibold">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-clear">Recent Users</h2>
                <Link
                  href="/adm/users"
                  className="text-accent1-primary hover:text-accent1-hover text-sm font-semibold"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user, index) => (
                    <div key={index} className="bg-secondary rounded-xl p-4 flex items-center justify-between hover:bg-secondary/80 transition">
                      <div className="flex items-center gap-4">
                        <div className="bg-linear-to-r/oklch from-accent1-primary to-accent2-primary p-3 rounded-full">
                          <IoPeople className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-clear">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-accent1-primary/10 text-accent1-primary px-2 py-0.5 rounded-full font-semibold">
                              {user.role}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.status === 'Active'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted/60">{user.joined}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted text-center py-4">No recent users</p>
                )}
              </div>
            </div>

            {/* Pending Events */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-clear">Pending Approvals</h2>
                <Link
                  href="/adm/events"
                  className="text-accent1-primary hover:text-accent1-hover text-sm font-semibold"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {pendingEvents.length > 0 ? (
                  pendingEvents.map((event) => (
                    <div key={event.id} className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-clear mb-1">{event.title}</h3>
                          <p className="text-xs text-muted">
                            by {event.organizer.firstname} {event.organizer.lastname} {event.organizer.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted/60 mt-1">
                            <IoTime className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full font-semibold">
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-xs">
                          Approve
                        </button>
                        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition text-xs">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted text-center py-4">No pending events</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            {/* <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">System Alerts</h3>
              <div className="space-y-3">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="bg-secondary p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      {alert.type === 'warning' && <IoWarning className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                      {alert.type === 'success' && <IoCheckmarkCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      {alert.type === 'info' && <IoShieldCheckmark className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-xs text-clear font-semibold">{alert.message}</p>
                        <p className="text-xs text-muted/60 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Quick Actions */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/adm/users"
                  className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                >
                  <IoPeople className="h-5 w-5 text-accent1-primary" />
                  <span className="text-sm font-semibold text-clear">Manage Users</span>
                </Link>
                <Link
                  href="/adm/events"
                  className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                >
                  <IoCalendar className="h-5 w-5 text-accent2-primary" />
                  <span className="text-sm font-semibold text-clear">Manage Events</span>
                </Link>
                <Link
                  href="/adm/reports"
                  className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                >
                  <IoStatsChart className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-semibold text-clear">View Reports</span>
                </Link>
                <Link
                  href="/adm/settings"
                  className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 p-4 rounded-lg transition"
                >
                  <IoShieldCheckmark className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-semibold text-clear">System Settings</span>
                </Link>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-clear mb-4">Platform Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Uptime</span>
                  <span className="text-lg font-bold text-green-500">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">API Calls</span>
                  <span className="text-lg font-bold text-clear">1.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Storage Used</span>
                  <span className="text-lg font-bold text-clear">234 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Bandwidth</span>
                  <span className="text-lg font-bold text-clear">4.5 TB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}