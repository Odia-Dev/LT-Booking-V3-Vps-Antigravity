"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

function TestDriveBookingContent() {
  const searchParams = useSearchParams();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // URL Presets
  const presetVehicleSlug = searchParams.get("vehicle") || "";
  const presetBranchId = searchParams.get("branch") || "";

  // Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(presetBranchId);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ id: string; testDriveId: string } | null>(null);
  const [error, setError] = useState("");

  // UTM Metadata
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [referrer, setReferrer] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");

  // Fetch branches and vehicles
  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, branchesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/public/vehicles`),
          fetch(`${apiBaseUrl}/api/public/branches`),
        ]);

        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          const vehiclesList = data.vehicles || [];
          setVehicles(vehiclesList);

          // Apply preset vehicle if slug matches
          if (presetVehicleSlug) {
            const found = vehiclesList.find((v: Vehicle) => v.slug === presetVehicleSlug);
            if (found) {
              setSelectedVehicle(found.id);
            }
          }
        }
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    fetchData();
  }, [apiBaseUrl, presetVehicleSlug]);

  // Fetch variants when vehicle changes
  useEffect(() => {
    if (!selectedVehicle) {
      setVariants([]);
      setSelectedVariant("");
      return;
    }

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (!vehicle) return;

    const vehicleSlug = vehicle.slug;

    async function fetchVariants() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/public/vehicles/${vehicleSlug}/variants`);
        if (res.ok) {
          const data = await res.json();
          setVariants(data.variants || []);
        }
      } catch (err) {
        console.error("Failed to load variants", err);
      }
    }

    fetchVariants();
  }, [selectedVehicle, vehicles, apiBaseUrl]);

  // Capture UTM parameters & Referrer info
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtmSource(params.get("utm_source") || sessionStorage.getItem("utm_source") || "");
      setUtmMedium(params.get("utm_medium") || sessionStorage.getItem("utm_medium") || "");
      setUtmCampaign(params.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "");
      setReferrer(document.referrer || "");
      setLandingPageUrl(window.location.href);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("Please check the consent box to schedule your test drive.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        vehicleId: selectedVehicle,
        variantId: selectedVariant,
        branchId: selectedBranch,
        preferredDate: new Date(preferredDate).toISOString(),
        preferredTime,
        notes: message || undefined,
        campaign: utmCampaign || undefined,
        medium: utmMedium || undefined,
        source: utmSource || undefined,
        referrer: referrer || undefined,
        landingPageUrl: landingPageUrl || undefined,
      };

      const res = await fetch(`${apiBaseUrl}/api/public/test-drives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to book appointment slot. Try a different day/time.");
      }

      setSuccessDetails(data.appointment);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getMinDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDateString = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  if (success) {
    return (
      <div className="bg-[#18181b]/35 border border-emerald-900/50 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <span className="text-5xl text-emerald-500">✓</span>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Test Drive Confirmed!</h2>
          <p className="text-xs text-neutral-400 font-mono mt-1.5">Appointment Ref: {successDetails?.testDriveId}</p>
        </div>
        <p className="text-neutral-300 text-sm max-w-md leading-relaxed font-light">
          Your slot has been registered. An executive from the showroom will contact you shortly to confirm driving license details and coordinates.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Go to Home
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setPhone("");
              setEmail("");
              setSelectedVehicle("");
              setSelectedVariant("");
              setSelectedBranch("");
              setPreferredDate("");
              setPreferredTime("");
              setMessage("");
              setConsent(false);
            }}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  const timeslots = [
    "09:00 AM - 10:30 AM",
    "10:30 AM - 12:00 PM",
    "12:00 PM - 01:30 PM",
    "01:30 PM - 03:00 PM",
    "03:00 PM - 04:30 PM",
    "04:30 PM - 06:00 PM",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 md:p-8">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
          Toyota Drive Experience
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">Book a Test Drive</h1>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
          Select your vehicle, location, and preferred appointment time. Valid Driver&apos;s License required.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Model interest */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">1. Select Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Model</label>
              <select
                required
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
              >
                <option value="" className="bg-[#18181b]">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#18181b]">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Variant</label>
              <select
                required
                value={selectedVariant}
                disabled={!selectedVehicle}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 disabled:opacity-40 appearance-none"
              >
                <option value="" className="bg-[#18181b]">Select Variant</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#18181b]">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Showroom showroom location */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">2. Choose Location</h3>
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Showroom Branch</label>
            <select
              required
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
            >
              <option value="" className="bg-[#18181b]">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#18181b]">
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Date & time slot */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">3. Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Appointment Date</label>
              <input
                type="date"
                required
                min={getMinDateString()}
                max={getMaxDateString()}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Time Slot</label>
              <select
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
              >
                <option value="" className="bg-[#18181b]">Select Time Slot</option>
                {timeslots.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#18181b]">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 4: Customer Details */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">4. Customer Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Remarks / Message (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention if you require home delivery or specific hybrid drive briefing..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
              />
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[#eb0a1e]"
              />
              <label htmlFor="consent" className="text-xs text-neutral-400 cursor-pointer select-none leading-relaxed">
                I hereby declare that I hold a valid Permanent Driving License and authorize Laxmi Toyota to contact me regarding my test drive appointment.
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-extrabold uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-40"
        >
          {loading ? "Registering appointment..." : "Confirm Test Drive Appointment"}
        </button>
      </form>
    </div>
  );
}

export default function PublicTestDrivePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] py-20 px-6">
      <Suspense fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading form modules...</span>
        </div>
      }>
        <TestDriveBookingContent />
      </Suspense>
    </div>
  );
}
