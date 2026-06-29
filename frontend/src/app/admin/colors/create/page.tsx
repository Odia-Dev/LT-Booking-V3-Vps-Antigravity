"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

interface Vehicle {
  id: string;
  name: string;
}

export default function CreateColorPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [vehicleId, setVehicleId] = useState("");
  const [name, setName] = useState("");
  const [colorCode, setColorCode] = useState("#1C1C1E");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles`);
        const data = await res.json();
        setVehicles(data.data || data.vehicles || []);
        if (data.data?.length > 0) {
          setVehicleId(data.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load vehicles", err);
      } finally {
        setLoadingVehicles(false);
      }
    }
    fetchVehicles();
  }, [apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${apiBaseUrl}/api/admin/colors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId,
          name,
          colorCode,
          image,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create color");

      router.push("/admin/colors");
    } catch (err: unknown) {
      setError((err as Error).message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <Link href="/admin/colors" className="text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-2 block transition-colors">
            ← Back to Colors
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">New Color</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Target Vehicle</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={loadingVehicles}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          >
            <option value="">Select a vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Color Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Attitude Black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Hex Color Code</label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              className="w-14 h-14 rounded-lg cursor-pointer border border-neutral-700 bg-[#09090b] p-1"
            />
            <input
              type="text"
              required
              placeholder="#1C1C1E"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 font-mono"
            />
          </div>
        </div>

        <ImageUpload
          label="Color Media (Optional)"
          value={image}
          onChange={setImage}
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={submitting || !vehicleId}
            className="w-full py-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Color"}
          </button>
        </div>
      </form>
    </div>
  );
}
