"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  bookingId: string;
  bookingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
  vehicle: {
    name: string;
    heroImage?: string;
  };
  variant: {
    name: string;
  };
  payment?: {
    amount: number;
    status: string;
    razorpayPaymentId: string | null;
    createdAt: string;
  } | null;
}

export default function TrackBookingPage() {
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Tracked booking result
  const [trackedBooking, setTrackedBooking] = useState<Booking | null>(null);

  // Authenticated customer bookings
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Check if customer is logged in, then fetch their bookings
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    setIsLoggedIn(true);
    const fetchHistory = async () => {
      setAuthLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/customer/auth/bookings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setCustomerBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Failed to load customer history:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchHistory();
  }, [apiBaseUrl]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTrackedBooking(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/customer/auth/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingIdInput, phone: phoneInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to locate booking record.");
      }

      setTrackedBooking(data.booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error locating booking.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectBooking = (booking: Booking) => {
    setTrackedBooking(booking);
    setBookingIdInput(booking.bookingId);
    setPhoneInput(booking.customerPhone);
    // Scroll to tracker detail
    const detailEl = document.getElementById("tracker-detail");
    if (detailEl) {
      detailEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Define steps for booking progress
  const getProgressSteps = (status: string) => {
    const steps = [
      { key: "INITIATED", label: "Booking Initiated", desc: "Reserve deposit submitted" },
      { key: "VERIFIED", label: "Details Verified", desc: "Dealership verified customer info" },
      { key: "ALLOCATED", label: "Vehicle Allocated", desc: "Chassis/Engine number assigned" },
      { key: "TRANSIT", label: "In Transit", desc: "Vehicle in shipping from factory" },
      { key: "READY", label: "Ready for Delivery", desc: "Vehicle prepped at dealership" },
      { key: "DELIVERED", label: "Delivered", desc: "Handover complete. Congratulations!" },
    ];

    let activeIndex = 0;
    if (status === "CONFIRMED" || status === "PAYMENT_SUCCESS") activeIndex = 1;
    else if (status === "ALLOCATED") activeIndex = 2;
    else if (status === "TRANSIT") activeIndex = 3;
    else if (status === "READY") activeIndex = 4;
    else if (status === "DELIVERED" || status === "COMPLETED") activeIndex = 5;

    return { steps, activeIndex };
  };

  const progress = trackedBooking ? getProgressSteps(trackedBooking.bookingStatus) : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900 sticky top-0 bg-neutral-950/80 backdrop-blur-md z-10">
        <span className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eb0a1e]"></span>
          LAXMI TOYOTA
        </span>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="text-sm bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg hover:text-white transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm bg-white text-neutral-950 font-bold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Track Section */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 space-y-12">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Track Your Booking</h1>
          <p className="text-sm text-neutral-400">
            Check real-time shipping status, documentation updates, and delivery timelines for your new Toyota.
          </p>
        </div>

        {/* Outer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lookup Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4">Quick Lookup</h2>
              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="bookingId" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Booking ID
                  </label>
                  <input
                    id="bookingId"
                    type="text"
                    required
                    placeholder="e.g. BK-123456"
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#eb0a1e] hover:bg-[#c00717] text-white font-bold rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? "Searching..." : "Track Status"}
                </button>
              </form>
            </div>

            {/* Authenticated Fast access */}
            {isLoggedIn && (
              <div className="bg-neutral-900/20 border border-neutral-850 p-6 rounded-2xl space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Active Bookings</h2>
                {authLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 bg-neutral-900 rounded"></div>
                    <div className="h-10 bg-neutral-900 rounded"></div>
                  </div>
                ) : customerBookings.length > 0 ? (
                  <div className="space-y-2">
                    {customerBookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => selectBooking(b)}
                        className="w-full text-left p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all text-xs flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#eb0a1e] transition-colors">{b.vehicle?.name}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">{b.bookingId}</p>
                        </div>
                        <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                          {b.bookingStatus}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">No bookings associated with your profile.</p>
                )}
              </div>
            )}
          </div>

          {/* Results Timeline Details */}
          <div className="lg:col-span-2">
            {error && (
              <div className="p-5 rounded-2xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {trackedBooking && progress ? (
              <div id="tracker-detail" className="bg-neutral-900/35 border border-neutral-850 rounded-2xl p-6 md:p-8 space-y-8 animate-fadeIn">
                {/* Vehicle Mini Hero */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#eb0a1e] uppercase font-bold">Booking Details</span>
                    <h2 className="text-2xl font-black text-white mt-1">{trackedBooking.vehicle?.name}</h2>
                    <p className="text-xs text-neutral-400 mt-1">Variant Spec: {trackedBooking.variant?.name}</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="text-neutral-500 text-xs uppercase font-semibold">Booking ID</p>
                    <p className="text-white font-mono text-base font-bold mt-0.5">{trackedBooking.bookingId}</p>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Timeline Journey</h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                    {progress.steps.map((step, idx) => {
                      const isCompleted = idx <= progress.activeIndex;
                      const isCurrent = idx === progress.activeIndex;
                      return (
                        <div key={idx} className="relative flex gap-4 items-start">
                          <div className={`absolute -left-[22px] top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isCurrent
                              ? "bg-[#eb0a1e] border-[#eb0a1e] text-white"
                              : isCompleted
                              ? "bg-neutral-900 border-[#eb0a1e] text-[#eb0a1e]"
                              : "bg-neutral-950 border-neutral-800 text-neutral-700"
                          }`}>
                            {isCompleted && (
                              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${isCurrent ? "text-[#eb0a1e]" : isCompleted ? "text-neutral-100" : "text-neutral-500"}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ledger Details */}
                <div className="pt-6 border-t border-neutral-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Activity</h3>
                  {trackedBooking.payment ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 text-xs">
                        <div>
                          <p className="text-neutral-500 font-semibold uppercase">Ref ID</p>
                          <p className="text-neutral-300 font-mono mt-0.5">{trackedBooking.payment.razorpayPaymentId || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">₹{trackedBooking.payment.amount.toLocaleString("en-IN")}</p>
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold uppercase mt-1 ${
                            trackedBooking.payment.status === "SUCCESS"
                              ? "bg-emerald-950/60 border border-emerald-900 text-emerald-400"
                              : "bg-neutral-900 border border-neutral-850 text-neutral-400"
                          }`}>
                            {trackedBooking.payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">No payment receipts found for this booking.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-neutral-900/5">
                <span className="text-3xl mb-3">🔍</span>
                <p className="text-neutral-400 text-sm font-medium">No booking selected</p>
                <p className="text-neutral-600 text-xs mt-1">Please enter your Booking ID and mobile number to search</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
