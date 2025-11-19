"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

export default function AdminDashboard() {
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
    { label: "Total Users", value: "2,453", change: "+124", icon: IoPeople, color: "accent1" },
    { label: "Active Events", value: "156", change: "+23", icon: IoCalendar, color: "accent2" },
    { label: "Platform Revenue", value: "$45,280", change: "+$5,420", icon: IoTrendingUp, color: "green" },
    { label: "System Health", value: "98%", change: "+2%", icon: IoShieldCheckmark, color: "blue" }
  ];

  const recentUsers = [
    { name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", joined: "2 hours ago" },
    { name: "Jane Smith", email: "jane@example.com", role: "Organizer", status: "Active", joined: "5 hours ago" },
    { name: "Bob Johnson", email: "bob@example.com", role: "Customer", status: "Pending", joined: "1 day ago" }
  ];

  const pendingEvents = [
    { id: 1, title: "Tech Summit 2024", organizer: "TechCorp", status: "Pending", submitted: "1 hour ago" },
    { id: 2, title: "Art Exhibition", organizer: "Gallery Inc", status: "Pending", submitted: "3 hours ago" }
  ];

  const systemAlerts = [
    { type: "warning", message: "High server load detected", time: "10 min ago" },
    { type: "info", message: "Database backup completed", time: "1 hour ago" },
    { type: "success", message: "System update successful", time: "2 hours ago" }
  ];

  const userGrowth = [
    { month: "Jan", users: 1200 },
    { month: "Feb", users: 1450 },
    { month: "Mar", users: 1680 },
    { month: "Apr", users: 1890 },
    { month: "May", users: 2120 },
    { month: "Jun", users: 2453 }
  ];

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
                {recentUsers.map((user, index) => (
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
                ))}
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
                {pendingEvents.map((event) => (
                  <div key={event.id} className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-clear mb-1">{event.title}</h3>
                        <p className="text-xs text-muted">by {event.organizer}</p>
                        <div className="flex items-center gap-2 text-xs text-muted/60 mt-1">
                          <IoTime className="h-3 w-3" />
                          {event.submitted}
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full font-semibold">
                        {event.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-xs">
                        Approve
                      </button>
                      <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition text-xs">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            <div className="bg-tertiary rounded-2xl shadow-xl p-6">
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
            </div>

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