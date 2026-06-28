"use client";

import React, { useEffect, useState } from "react";

export default function InventoryStatusWidget({ vehicleId }: { vehicleId: string }) {
  const [status, setStatus] = useState<string>("LOADING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiBaseUrl}/api/public/inventory/status?vehicleId=${vehicleId}`);
        const data = await res.json();
        if (res.ok) {
          setStatus(data.data.statusLabel);
        } else {
          setStatus("UNKNOWN");
        }
      } catch {
        setStatus("UNKNOWN");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [vehicleId]);

  if (loading || status === "UNKNOWN") return null;

  return (
    <div className="flex items-center gap-2 mt-4 bg-[#18181b]/50 border border-[#27272a]/60 px-4 py-2 rounded-lg w-fit">
      <div className={`w-2 h-2 rounded-full ${
        status === 'IN_STOCK' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
        status === 'LIMITED_STOCK' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' :
        'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      }`}></div>
      <span className="text-xs font-bold tracking-widest uppercase">
        {status === 'IN_STOCK' ? 'In Stock (Ready for Delivery)' :
         status === 'LIMITED_STOCK' ? 'Limited Stock (High Demand)' :
         'Out of Stock (Join Waitlist)'}
      </span>
    </div>
  );
}
