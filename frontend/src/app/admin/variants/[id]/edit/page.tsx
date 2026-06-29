"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
}

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
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

  // New Features and Specifications fields
  const [safetyFeatures, setSafetyFeatures] = useState("");
  const [comfortFeatures, setComfortFeatures] = useState("");
  const [exteriorFeatures, setExteriorFeatures] = useState("");
  const [interiorFeatures, setInteriorFeatures] = useState("");
  const [technologyFeatures, setTechnologyFeatures] = useState("");
  const [performanceFeatures, setPerformanceFeatures] = useState("");

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [wheelbase, setWheelbase] = useState("");
  const [groundClearance, setGroundClearance] = useState("");
  const [bootSpace, setBootSpace] = useState("");
  const [fuelTank, setFuelTank] = useState("");
  const [tyres, setTyres] = useState("");
  const [brakes, setBrakes] = useState("");
  const [suspension, setSuspension] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/variants/${id}`);
        const data = await res.json();
        if (res.ok && data.variant) {
          const v = data.variant;
          setName(v.name || "");
          setVehicleId(v.vehicleId || "");
          setTransmission(v.transmission || "Manual");
          setFuelType(v.fuelType || "Petrol");
          setSeating(v.seating || 5);
          setPrice(v.price ? String(v.price) : "");
          setBookingAmount(v.bookingAmount ? String(v.bookingAmount) : "");
          setStatus(v.status || "ACTIVE");
          
          setEngineSize(v.engineSize || "");
          setWaitingPeriodWeeks(v.waitingPeriodWeeks ? String(v.waitingPeriodWeeks) : "");
          
          if (v.specs) {
            setSafetyFeatures(v.specs.safetyFeatures?.join(", ") || "");
            setComfortFeatures(v.specs.comfortFeatures?.join(", ") || "");
            setExteriorFeatures(v.specs.exteriorFeatures?.join(", ") || "");
            setInteriorFeatures(v.specs.interiorFeatures?.join(", ") || "");
            setTechnologyFeatures(v.specs.technologyFeatures?.join(", ") || "");
            setPerformanceFeatures(v.specs.performanceFeatures?.join(", ") || "");
            setLength(v.specs.length || "");
            setWidth(v.specs.width || "");
            setHeight(v.specs.height || "");
            setWheelbase(v.specs.wheelbase || "");
            setGroundClearance(v.specs.groundClearance || "");
            setBootSpace(v.specs.bootSpace || "");
            setFuelTank(v.specs.fuelTank || "");
            setTyres(v.specs.tyres || "");
            setBrakes(v.specs.brakes || "");
            setSuspension(v.specs.suspension || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch variant:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [id, apiBaseUrl]);


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
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles`);
        const data = await res.json();
        if (res.ok) {
          setVehicles(data.vehicles || []);
          if (data.vehicles && data.vehicles.length > 0) {
            setVehicleId(data.vehicles[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load vehicles:", err);
      }
    };
    fetchVehicles();
  }, [apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!vehicleId) {
      setError("Please select a vehicle model.");
      setLoading(false);
      return;
    }

    const parseFeatures = (text: string) => {
      return text
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    };

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
          specs: {
            safetyFeatures: parseFeatures(safetyFeatures),
            comfortFeatures: parseFeatures(comfortFeatures),
            exteriorFeatures: parseFeatures(exteriorFeatures),
            interiorFeatures: parseFeatures(interiorFeatures),
            technologyFeatures: parseFeatures(technologyFeatures),
            performanceFeatures: parseFeatures(performanceFeatures),
            length,
            width,
            height,
            wheelbase,
            groundClearance,
            bootSpace,
            fuelTank,
            tyres,
            brakes,
            suspension,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create variant");

      setSuccess("Variant updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/variants");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create variant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Edit Variant</h1>
          <p className="text-neutral-400 text-sm">Add a specifications variant model to the vehicle catalog.</p>
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
              placeholder="e.g. 2.8L 4x4 AT"
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
              placeholder="e.g. 3343000"
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
              placeholder="e.g. 50000"
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
              placeholder="e.g. 4"
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
              placeholder="e.g. 0"
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
              placeholder="e.g. 2755"
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
              placeholder="e.g. 14.4"
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
              placeholder="e.g. 204"
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
              placeholder="e.g. 500"
              value={torque}
              onChange={(e) => setTorque(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        {/* Features Extension Section */}
        <div className="border-t border-neutral-800 pt-6 space-y-6">
          <h3 className="text-lg font-black tracking-tight text-white uppercase">Features</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Safety Features (comma separated)</label>
              <textarea
                placeholder="e.g. 7 Airbags, ABS with EBD, Vehicle Stability Control, Hill Assist Control"
                value={safetyFeatures}
                onChange={(e) => setSafetyFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Comfort Features (comma separated)</label>
              <textarea
                placeholder="e.g. Dual Zone Auto AC, Ventilated Seats, Cruise Control"
                value={comfortFeatures}
                onChange={(e) => setComfortFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Exterior Features (comma separated)</label>
              <textarea
                placeholder="e.g. LED Projector Headlamps, R18 Alloy Wheels, Chrome Grille"
                value={exteriorFeatures}
                onChange={(e) => setExteriorFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Interior Features (comma separated)</label>
              <textarea
                placeholder="e.g. Leather Seats, Soft Touch Dashboard, Ambient Lighting"
                value={interiorFeatures}
                onChange={(e) => setInteriorFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Technology Features (comma separated)</label>
              <textarea
                placeholder="e.g. 9-inch Touchscreen Infotainment, Android Auto, Apple CarPlay, Connected Car Tech"
                value={technologyFeatures}
                onChange={(e) => setTechnologyFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Performance Features (comma separated)</label>
              <textarea
                placeholder="e.g. Eco/Power Drive Modes, Paddle Shifters, Active Traction Control"
                value={performanceFeatures}
                onChange={(e) => setPerformanceFeatures(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700 h-20"
              />
            </div>
          </div>
        </div>

        {/* Specifications Extension Section */}
        <div className="border-t border-neutral-800 pt-6 space-y-6">
          <h3 className="text-lg font-black tracking-tight text-white uppercase">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Length (mm)</label>
              <input
                type="text"
                placeholder="e.g. 4795"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Width (mm)</label>
              <input
                type="text"
                placeholder="e.g. 1855"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Height (mm)</label>
              <input
                type="text"
                placeholder="e.g. 1835"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Wheelbase (mm)</label>
              <input
                type="text"
                placeholder="e.g. 2745"
                value={wheelbase}
                onChange={(e) => setWheelbase(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Ground Clearance (mm)</label>
              <input
                type="text"
                placeholder="e.g. 220"
                value={groundClearance}
                onChange={(e) => setGroundClearance(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Boot Space (Liters)</label>
              <input
                type="text"
                placeholder="e.g. 296"
                value={bootSpace}
                onChange={(e) => setBootSpace(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Fuel Tank Capacity (Liters)</label>
              <input
                type="text"
                placeholder="e.g. 80"
                value={fuelTank}
                onChange={(e) => setFuelTank(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Tyres</label>
              <input
                type="text"
                placeholder="e.g. 265/60 R18 Radial tubeless"
                value={tyres}
                onChange={(e) => setTyres(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Brakes</label>
              <input
                type="text"
                placeholder="e.g. Front & Rear Ventilated Disc Brakes"
                value={brakes}
                onChange={(e) => setBrakes(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Suspension</label>
              <input
                type="text"
                placeholder="e.g. Double Wishbone with Stabilizer / 4-Link with Lateral Control Rod"
                value={suspension}
                onChange={(e) => setSuspension(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? "Creating..." : "Save Variant"}
          </button>
        </div>
      </form>
    </div>
  );
}
