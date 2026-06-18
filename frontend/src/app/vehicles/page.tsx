"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  heroImage: string;
  status: string;
}

export default function CustomerCatalogPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (search) params.append("search", search);

      const res = await fetch(`${apiBaseUrl}/api/vehicles?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, apiBaseUrl]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  const categories = ["SUV", "MPV", "Hatchback", "Sedan"];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-[#eb0a1e] selection:text-white pb-24">
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
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            ← Back Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        {/* Banner Section */}
        <div className="text-center md:text-left mb-16">
          <span className="text-xs uppercase font-extrabold text-[#eb0a1e] tracking-widest mb-3 inline-block">
            TOYOTA CATALOGUE
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Discover Your Vehicle</h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Browse through our range of high performance SUVs, family MPVs, hatchbacks, and premium sedans.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#18181b]/30 border border-[#27272a]/60 rounded-xl p-6 mb-12 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Categories select pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                selectedCategory === ""
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
              }`}
            >
              All Vehicles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600 placeholder:text-neutral-600 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-3 text-neutral-600 hover:text-white">
              🔍
            </button>
          </form>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
            <span className="text-xs uppercase tracking-wider font-mono">Loading Showroom...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-[#18181b]/15 border border-[#27272a]/40 rounded-xl p-16 text-center text-neutral-500 border-dashed">
            <span className="text-4xl mb-4 block">🚗</span>
            <p className="text-sm font-bold text-white mb-1">No Matching Vehicles</p>
            <p className="text-xs text-neutral-600">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="group relative rounded-xl border border-[#27272a]/60 bg-[#18181b]/20 p-6 flex flex-col justify-between hover:border-[#eb0a1e]/40 transition-all hover:shadow-2xl"
              >
                <div>
                  {/* Category Pill */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#eb0a1e]">
                      {v.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                      {v.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#eb0a1e] transition-colors">
                    {v.name}
                  </h3>
                  <p className="text-sm text-neutral-400 font-light mb-6 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>

                {/* Card footer options */}
                <div className="pt-6 border-t border-[#27272a]/40 flex justify-between items-center gap-4">
                  <Link
                    href={`/vehicles/${v.slug}`}
                    className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                  >
                    View Details →
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors"
                  >
                    Book Online
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
