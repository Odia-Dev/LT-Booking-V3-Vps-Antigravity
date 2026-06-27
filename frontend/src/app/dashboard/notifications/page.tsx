"use client";

import React, { useState, useEffect } from "react";

interface NotificationLog {
  id: string;
  bookingId?: string;
  testDriveId?: string;
  recipient: string;
  channel: string;
  type: string;
  status: string;
  content: string;
  createdAt: string;
}

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/notifications`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load notifications");
        }

        setNotifications(data.notifications || []);
      } catch (err: unknown) {
        console.error("Fetch notifications error:", err);
        const msg = err instanceof Error ? err.message : "An error occurred while loading your alerts.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Notifications Log</h1>
        <p className="text-sm text-neutral-400">View message dispatch records and transaction status alerts sent to you.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500">No message notifications have been dispatched to your recipient contact.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-850 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    notif.channel === "SMS"
                      ? "bg-blue-950 text-blue-400 border border-blue-900"
                      : notif.channel === "EMAIL"
                      ? "bg-purple-950 text-purple-400 border border-purple-900"
                      : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                  }`}>
                    {notif.channel}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {notif.type.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-neutral-200 text-sm font-medium pr-4">{notif.content}</p>
                <div className="text-[11px] text-neutral-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>To: {notif.recipient}</span>
                  {notif.bookingId && <span>Booking ID: {notif.bookingId}</span>}
                </div>
              </div>

              <div className="flex md:flex-col items-start md:items-end justify-between border-t border-neutral-850/40 md:border-t-0 pt-3 md:pt-0 text-xs">
                <span className="text-neutral-500">
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className={`mt-1 font-semibold uppercase tracking-wider text-[10px] ${
                  notif.status === "SENT" || notif.status === "SUCCESS"
                    ? "text-emerald-400"
                    : notif.status === "FAILED"
                    ? "text-red-400"
                    : "text-amber-400"
                }`}>
                  {notif.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
