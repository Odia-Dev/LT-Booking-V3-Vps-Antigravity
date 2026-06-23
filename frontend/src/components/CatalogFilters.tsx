"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = (category: string, searchQuery: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (searchQuery) params.set("search", searchQuery);

    const queryStr = params.toString();
    router.push(`${pathname}${queryStr ? `?${queryStr}` : ""}`);
  };

  const handleCategoryClick = (category: string) => {
    updateFilters(category, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(currentCategory, search);
  };

  const categories = ["SUV", "MPV", "Hatchback", "Sedan"];

  return (
    <div className="bg-[#18181b]/30 border border-[#27272a]/60 rounded-xl p-6 mb-12 flex flex-col md:flex-row gap-4 justify-between items-center">
      {/* Categories select pills */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button
          onClick={() => handleCategoryClick("")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            currentCategory === ""
              ? "bg-white text-black border-white"
              : "bg-transparent text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
          }`}
        >
          All Vehicles
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
              currentCategory === cat
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
  );
}
