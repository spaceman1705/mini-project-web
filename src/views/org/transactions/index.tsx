"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import Image from "next/image";
import {
  IoReceiptOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoEyeOutline,
  IoPersonCircle,
  IoCalendarOutline,
  IoLocationOutline,
  IoTicketOutline,
  IoCashOutline,
  IoAlertCircle,
  IoFilter,
  IoSearch
} from "react-icons/io5";
import {
  getOrganizerTransactions,
  acceptTransaction,
  rejectTransaction
} from "@/services/transaction";

type TransactionStatus = 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'DONE' | 'REJECTED' | 'EXPIRED' | 'CANCELED';

interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  totalPrice: number;
  pointsUsed: number;
  discountAmount: number;
  status: TransactionStatus;
  paymentProof?: string;
  createdAt: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
    location: string;
  };
  transactionItem: Array<{
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    ticketType?: {
      name: string;
      description: string;
      price: number;
    };
  }>;
}

export default function OrganizerTransactions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTransactions() {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        const response = await getOrganizerTransactions(session.access_token);
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        enqueueSnackbar("Failed to load transactions", { variant: "error" });
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      fetchTransactions();
    }
  }, [session?.access_token, enqueueSnackbar]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [statusFilter, searchQuery, transactions]);

  const handleAccept = async (transactionId: string) => {
    if (!session?.access_token) return;
    if (!confirm("Accept this payment? This action cannot be undone.")) return;

    try {
      setActionLoading(true);
      await acceptTransaction(session.access_token, transactionId);

      // Update local state
      setTransactions(prev => prev.map(t =>
        t.id === transactionId ? { ...t, status: 'DONE' as TransactionStatus } : t
      ));

      setShowModal(false);
      enqueueSnackbar("Payment accepted successfully", { variant: "success" });
    } catch (error) {
      console.error("Error accepting transaction:", error);
      enqueueSnackbar("Failed to accept payment", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!session?.access_token || !selectedTransaction) return;

    try {
      setActionLoading(true);
      await rejectTransaction(session.access_token, selectedTransaction.id, rejectReason);

      // Update local state
      setTransactions(prev => prev.map(t =>
        t.id === selectedTransaction.id ? { ...t, status: 'REJECTED' as TransactionStatus } : t
      ));

      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason("");
      enqueueSnackbar("Payment rejected", { variant: "success" });
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      enqueueSnackbar("Failed to reject payment", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const badges = {
      WAITING_PAYMENT: "bg-yellow-500/10 text-yellow-500",
      WAITING_CONFIRMATION: "bg-blue-500/10 text-blue-500",
      DONE: "bg-green-500/10 text-green-500",
      REJECTED: "bg-red-500/10 text-red-500",
      EXPIRED: "bg-gray-500/10 text-gray-500",
      CANCELED: "bg-orange-500/10 text-orange-500"
    };
    return badges[status];
  };

  const getStatusIcon = (status: TransactionStatus) => {
    if (status === "DONE") return <IoCheckmarkCircle className="h-4 w-4" />;
    if (status === "REJECTED") return <IoCloseCircle className="h-4 w-4" />;
    if (status === "WAITING_CONFIRMATION") return <IoAlertCircle className="h-4 w-4" />;
    return <IoTimeOutline className="h-4 w-4" />;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1-primary mx-auto mb-4"></div>
          <div className="text-muted">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const pendingCount = transactions.filter(t => t.status === "WAITING_CONFIRMATION").length;

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary mb-2">
            Transaction Management
          </h1>
          <p className="text-muted">Review and manage ticket purchases</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-clear">{transactions.length}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-blue-500">{pendingCount}</p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-500">
              {transactions.filter(t => t.status === "DONE").length}
            </p>
          </div>
          <div className="bg-tertiary rounded-2xl shadow-xl p-6">
            <p className="text-muted text-sm mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-500">
              {transactions.filter(t => t.status === "REJECTED").length}
            </p>
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
                placeholder="Search by customer name, email, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border border-tertiary rounded-lg pl-12 pr-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <IoFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "ALL")}
                className="bg-secondary border border-tertiary rounded-lg pl-12 pr-8 py-3 text-clear outline-none focus:border-accent1-primary transition appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="WAITING_CONFIRMATION">Pending Review</option>
                <option value="DONE">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITING_PAYMENT">Waiting Payment</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-tertiary rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Event</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-secondary hover:bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent1-primary to-accent2-primary rounded-full flex items-center justify-center">
                          <IoPersonCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-clear">
                            {transaction.user.firstname} {transaction.user.lastname}
                          </p>
                          <p className="text-xs text-muted">{transaction.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-clear">{transaction.event.title}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <IoCalendarOutline className="h-3 w-3" />
                        {new Date(transaction.event.startDate).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-clear">
                        Rp {transaction.totalPrice.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-muted">
                        {transaction.transactionItem.reduce((sum, item) => sum + item.quantity, 0)} ticket(s)
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold w-fit ${getStatusBadge(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-accent1-primary px-4 py-2 rounded-lg transition text-sm font-semibold"
                      >
                        <IoEyeOutline className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <IoReceiptOutline className="h-16 w-16 text-muted/30 mx-auto mb-4" />
              <p className="text-muted">No transactions found</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-tertiary rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-clear">Transaction Detail</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-muted hover:text-clear transition"
                  >
                    <IoCloseCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-2">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent1-primary to-accent2-primary rounded-full flex items-center justify-center">
                      <IoPersonCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-clear">
                        {selectedTransaction.user.firstname} {selectedTransaction.user.lastname}
                      </p>
                      <p className="text-sm text-muted">{selectedTransaction.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-2">Event</p>
                  <p className="font-bold text-clear mb-2">{selectedTransaction.event.title}</p>
                  <div className="space-y-1 text-sm text-muted">
                    <p className="flex items-center gap-2">
                      <IoCalendarOutline className="h-4 w-4" />
                      {new Date(selectedTransaction.event.startDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <IoLocationOutline className="h-4 w-4" />
                      {selectedTransaction.event.location}
                    </p>
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-3">Tickets</p>
                  <div className="space-y-2">
                    {selectedTransaction.transactionItem.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-clear">
                            {item.ticketType?.name || 'General Admission'}
                          </p>
                          <p className="text-xs text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-clear">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-3">Payment Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="text-clear">
                        Rp {(selectedTransaction.totalPrice + selectedTransaction.discountAmount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {selectedTransaction.pointsUsed > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Points Used</span>
                        <span className="text-green-500">-{selectedTransaction.pointsUsed} pts</span>
                      </div>
                    )}
                    {selectedTransaction.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Discount</span>
                        <span className="text-green-500">
                          -Rp {selectedTransaction.discountAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-tertiary">
                      <span className="text-clear">Total</span>
                      <span className="text-accent1-primary">
                        Rp {selectedTransaction.totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedTransaction.paymentProof && (
                  <div className="bg-secondary rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted mb-3">Payment Proof</p>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-tertiary">
                      <Image
                        src={selectedTransaction.paymentProof}
                        alt="Payment Proof"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-2">Status</p>
                  <span className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold w-fit ${getStatusBadge(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Actions */}
                {selectedTransaction.status === "WAITING_CONFIRMATION" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(selectedTransaction.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                      <IoCheckmarkCircle className="h-5 w-5" />
                      {actionLoading ? "Processing..." : "Accept Payment"}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                      <IoCloseCircle className="h-5 w-5" />
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-tertiary rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-clear mb-4">Reject Payment</h3>
                <p className="text-muted mb-4">
                  Please provide a reason for rejecting this payment (optional):
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Payment proof is unclear..."
                  className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition mb-4"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Confirm Reject"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                    }}
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