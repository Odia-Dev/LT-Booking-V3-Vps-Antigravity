"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Booking {
  id: string;
  bookingId: string;
  bookingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  notes?: string;
  assignedExecutive?: string;
  createdAt: string;
  vehicle: {
    name: string;
  };
  variant: {
    name: string;
  };
  branch: {
    name: string;
    city: string;
    phone: string;
    email: string;
  };
}

const STEPS = [
  { key: "INITIATED", label: "Booking Created", desc: "Your vehicle reserve request has been registered in our system." },
  { key: "PAYMENT_SUCCESS", label: "Payment Verified", desc: "Gateway verification successful, reservation fee received." },
  { key: "CONFIRMED", label: "Booking Confirmed", desc: "Dealership has accepted and scheduled your order." },
  { key: "VEHICLE_ALLOCATED", label: "Vehicle Allocated", desc: "Specific VIN and chassis allocation has been locked." },
  { key: "PDI_COMPLETED", label: "PDI Completed", desc: "Pre-delivery inspection validation checked." },
  { key: "READY_FOR_DELIVERY", label: "Ready For Delivery", desc: "Vehicle is detailed and ready for delivery key handover." },
  { key: "DELIVERED", label: "Delivered", desc: "Keys handed over. Congratulations on your new Toyota!" },
];

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;

    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/dashboard/bookings/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (res.status === 403 || res.status === 404) {
          setError(data.message || "Booking record not found or access denied.");
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to load booking details");
        }

        setBooking(data.data);
      } catch (err: unknown) {
        console.error("Fetch booking detail error:", err);
        const msg = err instanceof Error ? err.message : "Could not load booking timeline.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, apiBaseUrl, router]);

  // Determine current timeline active step index
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case "INITIATED":
      case "PAYMENT_PENDING":
        return 0;
      case "PAYMENT_SUCCESS":
        return 1;
      case "CONFIRMED":
        return 2;
      case "VEHICLE_ALLOCATED":
        return 3;
      case "PDI_COMPLETED":
        return 4;
      case "READY_FOR_DELIVERY":
        return 5;
      case "DELIVERED":
      case "CLOSED":
        return 6;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="h-48 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Link href="/dashboard/bookings" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
          ← Back to Bookings
        </Link>
        <div className="p-8 rounded-2xl bg-neutral-900/20 border border-neutral-850 text-center">
          <p className="text-red-400 font-medium mb-4">{error || "Booking detail not found."}</p>
          <Link href="/dashboard/bookings" className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs transition-colors">
            Return to Bookings List
          </Link>
        </div>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(booking.bookingStatus);
  const isCancelled = booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REFUNDED";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/dashboard/bookings" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
          ← Back to Bookings
        </Link>
        <div className="text-xs text-neutral-500 font-mono">
          Created on {new Date(booking.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Main Reservation Card Overview */}
      <div className="bg-neutral-900/25 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono text-[#eb0a1e] uppercase tracking-widest block mb-1">Active Booking Order</span>
            <h1 className="text-2xl font-bold text-white font-mono">{booking.bookingId}</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-neutral-500 text-xs uppercase font-semibold">Model Name</p>
              <p className="text-white font-bold mt-0.5">{booking.vehicle?.name}</p>
              <p className="text-xs text-neutral-400">{booking.variant?.name}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase font-semibold">Booking Amount</p>
              <p className="text-white font-bold mt-0.5">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(booking.bookingAmount)}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase font-semibold">Dealership Branch</p>
              <p className="text-white font-semibold mt-0.5">{booking.branch?.name}</p>
              <p className="text-xs text-neutral-400">{booking.branch?.city}</p>
            </div>
          </div>
        </div>

        {/* Action Executive Contacts */}
        <div className="md:w-72 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-4 self-start">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Branch & Advisor Contact</h2>
          <div className="space-y-3 text-xs">
            {booking.assignedExecutive && (
              <div>
                <p className="text-neutral-500">Sales Executive</p>
                <p className="text-neutral-200 font-semibold mt-0.5">{booking.assignedExecutive}</p>
              </div>
            )}
            <div>
              <p className="text-neutral-500">Branch Phone</p>
              <p className="text-neutral-200 mt-0.5">{booking.branch?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Branch Email</p>
              <p className="text-neutral-200 truncate mt-0.5">{booking.branch?.email || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation warning banner */}
      {isCancelled && (
        <div className="p-5 rounded-2xl bg-red-950/25 border border-red-900/40 text-red-400 flex items-start gap-4">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1">Booking Cancelled</h2>
            <p className="text-xs text-red-300">
              This reservation has been cancelled or refunded. If this is an error or if you have any questions regarding your refund status, please get in touch with the dealership branch.
            </p>
          </div>
        </div>
      )}

      {/* Graphical Timeline Tracking */}
      {!isCancelled && (
        <div className="bg-neutral-900/15 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-8 tracking-wide">📦 Delivery Tracking Timeline</h2>
          <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-7 gap-4">
            
            {/* Horizontal Line connector for desktop */}
            <div className="hidden md:block absolute left-8 right-8 top-5 h-[2px] bg-neutral-800 z-0">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {/* Vertical Line connector for mobile */}
            <div className="md:hidden absolute left-[15px] top-6 bottom-6 w-[2px] bg-neutral-850 z-0">
              <div 
                className="w-full bg-emerald-500 transition-all duration-500" 
                style={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;
              
              return (
                <div key={step.key} className="relative flex md:flex-col items-start md:items-center text-left md:text-center mb-8 md:mb-0 z-10 group">
                  {/* Indicator Dot */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-0 md:mb-4 shrink-0 ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-neutral-950 font-bold" 
                      : isActive 
                      ? "bg-neutral-900 border-[#eb0a1e] text-white shadow-lg shadow-[#eb0a1e]/20 animate-pulse scale-105" 
                      : "bg-neutral-950 border-neutral-800 text-neutral-600"
                  }`}>
                    {isCompleted ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <span className="text-xs font-mono">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step details */}
                  <div className="ml-4 md:ml-0 md:px-2">
                    <h3 className={`text-sm font-bold tracking-wide transition-colors ${
                      isActive ? "text-white" : isCompleted ? "text-neutral-200" : "text-neutral-500"
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-3 md:line-clamp-none max-w-xs md:max-w-none">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extra reservation notes if present */}
      {booking.notes && (
        <div className="bg-neutral-900/10 border border-neutral-850 rounded-xl p-5 text-xs text-neutral-400">
          <span className="font-bold text-neutral-500 uppercase tracking-wide mr-2 block mb-1">Reservation Notes</span>
          <p>{booking.notes}</p>
        </div>
      )}
    </div>
  );
}
