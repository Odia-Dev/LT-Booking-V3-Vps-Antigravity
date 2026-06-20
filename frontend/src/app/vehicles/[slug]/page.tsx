"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  heroImage: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  fuelType: string;
  transmission: string;
  seating: number;
  status: string;
}

interface VehicleColor {
  id: string;
  name: string;
  colorCode: string;
  status: string;
}

export default function CustomerVehicleDetailPage() {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantError, setVariantError] = useState("");

  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!slug) return;

    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load vehicle details");
        setVehicle(data.vehicle);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [slug, apiBaseUrl]);

  // Fetch variants once vehicle is resolved
  useEffect(() => {
    if (!vehicle) return;

    const fetchVariants = async () => {
      setLoadingVariants(true);
      setVariantError("");
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles/${vehicle.id}/variants`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load variants");
        setVariants(data.variants || []);
      } catch (err: unknown) {
        setVariantError((err as Error).message || "Failed to load variants.");
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [vehicle, apiBaseUrl]);

  // Fetch colors once vehicle is resolved
  useEffect(() => {
    if (!vehicle) return;

    const fetchColors = async () => {
      setLoadingColors(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles/${vehicle.id}/colors`);
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load colors");
        setColors(data.colors || []);
      } catch {
        setColors([]);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, [vehicle, apiBaseUrl]);

  // Inject Custom SEO headers dynamically for page crawlers
  useEffect(() => {
    if (vehicle) {
      document.title = vehicle.seoTitle || `${vehicle.name} | Laxmi Toyota`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", vehicle.seoDescription || vehicle.description);
      }
    }
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-[#f4f4f5]">
        <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
          Loading vehicle specifications...
        </span>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-sm text-neutral-500">{error || "The requested vehicle slug does not exist."}</p>
        <Link href="/vehicles" className="text-xs uppercase tracking-wider font-bold text-[#eb0a1e] hover:underline mt-4">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased pb-24">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-9 h-6 rounded-full border-2 border-[#eb0a1e] flex items-center justify-center font-black text-[10px] tracking-widest text-[#eb0a1e]">
              T
            </span>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white to-[#a1a1aa] bg-clip-text text-transparent">
              LAXMI TOYOTA
            </span>
          </Link>
          <Link
            href="/vehicles"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            ← View Catalog
          </Link>
        </div>
      </header>

      {/* Main vehicle profile */}
      <main className="max-w-7xl mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Media Presentation */}
        <div className="space-y-6">
          <div className="border border-[#27272a]/60 bg-[#18181b]/25 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[45vh]">
            <span className="text-6xl mb-6 select-none animate-pulse">🏎️</span>
            <div className="text-center">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest bg-[#eb0a1e]/15 border border-[#eb0a1e]/25 text-[#eb0a1e] px-3 py-1 rounded-full mb-3">
                {vehicle.category}
              </span>
              <p className="text-xs text-neutral-500 font-mono">HERO PREVIEW IMAGE ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Right Column: Specification details */}
        <div className="space-y-8">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
                Toyota Range
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">
                {vehicle.status}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{vehicle.name}</h1>
          </div>

          {/* Description */}
          <div className="p-6 rounded-xl bg-[#18181b]/35 border border-neutral-800/80">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider mb-3">
              Description &amp; Performance Overview
            </h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {vehicle.description || "No description provided."}
            </p>
          </div>

          {/* Quick Specifications grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#27272a]/40 pt-6">
            <div>
              <span className="block text-xs text-neutral-500 font-medium">Category</span>
              <span className="text-sm font-bold text-white uppercase">{vehicle.category}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-500 font-medium">Availability</span>
              <span className="text-sm font-bold text-white uppercase">{vehicle.status}</span>
            </div>
          </div>

          {/* Variants and Trim levels */}
          <div className="border-t border-[#27272a]/40 pt-6 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
              Available Trims &amp; Specifications
            </h3>

            {loadingVariants ? (
              <div className="space-y-3">
                <div className="h-10 bg-neutral-900 border border-neutral-800 rounded animate-pulse" />
                <div className="h-10 bg-neutral-900 border border-neutral-800 rounded animate-pulse" />
              </div>
            ) : variantError ? (
              <p className="text-xs text-neutral-500 font-mono italic">Failed to load trims.</p>
            ) : variants.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono italic">Contact dealership for custom configurations.</p>
            ) : (
              <div className="space-y-2.5">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center p-4 bg-[#18181b]/30 border border-neutral-800/80 rounded-xl hover:border-neutral-700/60 transition-all duration-300"
                  >
                    <div>
                      <span className="text-sm font-bold text-white block">{v.name}</span>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-850 text-neutral-400">
                          {v.fuelType}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-850 text-neutral-400">
                          {v.transmission}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-850 text-neutral-400">
                          {v.seating} Seater
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block uppercase tracking-wider font-semibold">Ex-Showroom</span>
                      <span className="text-sm font-black text-[#eb0a1e] font-mono">
                        ₹{v.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Colors */}
          <div className="border-t border-[#27272a]/40 pt-6 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
              Available Colors
            </h3>

            {loadingColors ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 animate-pulse" />
                ))}
              </div>
            ) : colors.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono italic">Contact dealership for available color options.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {colors.filter((c) => c.status === "ACTIVE").map((c) => (
                  <div key={c.id} className="group flex flex-col items-center gap-1.5" title={c.name}>
                    <div
                      className="w-10 h-10 rounded-full border-2 border-neutral-700 group-hover:border-neutral-400 transition-all duration-300 shadow-md cursor-pointer"
                      style={{ background: c.colorCode }}
                    />
                    <span className="text-[9px] font-medium text-neutral-400 text-center max-w-[56px] leading-tight">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#27272a]/40">
            <Link
              href="/login"
              className="flex-1 text-center py-4 bg-white text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-neutral-200 transition-colors"
            >
              Book vehicle Online
            </Link>
            <Link
              href="/login"
              className="flex-1 text-center py-4 border border-[#27272a] text-white font-bold uppercase tracking-wider text-xs rounded hover:bg-[#18181b]/50 transition-colors"
            >
              Request Test Drive
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
