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

export default function CustomerVehicleDetailPage() {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            {/* Vector representation/Wireframe block of the luxury car */}
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

          <div className="p-6 rounded-xl bg-[#18181b]/35 border border-neutral-800/80">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider mb-3">
              Description & Performance Overview
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
