"use client";

import React, { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string; // BOOKING, PAYMENT, TEST_DRIVE, DELIVERY, PROMOTION
  isRead: boolean;
  createdAt: string;
}

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: status !== "all" ? status : "",
        type: type !== "all" ? type : "",
      });

      const res = await fetch(`${apiBaseUrl}/api/dashboard/notifications?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: unknown) {
      console.error("Fetch notifications error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while loading your alerts.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, apiBaseUrl]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, page, status, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/dashboard/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getNotificationIcon = (notifType: string) => {
    switch (notifType) {
      case "BOOKING":
        return "🚗";
      case "PAYMENT":
        return "💳";
      case "TEST_DRIVE":
        return "📅";
      case "DELIVERY":
        return "🎁";
      case "PROMOTION":
        return "🏷️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Notification Center</h1>
        <p className="text-sm text-neutral-400">View and manage your booking updates, payment receipts, and test drive reminders.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Filtering Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => { setStatus("all"); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              status === "all" ? "bg-white text-neutral-950" : "bg-neutral-900/40 border border-neutral-800 text-neutral-450 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setStatus("unread"); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              status === "unread" ? "bg-white text-neutral-950" : "bg-neutral-900/40 border border-neutral-800 text-neutral-450 hover:text-white"
            }`}
          >
            Unread
          </button>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-neutral-900/40 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="BOOKING">Booking Updates</option>
            <option value="PAYMENT">Payments</option>
            <option value="TEST_DRIVE">Test Drives</option>
            <option value="DELIVERY">Delivery</option>
            <option value="PROMOTION">Promotional</option>
          </select>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 hover:bg-neutral-850 text-white rounded-lg text-xs font-semibold transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500">No message notifications match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`bg-neutral-900/20 border rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer ${
                notif.isRead ? "border-neutral-850 opacity-70" : "border-neutral-700/80 bg-neutral-900/40 hover:border-neutral-500"
              }`}
            >
              <div className="flex gap-4 items-start flex-1">
                {/* Type Icon Badge */}
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-center text-lg shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eb0a1e]" title="Unread" />
                    )}
                  </div>
                  <p className="text-neutral-300 text-xs font-medium pr-4">{notif.content}</p>
                </div>
              </div>

              <div className="flex md:flex-col items-start md:items-end justify-between border-t border-neutral-850/40 md:border-t-0 pt-3 md:pt-0 text-[11px] text-neutral-500">
                <span>
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notif.id);
                    }}
                    className="mt-1 text-[#eb0a1e] hover:underline font-semibold text-[10px] uppercase tracking-wide"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 text-xs text-neutral-400">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 disabled:opacity-30 rounded-lg text-white font-semibold transition-all"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 disabled:opacity-30 rounded-lg text-white font-semibold transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
