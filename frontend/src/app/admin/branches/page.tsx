"use client";

import React from "react";

export default function AdminBranchesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Branches CMS</h1>
        <p className="text-neutral-400 text-sm">Configure physical showroom locations, manager details, and contact coordinates.</p>
      </div>

      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[40vh] border-dashed">
        <span className="text-4xl mb-4">🏢</span>
        <h3 className="text-lg font-bold text-white mb-2">Branch CMS Console</h3>
        <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">
          The database has been seeded with Odisha branches (Bhubaneswar HQ, Cuttack East). Branch CRUD panels will be built here.
        </p>
        <button className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors text-xs uppercase tracking-wider disabled:opacity-40" disabled>
          + Add New Branch
        </button>
      </div>
    </div>
  );
}
