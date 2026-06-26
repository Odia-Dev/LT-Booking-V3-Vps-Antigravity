"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
  vehicle: Vehicle;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
  bookingId: string;
  customerId: string;
  vehicleId: string;
  variantId: string;
  branchId: string;
  bookingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  assignedExecutive: string | null;
  notes: string | null;
  createdAt: string;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
  variant?: Variant | null;
  branch?: Branch | null;
}

export default function AdminBookingsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Options
  const [branches, setBranches] = useState<Branch[]>([]);

  // Bulk actions state
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState("");
  const [bulkExecutive, setBulkExecutive] = useState("");

  // Fetch branches
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/public/branches`);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    }
    fetchBranches();
  }, [apiBaseUrl]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (paymentStatusFilter) params.append("paymentStatus", paymentStatusFilter);
      if (branchFilter) params.append("branchId", branchFilter);

      const res = await fetch(`${apiBaseUrl}/api/bookings?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.data || []);
      setTotalBookings(data.total || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bookings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentStatusFilter, branchFilter, apiBaseUrl]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle single delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this booking permanently?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }
      setSuccess("Booking record successfully deleted");
      fetchBookings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting booking");
    }
  };

  // Toggle selection
  const handleSelectBooking = (id: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookingIds.length === bookings.length) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(bookings.map((b) => b.id));
    }
  };

  // Bulk actions handlers
  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedBookingIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedBookingIds.map((id) =>
          fetch(`${apiBaseUrl}/api/bookings/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingStatus: bulkStatus }),
            credentials: "include",
          })
        )
      );
      setSuccess("Bulk status update completed successfully");
      setSelectedBookingIds([]);
      setBulkStatus("");
      fetchBookings();
    } catch (err) {
      setError("Some bookings failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPaymentStatusChange = async () => {
    if (!bulkPaymentStatus || selectedBookingIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedBookingIds.map((id) =>
          fetch(`${apiBaseUrl}/api/bookings/${id}/payment-status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: bulkPaymentStatus }),
            credentials: "include",
          })
        )
      );
      setSuccess("Bulk payment status update completed successfully");
      setSelectedBookingIds([]);
      setBulkPaymentStatus("");
      fetchBookings();
    } catch (err) {
      setError("Some payment statuses failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkExecutive || selectedBookingIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedBookingIds.map((id) =>
          fetch(`${apiBaseUrl}/api/bookings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedExecutive: bulkExecutive }),
            credentials: "include",
          })
        )
      );
      setSuccess("Bulk executive assignment completed successfully");
      setSelectedBookingIds([]);
      setBulkExecutive("");
      fetchBookings();
    } catch (err) {
      setError("Some bookings failed to assign");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalBookings / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Booking Management</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage online Toyota reservations, track payment states, and coordinate delivery status.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs rounded-lg flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="hover:text-emerald-300">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="hover:text-red-300">✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Search Query</label>
          <input
            type="text"
            placeholder="Search Ref, Customer, Phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Booking Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="INITIATED">Initiated</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAYMENT_SUCCESS">Payment Successful</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="VEHICLE_ALLOCATED">Vehicle Allocated</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Payment Status</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
          >
            <option value="">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Branch</label>
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
          >
            <option value="">All Showrooms</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedBookingIds.length > 0 && (
        <div className="bg-yellow-950/20 border border-yellow-900/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-yellow-500 font-bold">
            {selectedBookingIds.length} bookings selected
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700"
              >
                <option value="">Set Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="VEHICLE_ALLOCATED">Allocated</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={handleBulkStatusChange}
                disabled={!bulkStatus}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={bulkPaymentStatus}
                onChange={(e) => setBulkPaymentStatus(e.target.value)}
                className="px-3 py-1.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700"
              >
                <option value="">Set Payment</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <button
                onClick={handleBulkPaymentStatusChange}
                disabled={!bulkPaymentStatus}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Executive Name"
                value={bulkExecutive}
                onChange={(e) => setBulkExecutive(e.target.value)}
                className="px-3 py-1.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 w-32"
              />
              <button
                onClick={handleBulkAssign}
                disabled={!bulkExecutive}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-400">Loading bookings list...</div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-400">No bookings found matching filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-widest text-[10px] font-extrabold bg-neutral-900/20">
                  <th className="py-4 px-6 w-10">
                    <input
                      type="checkbox"
                      checked={selectedBookingIds.length === bookings.length}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-850 bg-black text-[#eb0a1e] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Vehicle & Variant</th>
                  <th className="py-4 px-6">Branch Showroom</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Booking Status</th>
                  <th className="py-4 px-6">Executive</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-neutral-900 hover:bg-neutral-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedBookingIds.includes(b.id)}
                        onChange={() => handleSelectBooking(b.id)}
                        className="rounded border-neutral-850 bg-black text-[#eb0a1e] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6 font-mono text-white font-bold">
                      <Link href={`/admin/bookings/${b.id}`} className="hover:text-red-500">
                        {b.bookingId}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-200">{b.customer?.name}</div>
                      <div className="text-[10px] text-neutral-500">{b.customer?.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-200">{b.vehicle?.name}</div>
                      <div className="text-[10px] text-neutral-500">{b.variant?.name}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-neutral-300">
                      {b.branch?.name}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-neutral-200">
                      ₹{b.bookingAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        b.paymentStatus === "SUCCESS" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" :
                        b.paymentStatus === "FAILED" ? "bg-red-950/40 text-red-400 border border-red-900/50" :
                        "bg-yellow-950/40 text-yellow-400 border border-yellow-900/50"
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        b.bookingStatus === "DELIVERED" || b.bookingStatus === "CLOSED" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" :
                        b.bookingStatus === "CANCELLED" || b.bookingStatus === "EXPIRED" ? "bg-neutral-800 text-neutral-400 border border-neutral-700" :
                        "bg-blue-950/40 text-blue-400 border border-blue-900/50"
                      }`}>
                        {b.bookingStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-300">
                      {b.assignedExecutive || <span className="text-neutral-600 font-light italic">Unassigned</span>}
                    </td>
                    <td className="py-4 px-6 text-neutral-400">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 font-extrabold uppercase text-[9px] tracking-wider rounded transition-colors inline-block"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 font-extrabold uppercase text-[9px] tracking-wider rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-neutral-500">
          <div>Showing {bookings.length} of {totalBookings} entries</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 rounded"
            >
              Previous
            </button>
            <span className="text-white font-semibold">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
