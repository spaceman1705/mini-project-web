"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
  IoPeople,
  IoSearch,
  IoFilter,
  IoTrash,
  IoShieldCheckmark,
  IoPersonCircle,
  IoMail,
  IoCalendar,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTrendingUp
} from "react-icons/io5";
import { getAllUsers, updateUserRole, deleteUser } from "@/services/admin";

type Role = 'ADMIN' | 'ORGANIZER' | 'CUSTOMER';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
  isVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  _count?: {
    event: number;
    transaction: number;
    review: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState<Role>("CUSTOMER");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (!session?.access_token) {
        console.log("No access token available");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching users with token:", session.access_token.substring(0, 20) + "...");

        const response = await getAllUsers(session.access_token);
        console.log("API Response:", response);

        if (response && response.data) {
          setUsers(response.data);
          setFilteredUsers(response.data);
          enqueueSnackbar(`Loaded ${response.data.length} users successfully`, { variant: "success" });
        } else {
          console.error("Invalid response format:", response);
          enqueueSnackbar("Invalid data format received", { variant: "error" });
        }
      } catch (error: unknown) {
        console.error("Error fetching users:", error);

        const errorObj = error as { message?: string; response?: { data?: { message?: string; error?: string }; status?: number } };

        console.error("Error details:", errorObj.message);
        console.error("Error response:", errorObj.response?.data);
        console.error("Error status:", errorObj.response?.status);

        // Try to get detailed error message from backend
        let errorMessage = "Failed to load users";
        if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.response?.data?.error) {
          errorMessage = errorObj.response.data.error;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }

        enqueueSnackbar(errorMessage, { variant: "error" });

        // Show detailed error in console for debugging
        console.log("Full error object:", JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      fetchUsers();
    }
  }, [session?.access_token, enqueueSnackbar]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleUpdateRole = async () => {
    if (!session?.access_token || !selectedUser) return;

    try {
      await updateUserRole(session.access_token, selectedUser.id, newRole);
      enqueueSnackbar("User role updated successfully", { variant: "success" });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
      setShowModal(false);
    } catch (error) {
      enqueueSnackbar("Failed to update user role", { variant: "error" });
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!session?.access_token) return;
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    try {
      await deleteUser(session.access_token, userId);
      enqueueSnackbar("User deleted successfully", { variant: "success" });

      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    }
  };

  const getRoleBadge = (role: Role) => {
    const badges = {
      ADMIN: "bg-purple-500/10 text-purple-500",
      ORGANIZER: "bg-blue-500/10 text-blue-500",
      CUSTOMER: "bg-green-500/10 text-green-500"
    };
    return badges[role];
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1-primary mx-auto mb-4"></div>
          <div className="text-muted">Loading users...</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    organizers: users.filter(u => u.role === 'ORGANIZER').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
    verified: users.filter(u => u.isVerified).length
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary mb-2">
            User Management
          </h1>
          <p className="text-muted">Manage all users on the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-clear">{stats.total}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Admins</p>
            <p className="text-3xl font-bold text-purple-500">{stats.admins}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Organizers</p>
            <p className="text-3xl font-bold text-blue-500">{stats.organizers}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Customers</p>
            <p className="text-3xl font-bold text-green-500">{stats.customers}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Verified</p>
            <p className="text-3xl font-bold text-accent1-primary">{stats.verified}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-tertiary rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border border-tertiary rounded-lg pl-12 pr-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <IoFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
                className="bg-secondary border border-tertiary rounded-lg pl-12 pr-8 py-3 text-clear outline-none focus:border-accent1-primary transition appearance-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-tertiary rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Activity</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-secondary hover:bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent1-primary to-accent2-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <IoPersonCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-clear">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-xs text-muted">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <IoMail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <div className="flex items-center gap-2 text-green-500 text-sm">
                          <IoCheckmarkCircle className="h-5 w-5" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-500 text-sm">
                          <IoCloseCircle className="h-5 w-5" />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user._count ? (
                        <div className="space-y-1 text-xs text-muted">
                          <div className="flex items-center gap-1">
                            <IoCalendar className="h-3 w-3" />
                            <span>{user._count.event || 0} events</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IoTrendingUp className="h-3 w-3" />
                            <span>{user._count.transaction || 0} transactions</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowModal(true);
                          }}
                          className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition text-accent1-primary"
                          title="Change Role"
                        >
                          <IoShieldCheckmark className="h-5 w-5" />
                        </button>

                        {user.id !== session.user.id && (
                          <button
                            onClick={() => handleDelete(user.id, `${user.firstname} ${user.lastname}`)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition text-red-500"
                            title="Delete User"
                          >
                            <IoTrash className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <IoPeople className="h-16 w-16 text-muted/30 mx-auto mb-4" />
              <p className="text-muted">No users found</p>
            </div>
          )}
        </div>

        {/* Change Role Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-tertiary rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-clear">Change User Role</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-muted hover:text-clear transition"
                  >
                    <IoCloseCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-muted font-semibold">User</label>
                    <p className="text-clear mt-1 font-bold">
                      {selectedUser.firstname} {selectedUser.lastname}
                    </p>
                    <p className="text-muted text-sm">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted font-semibold mb-2 block">
                      Current Role
                    </label>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getRoleBadge(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-muted font-semibold mb-2 block">
                      New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as Role)}
                      className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateRole}
                    className="flex-1 bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
                  >
                    Update Role
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 bg-secondary text-muted font-semibold py-3 rounded-lg hover:bg-secondary/80 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}