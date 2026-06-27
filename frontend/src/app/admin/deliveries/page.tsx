"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Delivery {
  id: string;
  bookingId: string;
  customerId: string;
  vehicleId: string;
  variantId: string;
  branchId: string;
  assignedExecutive: string | null;
  status: string;
  scheduledDate: string | null;
  actualDeliveryDate: string | null;
  notes: string | null;
  createdAt: string;
  booking: {
    bookingId: string;
    bookingStatus: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle: { name: string };
  variant: { name: string };
  branch: { name: string; city: string };
  checklist: {
    paymentCleared: boolean;
    insuranceIssued: boolean;
    rtoCompleted: boolean;
    pdiCompleted: boolean;
    accessoriesInstalled: boolean;
    fuelFilled: boolean;
    cleaningCompleted: boolean;
    documentationPrepared: boolean;
    deliveryKitPrepared: boolean;
    customerOrientationCompleted: boolean;
  } | null;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [execFilter, setExecFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkExec, setBulkExec] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // New delivery modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookingId, setNewBookingId] = useState("");
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newVehicleId, setNewVehicleId] = useState("");
  const [newVariantId, setNewVariantId] = useState("");
  const [newBranchId, setNewBranchId] = useState("");
  const [newExec, setNewExec] = useState("");
  const [newSchedDate, setNewSchedDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [modalError, setModalError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: statusFilter !== "all" ? statusFilter : "",
        branchId: branchFilter !== "all" ? branchFilter : "",
        executive: execFilter,
      });

      const res = await fetch(`${apiBaseUrl}/api/deliveries?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load deliveries");
      }

      setDeliveries(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/public/branches`);
      const data = await res.json();
      if (res.ok) {
        setBranches(data.branches || []);
      }
    } catch (err) {
      console.error("Error loading branches list:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, statusFilter, branchFilter, apiBaseUrl]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeliveries();
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(deliveries.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${apiBaseUrl}/api/deliveries/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: bulkStatus, comment: "Bulk status update applied" }),
            credentials: "include",
          })
        )
      );
      setSelectedIds([]);
      setBulkStatus("");
      fetchDeliveries();
    } catch (err) {
      console.error("Bulk status update error:", err);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkExecChange = async () => {
    if (selectedIds.length === 0 || !bulkExec) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${apiBaseUrl}/api/deliveries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedExecutive: bulkExec }),
            credentials: "include",
          })
        )
      );
      setSelectedIds([]);
      setBulkExec("");
      fetchDeliveries();
    } catch (err) {
      console.error("Bulk executive assignment error:", err);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCreateDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: newBookingId,
          customerId: newCustomerId,
          vehicleId: newVehicleId,
          variantId: newVariantId,
          branchId: newBranchId,
          assignedExecutive: newExec || undefined,
          scheduledDate: newSchedDate ? new Date(newSchedDate).toISOString() : undefined,
          notes: newNotes || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to schedule delivery");
      }

      setIsModalOpen(false);
      // Reset fields
      setNewBookingId("");
      setNewCustomerId("");
      setNewVehicleId("");
      setNewVariantId("");
      setNewBranchId("");
      setNewExec("");
      setNewSchedDate("");
      setNewNotes("");
      fetchDeliveries();
    } catch (err: any) {
      setModalError(err.message || "Failed to create delivery record.");
    }
  };

  const getCompletionPercentage = (d: Delivery) => {
    if (!d.checklist) return 0;
    const items = [
      d.checklist.paymentCleared,
      d.checklist.insuranceIssued,
      d.checklist.rtoCompleted,
      d.checklist.pdiCompleted,
      d.checklist.accessoriesInstalled,
      d.checklist.fuelFilled,
      d.checklist.cleaningCompleted,
      d.checklist.documentationPrepared,
      d.checklist.deliveryKitPrepared,
      d.checklist.customerOrientationCompleted,
    ];
    const trueCount = items.filter(Boolean).length;
    return Math.round((trueCount / 10) * 100);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-950 text-emerald-400 border-emerald-900";
      case "READY":
        return "bg-blue-950 text-blue-400 border-blue-900";
      case "PREPARED":
        return "bg-purple-950 text-purple-400 border-purple-900";
      case "CANCELLED":
        return "bg-red-950 text-red-400 border-red-900";
      default:
        return "bg-amber-950 text-amber-400 border-amber-900";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Delivery Handover CRM</h1>
          <p className="text-sm text-neutral-400">Schedule vehicle handovers, track gateway checklists completion, and monitor executive allocations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#eb0a1e] hover:bg-[#c00816] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          Schedule Handover
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Term */}
            <input
              type="text"
              placeholder="Search booking or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
            />
            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="all">All Showroom Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PREPARED">Prepared</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {/* Executive Filter */}
            <input
              type="text"
              placeholder="Filter by executive..."
              value={execFilter}
              onChange={(e) => setExecFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-white rounded-lg text-xs font-semibold transition-all"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {/* Bulk Update Options */}
        {selectedIds.length > 0 && (
          <div className="pt-4 border-t border-[#27272a]/60 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-[#eb0a1e]">{selectedIds.length} records selected:</span>
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-white focus:outline-none"
              >
                <option value="">Bulk Update Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PREPARED">Prepared</option>
                <option value="READY">Ready</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                disabled={bulkUpdating || !bulkStatus}
                onClick={handleBulkStatusChange}
                className="px-3 py-1.5 bg-[#eb0a1e] disabled:opacity-30 rounded-lg font-bold text-white text-[10px] uppercase tracking-wide"
              >
                Update
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Bulk Assign Exec..."
                value={bulkExec}
                onChange={(e) => setBulkExec(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-white focus:outline-none w-44"
              />
              <button
                disabled={bulkUpdating || !bulkExec}
                onClick={handleBulkExecChange}
                className="px-3 py-1.5 bg-white disabled:opacity-30 rounded-lg font-bold text-neutral-950 text-[10px] uppercase tracking-wide"
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-48 border border-neutral-850 rounded-2xl flex items-center justify-center bg-neutral-900/10">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="border border-[#27272a]/60 rounded-2xl p-12 text-center bg-[#121214]/50">
          <p className="text-neutral-500 text-sm font-medium">No vehicle handovers scheduled.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#27272a]/60 rounded-2xl bg-[#121214]/30 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121214] text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#27272a]/60">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === deliveries.length && deliveries.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4">Handover ID</th>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Vehicle / Variant</th>
                <th className="p-4">Showroom Branch</th>
                <th className="p-4">Executive</th>
                <th className="p-4 text-center">Checklist</th>
                <th className="p-4">Scheduled Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/40">
              {deliveries.map((item) => {
                const pct = getCompletionPercentage(item);
                return (
                  <tr key={item.id} className="hover:bg-[#18181b]/35 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckboxToggle(item.id)}
                      />
                    </td>
                    <td className="p-4 font-mono text-neutral-450 select-all max-w-[80px] truncate" title={item.id}>
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {item.booking?.bookingId}
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-semibold text-neutral-250">{item.customer?.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{item.customer?.phone}</p>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-semibold text-neutral-200">{item.vehicle?.name}</p>
                      <p className="text-[10px] text-neutral-450">{item.variant?.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{item.branch?.name}</p>
                    </td>
                    <td className="p-4 font-medium text-neutral-350">
                      {item.assignedExecutive || <span className="text-neutral-600">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-[10px] text-white">{pct}%</span>
                        <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className={`h-full transition-all ${
                              pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-[#eb0a1e]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400">
                      {item.scheduledDate ? (
                        new Date(item.scheduledDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="text-neutral-650">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/deliveries/${item.id}`}
                        className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-600 bg-neutral-950 hover:bg-neutral-900 rounded-lg font-bold text-[10px] uppercase tracking-wider text-white transition-all inline-block"
                      >
                        Detail Timeline
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Handover Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Schedule Handover</h2>
              <p className="text-xs text-neutral-400">Link the customer transaction record parameters to schedule physical delivery.</p>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateDeliverySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Booking UUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. uuid-xxx"
                    value={newBookingId}
                    onChange={(e) => setNewBookingId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Customer UUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. uuid-xxx"
                    value={newCustomerId}
                    onChange={(e) => setNewCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Vehicle UUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. uuid-xxx"
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Variant UUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. uuid-xxx"
                    value={newVariantId}
                    onChange={(e) => setNewVariantId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Branch UUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. uuid-xxx"
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Assigned Executive (Email/Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. sales@laxmitoyota.co.in"
                    value={newExec}
                    onChange={(e) => setNewExec(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newSchedDate}
                  onChange={(e) => setNewSchedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Notes</label>
                <textarea
                  placeholder="Welcome package instructions..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-850 hover:border-neutral-700 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#eb0a1e] hover:bg-[#c00816] text-white rounded-lg font-bold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
