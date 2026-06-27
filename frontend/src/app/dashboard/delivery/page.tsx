"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";

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
    bookingAmount: number;
    paymentStatus: string;
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
  timeline?: TimelineStep[];
}

export default function CustomerDeliveryTrackingPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliveries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load delivery tracking details");
      }

      const list: Delivery[] = data.data || [];
      setDeliveries(list);
      if (list.length > 0) {
        setActiveDelivery(list[0]);
      }
    } catch (err: any) {
      console.error("Error fetching deliveries:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="h-64 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn text-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Delivery Tracking</h1>
          <p className="text-sm text-neutral-450">Track your vehicle allocation and physical handover milestones.</p>
        </div>

        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500 text-sm font-medium">No active scheduled deliveries found for your bookings.</p>
        </div>
      </div>
    );
  }

  const d = activeDelivery!;

  // 8 Steps mapping
  const steps = [
    {
      label: "Booking Confirmed",
      description: "Booking processed and order accepted.",
      isComplete: d.booking?.bookingStatus === "CONFIRMED" || d.booking?.paymentStatus === "SUCCESS",
    },
    {
      label: "Vehicle Allocated",
      description: "VIN number allocated for delivery preparations.",
      isComplete: d.status !== "SCHEDULED" || d.checklist?.pdiCompleted === true || d.checklist !== null,
    },
    {
      label: "Insurance Issued",
      description: "Third-party and comprehensive coverage policy issued.",
      isComplete: !!d.checklist?.insuranceIssued,
    },
    {
      label: "RTO Registration Completed",
      description: "State motor vehicle registration parameters updated.",
      isComplete: !!d.checklist?.rtoCompleted,
    },
    {
      label: "Vehicle PDI Completed",
      description: "Pre-Delivery Inspection check cleared.",
      isComplete: !!d.checklist?.pdiCompleted,
    },
    {
      label: "Ready for Delivery",
      description: "Vehicle cleaned and parked in the delivery bay.",
      isComplete: d.status === "READY" || d.status === "DELIVERED",
    },
    {
      label: "Delivery Scheduled",
      description: "Handover time slot scheduled.",
      isComplete: d.scheduledDate !== null,
    },
    {
      label: "Delivered",
      description: "Keys handed over and checklist signed.",
      isComplete: d.status === "DELIVERED",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Delivery Tracking</h1>
          <p className="text-sm text-neutral-450">Track your vehicle delivery progress stages in real time.</p>
        </div>

        {/* Multi-booking selector dropdown */}
        {deliveries.length > 1 && (
          <select
            value={d.id}
            onChange={(e) => {
              const selected = deliveries.find((item) => item.id === e.target.value);
              if (selected) setActiveDelivery(selected);
            }}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold focus:outline-none"
          >
            {deliveries.map((item) => (
              <option key={item.id} value={item.id}>
                {item.vehicle?.name} ({item.booking?.bookingId})
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* Main Delivery status summary layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: 8 Steps Handover Progress Timeline */}
        <div className="lg:col-span-2 bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Handover Milestone Tracker</h3>
            <p className="text-[11px] text-neutral-450">Current physical allocation and gateway check clearances.</p>
          </div>

          <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {step.isComplete ? (
                  <div className="w-6.5 h-6.5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-400 font-bold z-10 shrink-0">
                    ✓
                  </div>
                ) : (
                  <div className="w-6.5 h-6.5 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-[10px] text-neutral-500 z-10 shrink-0">
                    ○
                  </div>
                )}
                <div className="space-y-0.5 pt-0.5">
                  <p className={`font-bold text-xs ${step.isComplete ? "text-white" : "text-neutral-500"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-neutral-450">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Contact info, scheduled date/time and branch parameters */}
        <div className="space-y-8">
          {/* Card: Appointment Schedule Details */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Handover Schedule</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">Scheduled Date & Time</span>
                <p className="font-bold text-white text-xs">
                  {d.scheduledDate
                    ? new Date(d.scheduledDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "To be announced"}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">Vehicle variant</span>
                <p className="font-bold text-white text-xs">{d.vehicle?.name}</p>
                <p className="text-[10px] text-neutral-400">{d.variant?.name}</p>
              </div>
            </div>
          </div>

          {/* Card: Assigned Executive & Contact Info */}
          <div className="bg-[#121214] border border-[#27272a]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Representative & Contacts</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">Assigned Executive</span>
                <p className="font-bold text-white text-xs">{d.assignedExecutive || "Handover team representative"}</p>
                {d.assignedExecutive && (
                  <p className="text-[10px] text-neutral-450 font-mono">{d.assignedExecutive}</p>
                )}
              </div>

              <div className="p-3.5 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">Delivery Branch</span>
                <p className="font-bold text-white text-xs">{d.branch?.name}</p>
                <p className="text-[10px] text-neutral-450">{d.branch?.city}</p>
                {d.branch?.phone && (
                  <p className="text-[10px] text-neutral-400 font-mono mt-1">📞 {d.branch.phone}</p>
                )}
                {d.branch?.email && (
                  <p className="text-[10px] text-neutral-400 font-mono">✉️ {d.branch.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
