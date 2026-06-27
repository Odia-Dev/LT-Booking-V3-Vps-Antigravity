"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
    imageUrl?: string;
  };
  variant: {
    name: string;
  };
  branch: {
    name: string;
    city: string;
  };
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/bookings`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        setBookings(data.data || []);
      } catch (err: unknown) {
        console.error("Fetch bookings error:", err);
        const msg = err instanceof Error ? err.message : "An error occurred while loading your bookings.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">My Bookings</h1>
        <p className="text-sm text-neutral-400">View and track all vehicle booking reserves submitted under your account.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500 mb-6">You do not have any vehicle bookings registered.</p>
          <Link
            href="/book-online"
            className="px-6 py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-250 transition-colors inline-block text-sm"
          >
            Book a Toyota Online
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 shadow-xl hover:border-neutral-700/60 transition-colors"
            >
              {/* Header section of individual card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-850 pb-4 mb-4">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-1">Booking Ref</span>
                  <span className="text-base font-bold text-white font-mono">{booking.bookingId}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "PAYMENT_SUCCESS"
                      ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                      : "bg-neutral-850 border border-neutral-800 text-neutral-400"
                  }`}>
                    Status: {booking.bookingStatus}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    booking.paymentStatus === "SUCCESS"
                      ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                      : booking.paymentStatus === "FAILED"
                      ? "bg-red-950/80 border border-red-900 text-red-400"
                      : "bg-amber-950/80 border border-amber-900 text-amber-400"
                  }`}>
                    Payment: {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Grid content of individual card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Vehicle Details</p>
                  <p className="text-white font-bold text-lg">{booking.vehicle?.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Variant: {booking.variant?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Price Details & Date</p>
                  <p className="text-white font-bold text-lg">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(booking.bookingAmount)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Reserved on: {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Dealership Branch</p>
                  <p className="text-white font-semibold">{booking.branch?.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{booking.branch?.city}</p>
                </div>
              </div>

              {/* Extra details like notes or assigned sales executive */}
              {(booking.notes || booking.assignedExecutive) && (
                <div className="mt-6 pt-4 border-t border-neutral-850/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
                  {booking.assignedExecutive && (
                    <div>
                      <span className="font-semibold text-neutral-500 mr-2 uppercase tracking-wide">Assigned Executive:</span>
                      <span>{booking.assignedExecutive}</span>
                    </div>
                  )}
                  {booking.notes && (
                    <div>
                      <span className="font-semibold text-neutral-500 mr-2 uppercase tracking-wide">Notes:</span>
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
