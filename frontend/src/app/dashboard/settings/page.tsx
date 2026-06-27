"use client";

import React from "react";
import Link from "next/link";

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
        <p className="text-sm text-neutral-400">Manage your system credentials, notification subscriptions, and profile preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal details card */}
        <div className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">👤 Personal Identity Settings</h2>
            <p className="text-xs text-neutral-400 mb-6">Modify your name, location branch, and billing address used during checkout reservations.</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="w-full text-center py-3 bg-white hover:bg-neutral-250 text-neutral-950 font-bold rounded-lg text-sm transition-colors"
          >
            Edit Profile Details
          </Link>
        </div>

        {/* Subscription details card */}
        <div className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">🔔 Notification Channels</h2>
            <p className="text-xs text-neutral-400 mb-6">Select channels to receive booking alerts, payment invoices, and schedules.</p>
          </div>
          <button
            disabled
            className="w-full text-center py-3 bg-neutral-900 border border-neutral-800 text-neutral-500 font-bold rounded-lg text-sm cursor-not-allowed"
          >
            SMS & Email Enabled
          </button>
        </div>
      </div>
    </div>
  );
}
