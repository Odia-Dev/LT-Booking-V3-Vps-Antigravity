"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
}

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [transmission, setTransmission] = useState("Manual");
  const [fuelType, setFuelType] = useState("Petrol");
  const [seating, setSeating] = useState(5);
  const [price, setPrice] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  
  // Custom metadata fields (validated by schema, stubbed/logged on backend)
  const [slug, setSlug] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [mileage, setMileage] = useState("");
  const [power, setPower] = useState("");
  const [torque, setTorque] = useState("");
  const [driveType, setDriveType] = useState("FWD");
  const [waitingPeriodWeeks, setWaitingPeriodWeeks] = useState("4");
  const [sortOrder, setSortOrder] = useState("0");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Auto-generate slug from name
  useEffect(() => {
    const generated = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    setSlug(generated);
  }, [name]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicles
        const vehRes = await fetch(`${apiBaseUrl}/api/vehicles`);
        const vehData = await vehRes.json();
        if (vehRes.ok) {
          setVehicles(vehData.vehicles || []);
        }

        // Fetch variant
        const varRes = await fetch(`${apiBaseUrl}/api/variants/${id}`);
        const varData = await varRes.json();
        if (!varRes.ok) throw new Error(varData.message || "Failed to load variant");

        const v = varData.variant;
        setName(v.name);
        setVehicleId(v.vehicleId);
        setPrice(String(v.price));
        setFuelType(v.fuelType);
        setTransmission(v.transmission);
        setSeating(v.seating);
        setStatus(v.status);
        if (v.bookingAmount) setBookingAmount(String(v.bookingAmount));
        if (v.engineSize) setEngineSize(String(v.engineSize));
        if (v.waitingPeriodWeeks) setWaitingPeriodWeeks(String(v.waitingPeriodWeeks));
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load variant data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/variants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          name,
          price: Number(price),
          fuelType,
          transmission,
          seating: Number(seating),
          status,
          bookingAmount: bookingAmount ? Number(bookingAmount) : undefined,
          engineSize: engineSize ? String(engineSize) : undefined,
          waitingPeriodWeeks: waitingPeriodWeeks ? Number(waitingPeriodWeeks) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update variant");

      setSuccess("Variant updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/variants");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update variant.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading variant details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Edit Variant</h1>
          <p className="text-neutral-400 text-sm">Modify specifications and parameters for the selected variant model.</p>
        </div>
        <Link
          href="/admin/variants"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs uppercase font-bold transition-colors"
        >
          Cancel
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#18181b]/35 border border-neutral-800 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variant Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Variant Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Generated Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Slug (Generated)</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full bg-[#09090b]/55 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Parent Vehicle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Vehicle Lineup</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Seating Capacity</label>
            <input
              type="number"
              required
              min={1}
              value={seating}
              onChange={(e) => setSeating(Number(e.target.value))}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Transmission</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="e-Drive">e-Drive</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Ex-Showroom Price (₹)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Booking Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Booking Deposit (₹)</label>
            <input
              type="number"
              value={bookingAmount}
              onChange={(e) => setBookingAmount(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Waiting Period */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Waiting Period (Weeks)</label>
            <input
              type="number"
              value={waitingPeriodWeeks}
              onChange={(e) => setWaitingPeriodWeeks(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Status */}
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

          {/* Drive Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Drive Type</label>
            <select
              value={driveType}
              onChange={(e) => setDriveType(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="FWD">FWD (Front Wheel Drive)</option>
              <option value="RWD">RWD (Rear Wheel Drive)</option>
              <option value="AWD">AWD (All Wheel Drive)</option>
              <option value="4WD">4WD (4x4 Drive)</option>
            </select>
          </div>

          {/* Engine Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Engine Displacement (cc)</label>
            <input
              type="text"
              value={engineSize}
              onChange={(e) => setEngineSize(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Mileage (km/l)</label>
            <input
              type="text"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Power */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Max Power (PS)</label>
            <input
              type="text"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Torque */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Max Torque (Nm)</label>
            <input
              type="text"
              value={torque}
              onChange={(e) => setTorque(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? "Saving Changes..." : "Save Variant"}
          </button>
        </div>
      </form>
    </div>
  );
}
