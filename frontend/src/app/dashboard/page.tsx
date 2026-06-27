"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface StatItem {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  colorClass: string;
}

interface DashboardStats {
  bookingsCount: number;
  paymentsCount: number;
  testDrivesCount: number;
  notificationsCount: number;
  recentBooking: {
    bookingId: string;
    bookingStatus: string;
    bookingAmount: number;
    createdAt: string;
    vehicle?: { name: string };
    variant?: { name: string };
    branch?: { name: string };
  } | null;
  recentTestDrive: {
    testDriveId: string;
    status: string;
    preferredDate: string;
    preferredTime: string;
    vehicle?: { name: string };
    variant?: { name: string };
    branch?: { name: string };
  } | null;
}

export default function CustomerDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    bookingsCount: 0,
    paymentsCount: 0,
    testDrivesCount: 0,
    notificationsCount: 0,
    recentBooking: null,
    recentTestDrive: null,
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const fetchOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include" as const,
        };

        const [bookingsRes, paymentsRes, testDrivesRes, notificationsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/bookings`, fetchOptions),
          fetch(`${apiBaseUrl}/api/payments`, fetchOptions),
          fetch(`${apiBaseUrl}/api/test-drives`, fetchOptions),
          fetch(`${apiBaseUrl}/api/notifications`, fetchOptions),
        ]);

        let bookingsCount = 0;
        let recentBooking = null;
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          bookingsCount = bookingsData.total || bookingsData.data?.length || 0;
          recentBooking = bookingsData.data?.[0] || null;
        }

        let paymentsCount = 0;
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          paymentsCount = paymentsData.total || paymentsData.payments?.total || paymentsData.payments?.data?.length || 0;
        }

        let testDrivesCount = 0;
        let recentTestDrive = null;
        if (testDrivesRes.ok) {
          const testDrivesData = await testDrivesRes.json();
          const list = testDrivesData.appointments || [];
          testDrivesCount = list.length;
          recentTestDrive = list[0] || null;
        }

        let notificationsCount = 0;
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          notificationsCount = notificationsData.notifications?.length || 0;
        }

        setStats({
          bookingsCount,
          paymentsCount,
          testDrivesCount,
          notificationsCount,
          recentBooking,
          recentTestDrive,
        });
      } catch (err: unknown) {
        console.error("Error loading dashboard stats:", err);
        setError("Could not load overview statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [apiBaseUrl]);

  const statItems: StatItem[] = [
    {
      label: "Active Bookings",
      value: stats.bookingsCount,
      description: "Vehicles currently reserved",
      icon: "🚗",
      colorClass: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-900/30",
    },
    {
      label: "Payments",
      value: stats.paymentsCount,
      description: "Transactions and receipts",
      icon: "💳",
      colorClass: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-900/30",
    },
    {
      label: "Test Drives",
      value: stats.testDrivesCount,
      description: "Scheduled test experiences",
      icon: "🕒",
      colorClass: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-900/30",
    },
    {
      label: "Alerts & Info",
      value: stats.notificationsCount,
      description: "Communication history",
      icon: "🔔",
      colorClass: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-900/30",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-neutral-950/40 border border-neutral-900 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900/80 via-neutral-900/40 to-transparent border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Welcome to your <span className="text-[#eb0a1e]">Laxmi Toyota</span> Portal
        </h1>
        <p className="text-neutral-400 text-sm max-w-xl">
          Track vehicle bookings, verify payment receipts, schedule dealership test drives, and view notifications in your personalized space.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`bg-neutral-900/35 border rounded-2xl p-5 flex flex-col justify-between shadow-md transition-transform duration-250 hover:-translate-y-1 bg-gradient-to-br ${item.colorClass}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold tracking-wider uppercase opacity-80">{item.label}</span>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-xs opacity-75">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Details and Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Booking Card */}
        <div className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">🚗 Latest Vehicle Booking</h2>
              <Link href="/dashboard/bookings" className="text-xs text-[#eb0a1e] hover:underline font-semibold uppercase tracking-wider">
                View all
              </Link>
            </div>

            {stats.recentBooking ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-850 pb-4">
                  <div>
                    <h3 className="text-white font-semibold text-base">{stats.recentBooking.vehicle?.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">Variant: {stats.recentBooking.variant?.name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    stats.recentBooking.bookingStatus === "CONFIRMED" || stats.recentBooking.bookingStatus === "PAYMENT_SUCCESS"
                      ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                      : "bg-neutral-900 border border-neutral-850 text-neutral-400"
                  }`}>
                    {stats.recentBooking.bookingStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold">Booking ID</p>
                    <p className="text-neutral-200 mt-0.5 font-mono">{stats.recentBooking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold">Dealership Branch</p>
                    <p className="text-neutral-200 mt-0.5">{stats.recentBooking.branch?.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 text-sm">No bookings scheduled yet.</p>
                <Link href="/book-online" className="mt-4 inline-block text-xs bg-white text-neutral-950 font-bold px-4 py-2 rounded-lg hover:bg-neutral-250 transition-colors">
                  Explore Toyota Models
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Test Drive Card */}
        <div className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">🕒 Upcoming Test Drive</h2>
              <Link href="/dashboard/test-drives" className="text-xs text-[#eb0a1e] hover:underline font-semibold uppercase tracking-wider">
                View all
              </Link>
            </div>

            {stats.recentTestDrive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-850 pb-4">
                  <div>
                    <h3 className="text-white font-semibold text-base">{stats.recentTestDrive.vehicle?.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">Variant: {stats.recentTestDrive.variant?.name}</p>
                  </div>
                  <span className="bg-amber-950/80 border border-amber-900 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {stats.recentTestDrive.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold">Appointment Date & Time</p>
                    <p className="text-neutral-200 mt-0.5">
                      {new Date(stats.recentTestDrive.preferredDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      at {stats.recentTestDrive.preferredTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold">Location</p>
                    <p className="text-neutral-200 mt-0.5">{stats.recentTestDrive.branch?.name || "Dealership Branch"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 text-sm">No test drive appointments scheduled.</p>
                <Link href="/test-drive" className="mt-4 inline-block text-xs bg-white text-neutral-950 font-bold px-4 py-2 rounded-lg hover:bg-neutral-250 transition-colors">
                  Schedule Test Experience
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
