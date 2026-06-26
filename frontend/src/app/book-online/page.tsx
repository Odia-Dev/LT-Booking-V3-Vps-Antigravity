"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  startingPrice?: number;
  bookingAmount?: number;
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

function BookOnlineContent() {
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
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(presetBranchId);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ id: string; bookingId: string; bookingAmount: number } | null>(null);
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

  // Determine current booking amount
  const getBookingAmount = () => {
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    return vehicle?.bookingAmount || 25000; // default booking amount
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("Please check the consent box to proceed with the booking.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        city,
        state,
        vehicleId: selectedVehicle,
        variantId: selectedVariant,
        branchId: selectedBranch,
        bookingAmount: getBookingAmount(),
        notes: message || undefined,
        campaign: utmCampaign || undefined,
        medium: utmMedium || undefined,
        source: utmSource || undefined,
        referrer: referrer || undefined,
        landingPageUrl: landingPageUrl || undefined,
      };

      const res = await fetch(`${apiBaseUrl}/api/public/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate online booking. Please try again.");
      }

      setSuccessDetails(data.booking);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#18181b]/35 border border-yellow-700/50 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[450px] space-y-6">
        <span className="text-5xl text-yellow-500">⏳</span>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Payment Pending</h2>
          <p className="text-xs text-neutral-400 font-mono mt-1.5">Booking Ref ID: {successDetails?.bookingId}</p>
        </div>
        
        <div className="bg-[#09090b]/80 border border-neutral-800 rounded-xl p-6 w-full max-w-md text-left space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Booking Summary</h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Vehicle:</span>
            <span className="text-white font-semibold">
              {vehicles.find((v) => v.id === selectedVehicle)?.name}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Variant:</span>
            <span className="text-white font-semibold">
              {variants.find((v) => v.id === selectedVariant)?.name}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Dealership Branch:</span>
            <span className="text-white font-semibold">
              {branches.find((b) => b.id === selectedBranch)?.name}
            </span>
          </div>
          <div className="h-px bg-neutral-800 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Booking Amount Paid:</span>
            <span className="text-lg font-black text-yellow-500">₹{successDetails?.bookingAmount?.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-neutral-300 text-sm max-w-md leading-relaxed font-light">
          Your booking has been registered in our system under Status **Initiated**. A sales representative from the selected dealership will contact you to send the payment link and finalize allocation details.
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
              setCity("");
              setState("");
              setSelectedVehicle("");
              setSelectedVariant("");
              setSelectedBranch("");
              setMessage("");
              setConsent(false);
            }}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Book Another Car
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 md:p-8">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
          Toyota Online Store
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">Book Your Toyota Online</h1>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
          Complete the form below to initiate your vehicle reservation. Our team will coordinate delivery and options.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Model Selection */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">1. Select Vehicle & Variant</h3>
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
                    {v.name} (Booking: ₹{(v.bookingAmount || 25000).toLocaleString()})
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
                    {v.name} (Ex-Showroom: ₹{v.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Showroom Location */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">2. Select Showroom Location</h3>
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Branch</label>
            <select
              required
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
            >
              <option value="" className="bg-[#18181b]">Select Branch Showroom</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#18181b]">
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Customer Information */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">3. Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Additional Message (Optional)</label>
            <textarea
              rows={3}
              placeholder="Any specific delivery preferences or options request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 resize-none"
            />
          </div>
        </div>

        {/* Step 4: Summary & Consent */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">4. Booking Summary & Consent</h3>
          
          <div className="bg-[#09090b]/40 border border-neutral-800/80 rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Standard Reservation Amount</span>
              <span className="text-white font-mono">₹{getBookingAmount().toLocaleString()}</span>
            </div>
            <div className="h-px bg-neutral-800 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">Total Booking Amount:</span>
              <span className="text-xl font-black text-[#eb0a1e]">₹{getBookingAmount().toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-normal font-light">
              *The booking amount is fully adjustable against the final ex-showroom price of the vehicle at the time of final invoice. Terms and conditions apply.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-800 bg-[#09090b]/60 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="consent" className="text-xs text-neutral-300 leading-relaxed font-light">
                I hereby declare that the information provided is correct. I authorize Laxmi Toyota to contact me via Call, SMS, WhatsApp, and Email. I accept the{" "}
                <span className="text-[#eb0a1e] hover:underline cursor-pointer">Terms & Conditions</span>.
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#eb0a1e] hover:bg-[#c90817] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Processing Booking..." : "Submit Online Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookOnlinePage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-8 bg-black">
      <Suspense fallback={<div className="text-white text-center py-10">Loading reservation portal...</div>}>
        <BookOnlineContent />
      </Suspense>
    </main>
  );
}
