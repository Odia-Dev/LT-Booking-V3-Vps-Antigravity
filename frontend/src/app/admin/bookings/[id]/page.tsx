"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  city: string;
  phone: string;
}

interface Vehicle {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
}

interface Booking {
  id: string;
  bookingId: string;
  customerId: string;
  leadId: string | null;
  testDriveId: string | null;
  vehicleId: string;
  variantId: string;
  branchId: string;
  bookingAmount: number;
  paymentGateway: string | null;
  paymentId: string | null;
  orderId: string | null;
  paymentStatus: string;
  bookingStatus: string;
  assignedExecutive: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
  variant?: Variant | null;
  branch?: Branch | null;
}

interface NoteHistoryItem {
  text: string;
  createdAt: string;
  author: string;
}

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [assignedExecutive, setAssignedExecutive] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Note log state
  const [noteHistory, setNoteHistory] = useState<NoteHistoryItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/bookings/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load booking details");
      }
      setBooking(data.data);
      setBookingStatus(data.data.bookingStatus);
      setPaymentStatus(data.data.paymentStatus);
      setAssignedExecutive(data.data.assignedExecutive || "");
      setNotes(data.data.notes || "");

      // Attempt note parsing if stored as JSON structure with history
      if (data.data.notes) {
        try {
          const parsed = JSON.parse(data.data.notes);
          if (Array.isArray(parsed.history)) {
            setNoteHistory(parsed.history);
            setNotes(parsed.originalNotes || "");
          }
        } catch (e) {
          // Plain string fallback note
          setNoteHistory([]);
        }
      } else {
        setNoteHistory([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading booking");
    } finally {
      setLoading(false);
    }
  }, [id, apiBaseUrl]);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id, fetchBooking]);

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      // 1. Update Booking Parameters
      let finalNotes = notes;
      
      // If we have history notes, we keep the history object format
      if (noteHistory.length > 0) {
        finalNotes = JSON.stringify({
          originalNotes: notes,
          history: noteHistory
        });
      }

      const res = await fetch(`${apiBaseUrl}/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingStatus,
          paymentStatus,
          assignedExecutive: assignedExecutive || null,
          notes: finalNotes || null,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save updates");
      }

      setSuccess("Booking updated successfully");
      fetchBooking();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save updates");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNoteLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !booking) return;

    setUpdating(true);
    try {
      const history = [...noteHistory];
      history.push({
        text: newNoteText,
        createdAt: new Date().toISOString(),
        author: "System Coordinator",
      });

      const notesPayload = JSON.stringify({
        originalNotes: notes,
        history
      });

      const res = await fetch(`${apiBaseUrl}/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesPayload }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to append note to booking history");

      setNewNoteText("");
      setSuccess("Timeline log note appended");
      fetchBooking();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error appending note");
    } finally {
      setUpdating(false);
    }
  };

  const getTimelineStages = () => {
    const stages = [
      { key: "INITIATED", label: "Initiated" },
      { key: "PAYMENT_PENDING", label: "Payment Pending" },
      { key: "PAYMENT_SUCCESS", label: "Payment Successful" },
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "VEHICLE_ALLOCATED", label: "Vehicle Allocated" },
      { key: "DELIVERED", label: "Delivered" },
      { key: "CLOSED", label: "Closed" },
    ];

    const cancelledStages = [
      { key: "CANCELLED", label: "Cancelled" },
      { key: "REFUNDED", label: "Refunded" },
      { key: "EXPIRED", label: "Expired" },
    ];

    const isCancelledFlow = ["CANCELLED", "REFUNDED", "EXPIRED"].includes(booking?.bookingStatus || "");

    return isCancelledFlow ? cancelledStages : stages;
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-neutral-400">Loading booking records...</div>;
  }

  if (!booking) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 space-y-4">
        <div>Booking details record not found</div>
        <Link href="/admin/bookings" className="text-[#eb0a1e] hover:underline font-bold">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="text-neutral-500 hover:text-white text-xs">
              ← Back to list
            </Link>
            <span className="h-4 w-px bg-neutral-800" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
              Booking Details Card
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            {booking.bookingId}
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              booking.paymentStatus === "SUCCESS" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" : "bg-yellow-950/40 text-yellow-400 border border-yellow-900/50"
            }`}>
              {booking.paymentStatus}
            </span>
          </h1>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details & Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Booking Summary */}
          <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Booking Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Vehicle Model</span>
                <span className="text-white font-bold">{booking.vehicle?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Variant Specs</span>
                <span className="text-white font-bold">{booking.variant?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Dealership Showroom</span>
                <span className="text-white font-bold">{booking.branch?.name} ({booking.branch?.city})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Booking Amount Paid</span>
                <span className="text-[#eb0a1e] font-black font-mono">₹{booking.bookingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Payment Gateway</span>
                <span className="text-white font-semibold font-mono">{booking.paymentGateway || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Gateway Transaction ID</span>
                <span className="text-white font-semibold font-mono text-[10px] truncate max-w-[150px]">{booking.paymentId || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Gateway Order ID</span>
                <span className="text-white font-semibold font-mono text-[10px] truncate max-w-[150px]">{booking.orderId || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-500">Created At Timestamp</span>
                <span className="text-neutral-400">{new Date(booking.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* CRM Update Controls */}
          <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4">Update Booking Status & Coordinator</h2>
            
            <form onSubmit={handleUpdateBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Booking Status</label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
                  >
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
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Assigned Executive</label>
                  <input
                    type="text"
                    placeholder="Enter coordinator name"
                    value={assignedExecutive}
                    onChange={(e) => setAssignedExecutive(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Private specifications details or delivery preferences notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Booking Updates
                </button>
              </div>
            </form>
          </div>

          {/* Timeline & Notes log history */}
          <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Internal History & Timeline Log</h2>
            
            <form onSubmit={handleAddNoteLog} className="flex gap-2">
              <input
                type="text"
                placeholder="Type audit log text or coordination note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 px-4 py-2 bg-black border border-neutral-850 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-750"
                required
              />
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-[10px] uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
              >
                Log note
              </button>
            </form>

            <div className="space-y-4">
              {noteHistory.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-neutral-600 italic">No notes logged in the timeline history yet</div>
              ) : (
                <div className="relative border-l border-neutral-800 pl-4 ml-2 space-y-4">
                  {noteHistory.map((note, index) => (
                    <div key={index} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                        <span className="font-bold text-neutral-400">{note.author}</span>
                        <span>•</span>
                        <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-neutral-300 mt-1">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Customer Details & Visual Timeline */}
        <div className="space-y-6">
          
          {/* Customer Details */}
          <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Customer Details</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Full Name</span>
                <span className="text-white font-semibold text-sm">{booking.customer?.name}</span>
              </div>
              
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Phone Number</span>
                <span className="text-white font-semibold">{booking.customer?.phone}</span>
              </div>

              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Email Address</span>
                <span className="text-white font-semibold">{booking.customer?.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">City</span>
                  <span className="text-white font-semibold">{booking.customer?.city || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">State</span>
                  <span className="text-white font-semibold">{booking.customer?.state || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Progress Tracker */}
          <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Booking Stage Tracker</h2>
            
            <div className="relative border-l border-neutral-800 pl-6 ml-2 space-y-6">
              {getTimelineStages().map((stage, index) => {
                const currentStatus = booking.bookingStatus;
                const isCurrent = currentStatus === stage.key;
                
                // Index check logic to determine past vs upcoming status
                const getStatusIndex = (s: string) => {
                  const arr = getTimelineStages().map((x) => x.key);
                  return arr.indexOf(s);
                };

                const indexTarget = getStatusIndex(stage.key);
                const indexCurrent = getStatusIndex(currentStatus);
                const isPassed = indexTarget < indexCurrent;

                return (
                  <div key={stage.key} className="relative text-xs">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[30px] top-0.5 h-3 w-3 rounded-full border-2 transition-colors ${
                      isCurrent ? "bg-[#eb0a1e] border-[#eb0a1e]" :
                      isPassed ? "bg-emerald-500 border-emerald-500" :
                      "bg-[#09090b] border-neutral-800"
                    }`} />
                    
                    <div className={`font-semibold ${
                      isCurrent ? "text-white font-extrabold" :
                      isPassed ? "text-neutral-400" :
                      "text-neutral-600"
                    }`}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
