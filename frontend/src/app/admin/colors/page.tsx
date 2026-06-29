"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Vehicle {
  id: string;
  name: string;
}

interface VehicleColor {
  id: string;
  vehicleId: string;
  name: string;
  colorCode: string;
  image?: string;
  status: string;
  createdAt: string;
  vehicle?: Vehicle;
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchColors = useCallback(async () => {
    setLoading(true);
    try {
      // In this system, colors are fetched per vehicle. 
      // We will fetch all vehicles and aggregate.
      const vRes = await fetch(`${apiBaseUrl}/api/vehicles`);
      const vData = await vRes.json();
      const vehicles = vData.data || vData.vehicles || [];
      let allColors: VehicleColor[] = [];
      for (const v of vehicles) {
         const cRes = await fetch(`${apiBaseUrl}/api/vehicles/${v.id}/colors`);
         if (cRes.ok) {
           const cData = await cRes.json();
           const vColors = cData.colors.map((c: any) => ({ ...c, vehicle: { id: v.id, name: v.name } }));
           allColors = [...allColors, ...vColors];
         }
      }
      setColors(allColors);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load colors");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this color?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${apiBaseUrl}/api/admin/colors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Deletion failed");
      fetchColors();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Colors</h1>
          <p className="text-neutral-400 text-sm">Manage vehicle color options and media.</p>
        </div>
        <Link
          href="/admin/colors/create"
          className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg transition-colors text-xs uppercase tracking-wider shadow-lg"
        >
          + New Color
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
          Loading colors...
        </div>
      ) : colors.length === 0 ? (
        <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[40vh] border-dashed">
          <span className="text-4xl mb-4">🎨</span>
          <h3 className="text-lg font-bold text-white mb-2">No colors found</h3>
          <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">
            Add colors to your vehicles to allow customers to choose their preferred shade.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colors.map((color) => (
            <div key={color.id} className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors flex flex-col">
              {color.image ? (
                <div className="aspect-video w-full bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={color.image.startsWith("http") ? color.image : `${apiBaseUrl}${color.image}`} alt={color.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-neutral-900 border-b border-neutral-800 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full shadow-inner border border-neutral-700" style={{ backgroundColor: color.colorCode }} />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{color.name}</h3>
                    {color.vehicle && (
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">{color.vehicle.name}</p>
                    )}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-neutral-600 ml-2 shadow-sm"
                    style={{ backgroundColor: color.colorCode }}
                    title={color.colorCode}
                  />
                </div>

                <div className="mt-4 flex justify-between items-center pt-3 border-t border-neutral-800/50">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    color.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                    color.status === "INACTIVE" ? "bg-neutral-800 text-neutral-400" :
                    "bg-rose-500/20 text-rose-400"
                  }`}>
                    {color.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <Link href={`/admin/colors/${color.id}/edit`} className="text-[10px] uppercase font-bold text-neutral-400 hover:text-white transition-colors">Edit</Link>
                    <button onClick={() => handleDelete(color.id)} className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
