"use client";

import React from "react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">System Settings</h1>
        <p className="text-neutral-400 text-sm">Configure security constraints, global contact emails, and tracking scripts.</p>
      </div>

      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[40vh] border-dashed">
        <span className="text-4xl mb-4">⚙️</span>
        <h3 className="text-lg font-bold text-white mb-2">Global Settings Console</h3>
        <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">
          Google Tag Manager codes, Meta pixels, SSL redirects, and security constraints can be customized here.
        </p>
        <button className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors text-xs uppercase tracking-wider disabled:opacity-40" disabled>
          Save Configurations
        </button>
      </div>
    </div>
  );
}
