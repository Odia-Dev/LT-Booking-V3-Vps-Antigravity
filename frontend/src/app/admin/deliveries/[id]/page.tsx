"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface TimelineStep {
  id: string;
  statusBefore: string;
  statusAfter: string;
  comment: string | null;
  performedBy: string | null;
  createdAt: string;
}

interface Checklist {
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
}

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
  branch: { name: string; city: string; phone?: string; email?: string };
  checklist: Checklist | null;
  timeline: TimelineStep[];
}

export default function AdminDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Status update form state
  const [statusVal, setStatusVal] = useState("");
  const [commentVal, setCommentVal] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Edit details form state
  const [assignedExec, setAssignedExec] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notesVal, setNotesVal] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchDeliveryDetails = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load delivery details");
      }

      const d: Delivery = data.data;
      setDelivery(d);
      setStatusVal(d.status);
      setAssignedExec(d.assignedExecutive || "");
      setNotesVal(d.notes || "");
      if (d.scheduledDate) {
        // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
        const dateObj = new Date(d.scheduledDate);
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
        setScheduledDate(localISOTime);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeliveryDetails();
    }
  }, [id, apiBaseUrl]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedExecutive: assignedExec || null,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          notes: notesVal || null,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update details");
      }

      setSuccess("Delivery parameters updated successfully.");
      fetchDeliveryDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusVal,
          comment: commentVal || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setSuccess(`Status changed to ${statusVal} successfully.`);
      setCommentVal("");
      fetchDeliveryDetails();
    } catch (err: any) {
      setError(err.message || "Failed to change status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleChecklistToggle = async (key: keyof Checklist, currentVal: boolean) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries/${id}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !currentVal }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update checklist item");
      }

      fetchDeliveryDetails();
    } catch (err: any) {
      setError(err.message || "Checklist update failed.");
    }
  };

  const getCompletionPercentage = () => {
    if (!delivery?.checklist) return 0;
    const items = [
      delivery.checklist.paymentCleared,
      delivery.checklist.insuranceIssued,
      delivery.checklist.rtoCompleted,
      delivery.checklist.pdiCompleted,
      delivery.checklist.accessoriesInstalled,
      delivery.checklist.fuelFilled,
      delivery.checklist.cleaningCompleted,
      delivery.checklist.documentationPrepared,
      delivery.checklist.deliveryKitPrepared,
      delivery.checklist.customerOrientationCompleted,
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this vehicle delivery handover record?")) {
      return;
    }
    setError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/admin/deliveries");
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete record");
      }
    } catch (err: any) {
      setError(err.message || "Delete request failed.");
    }
  };

  if (loading) {
    return (
      <div className="h-48 border border-neutral-850 rounded-2xl flex items-center justify-center bg-neutral-900/10">
        <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="p-8 border border-red-900/40 rounded-2xl bg-red-950/20 text-center">
        <p className="text-red-400 text-sm font-semibold mb-4">Delivery record not found.</p>
        <Link href="/admin/deliveries" className="text-white hover:underline text-xs">
          Return to Console
        </Link>
      </div>
    );
  }

  const pct = getCompletionPercentage();

  return (
    <div className="space-y-8 animate-fadeIn text-xs">
      {/* Top action header bar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Link href="/admin/deliveries" className="text-neutral-500 hover:text-white transition-colors">
            &larr; Handovers Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Handover #{delivery.id.slice(0, 8)}</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-900 bg-red-950/30 hover:bg-red-950/60 text-red-400 font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          Delete Record
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 font-semibold">
          {success}
        </div>
      )}

      {/* Main summary layouts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Card: Delivery Parameters Summary info */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[9px]">Booking ID</span>
              <p className="font-bold text-white text-sm">{delivery.booking?.bookingId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[9px]">Status</span>
              <div className="pt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider ${getStatusBadgeClass(delivery.status)}`}>
                  {delivery.status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[9px]">Scheduled Delivery</span>
              <p className="font-semibold text-neutral-200">
                {delivery.scheduledDate
                  ? new Date(delivery.scheduledDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[9px]">Actual Delivery</span>
              <p className="font-semibold text-neutral-200">
                {delivery.actualDeliveryDate
                  ? new Date(delivery.actualDeliveryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Pending handover"}
              </p>
            </div>
          </div>

          {/* Card: Gateway checklist verification milestones */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Gateway Checklist Verification</h3>
                <p className="text-[11px] text-neutral-450">Complete these 10 required items to proceed with gate pass issuance.</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white">{pct}%</p>
                <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Completed</p>
              </div>
            </div>

            <div className="h-2 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-[#eb0a1e]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {delivery.checklist &&
                (Object.keys(delivery.checklist) as Array<keyof Checklist>).map((key) => {
                  if (key === "id" as any || key === "deliveryId" as any || key === "createdAt" as any || key === "updatedAt" as any) return null;
                  const isChecked = !!delivery.checklist?.[key];
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());

                  return (
                    <div
                      key={key}
                      onClick={() => handleChecklistToggle(key, isChecked)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-emerald-950/10 border-emerald-900/50 text-emerald-400"
                          : "bg-neutral-950/40 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 rounded accent-emerald-500 shrink-0"
                      />
                      <span className="font-semibold text-xs">{label}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Card: Timeline Handover log */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Handover Status Log</h3>
              <p className="text-[11px] text-neutral-450">Chronological history transitions logged by system coordinators.</p>
            </div>

            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
              {delivery.timeline.map((step) => (
                <div key={step.id} className="flex gap-4 relative">
                  <div className="w-6.5 h-6.5 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-[10px] text-neutral-450 z-10 shrink-0">
                    ⏱️
                  </div>
                  <div className="space-y-1 bg-neutral-950/30 border border-neutral-850 p-4 rounded-xl flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-400">{step.statusBefore}</span>
                        <span className="text-neutral-600">&rarr;</span>
                        <span className="font-bold text-white">{step.statusAfter}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(step.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {step.comment && <p className="text-neutral-300 text-xs mt-1">{step.comment}</p>}
                    <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-600">
                      Logged by: {step.performedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar settings editing controls column */}
        <div className="space-y-8">
          {/* Form: Transition Status updates */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Update Handover Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Handover Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PREPARED">Prepared</option>
                  <option value="READY">Ready</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Audit Comment</label>
                <textarea
                  placeholder="Reason or update comment..."
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={statusLoading}
                className="w-full py-2 bg-[#eb0a1e] hover:bg-[#c00816] disabled:opacity-35 text-white font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                {statusLoading ? "Updating..." : "Commit Status Change"}
              </button>
            </form>
          </div>

          {/* Form: Update core parameters */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Edit Handover Details</h3>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Assigned Executive (Email)</label>
                <input
                  type="text"
                  placeholder="sales@laxmitoyota.co.in"
                  value={assignedExec}
                  onChange={(e) => setAssignedExec(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Reschedule Date</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Notes</label>
                <textarea
                  placeholder="Handover instructions..."
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={detailsLoading}
                className="w-full py-2 bg-white hover:bg-neutral-200 disabled:opacity-35 text-neutral-950 font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                {detailsLoading ? "Saving..." : "Save Parameters"}
              </button>
            </form>
          </div>

          {/* Card: Customer and Branch profiles */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Contacts & Entity Linkings</h3>
            <div className="space-y-3">
              <div className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Customer profile</span>
                <p className="font-bold text-white text-xs">{delivery.customer?.name}</p>
                <p className="text-[10px] text-neutral-450 font-mono">{delivery.customer?.email}</p>
                <p className="text-[10px] text-neutral-450 font-mono">{delivery.customer?.phone}</p>
              </div>
              <div className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Dealership branch</span>
                <p className="font-bold text-white text-xs">{delivery.branch?.name}</p>
                <p className="text-[10px] text-neutral-450">{delivery.branch?.city}</p>
              </div>
              <div className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Catalog selection</span>
                <p className="font-bold text-white text-xs">{delivery.vehicle?.name}</p>
                <p className="text-[10px] text-neutral-450">{delivery.variant?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
