"use client";

import React, { useState, useEffect } from "react";

export type LeadFormType =
  | "GENERAL"
  | "CALL_BACK"
  | "PRICE_QUOTE"
  | "BROCHURE"
  | "FINANCE"
  | "EXCHANGE";

interface LeadFormProps {
  formType: LeadFormType;
  vehicleId?: string;
  variantId?: string;
  branchId?: string;
  onSuccess?: () => void;
}

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

export default function LeadForm({
  formType,
  vehicleId: initialVehicleId = "",
  variantId: initialVariantId = "",
  branchId: initialBranchId = "",
  onSuccess,
}: LeadFormProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicleId);
  const [selectedVariant, setSelectedVariant] = useState(initialVariantId);
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  // Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // UTM & Metadata
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
          setVehicles(data.vehicles || []);
        }
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error("Failed to load initial form options", err);
      }
    }
    fetchData();
  }, [apiBaseUrl]);

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

      // Store in session storage if query contains them
      if (params.get("utm_source")) sessionStorage.setItem("utm_source", params.get("utm_source")!);
      if (params.get("utm_medium")) sessionStorage.setItem("utm_medium", params.get("utm_medium")!);
      if (params.get("utm_campaign")) sessionStorage.setItem("utm_campaign", params.get("utm_campaign")!);
    }
  }, []);

  const getFormTitle = () => {
    switch (formType) {
      case "GENERAL":
        return "General Enquiry";
      case "CALL_BACK":
        return "Request a Call Back";
      case "PRICE_QUOTE":
        return "Get Price Quote";
      case "BROCHURE":
        return "Download Brochure";
      case "FINANCE":
        return "Finance & Loan Enquiry";
      case "EXCHANGE":
        return "Vehicle Exchange Valuation";
      default:
        return "Enquire Now";
    }
  };

  const getBackendType = () => {
    if (formType === "FINANCE") return "FINANCE";
    if (formType === "EXCHANGE") return "EXCHANGE";
    return "GENERAL";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("You must consent to be contacted to submit this form.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        type: getBackendType(),
        source: utmSource ? "GOOGLE_ADS" : "ORGANIC", // fallback logic
        notes: `Form Type: ${formType} | Referrer: ${referrer} | Landing Page: ${landingPageUrl}`,
        branchId: selectedBranch || null,
        variantId: selectedVariant || null,
        campaign: utmCampaign || undefined,
        medium: utmMedium || undefined,
        message: message || undefined,
        interestedModel: vehicles.find((v) => v.id === selectedVehicle)?.name || undefined,
      };

      const res = await fetch(`${apiBaseUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit enquiry.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#18181b]/35 border border-emerald-900/50 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-4xl mb-4 text-emerald-500">✓</span>
        <h3 className="text-lg font-bold text-white mb-2">Thank you!</h3>
        <p className="text-neutral-400 text-sm max-w-sm mb-6 leading-relaxed">
          Your enquiry has been successfully submitted. Our team will contact you shortly.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setName("");
            setPhone("");
            setEmail("");
            setMessage("");
            setConsent(false);
          }}
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors text-xs uppercase tracking-wider"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">{getFormTitle()}</h2>
        <p className="text-neutral-400 text-xs">Fill out the details below, and our dealership representatives will get in touch.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        {/* Branch */}
        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
            Preferred Showroom Branch
          </label>
          <select
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

        {/* Vehicle Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
              Model of Interest
            </label>
            <select
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
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
              Preferred Variant
            </label>
            <select
              value={selectedVariant}
              disabled={!selectedVehicle}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 disabled:opacity-40 appearance-none"
            >
              <option value="" className="bg-[#18181b]">Select Variant</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#18181b]">
                  {v.name} (₹{(v.price / 100000).toFixed(2)} Lakh)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-1">
            {formType === "EXCHANGE" ? "Details of vehicle to exchange (Make, Model, Year, KM)" : "Message / Remarks"}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              formType === "EXCHANGE"
                ? "e.g. Maruti Suzuki Swift, 2018, 45,000 km, VXI variant"
                : "Enter any questions or specific requests here..."
            }
            rows={3}
            className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-[#eb0a1e]"
          />
          <label htmlFor="consent" className="text-xs text-neutral-400 leading-relaxed cursor-pointer select-none">
            I hereby authorize Laxmi Toyota to contact me via phone call, SMS, or WhatsApp regarding this enquiry.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-extrabold uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-40"
        >
          {loading ? "Submitting..." : "Submit Enquiry"}
        </button>
      </form>
    </div>
  );
}
