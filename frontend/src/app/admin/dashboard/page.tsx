"use client";

import React from "react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Active Leads", value: "24", change: "+12% this week", color: "border-blue-500" },
    { title: "Completed Bookings", value: "8", change: "+4 this week", color: "border-emerald-500" },
    { title: "Total Showroom Catalog", value: "4 Vehicles", change: "12 variants total", color: "border-purple-500" },
    { title: "Active Offers", value: "2 Active", change: "Expires end of month", color: "border-rose-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Dashboard Console</h1>
        <p className="text-neutral-400 text-sm">Real-time telemetry, dealership configuration logs, and customer metrics.</p>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 flex flex-col justify-between ${stat.color} border-t-2`}
          >
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                {stat.title}
              </span>
              <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-4 inline-block">
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Activity placeholder */}
      <div className="bg-[#18181b]/20 border border-[#27272a]/60 rounded-xl p-8">
        <h3 className="text-lg font-bold text-white mb-4">Telemetry Logs & Activity</h3>
        <div className="space-y-4 font-mono text-xs text-neutral-400">
          <div className="flex justify-between py-2 border-b border-[#27272a]/30">
            <span>[SYSTEM] Admin user logged into security console</span>
            <span className="text-neutral-600">Just now</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#27272a]/30">
            <span>[DATABASE] Successfully synced models from migrations</span>
            <span className="text-neutral-600">10 minutes ago</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#27272a]/30">
            <span>[DATABASE] Seeding script completed successfully (8 records loaded)</span>
            <span className="text-neutral-600">12 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
