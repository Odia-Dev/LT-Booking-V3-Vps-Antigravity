import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import CatalogFilters from "@/components/CatalogFilters";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  heroImage: string;
  status: string;
}

export const metadata: Metadata = {
  title: "Toyota Showroom & Vehicle Catalog | Laxmi Toyota",
  description: "Browse the full lineup of Toyota vehicles, SUVs, hatchbacks, and sedans available at Laxmi Toyota. Filter by fuel, category, and find variant details.",
  alternates: {
    canonical: "https://laxmitoyota.com/vehicles",
  },
  openGraph: {
    title: "Toyota Showroom & Vehicle Catalog | Laxmi Toyota",
    description: "Browse the full lineup of Toyota vehicles, SUVs, hatchbacks, and sedans available at Laxmi Toyota.",
    url: "https://laxmitoyota.com/vehicles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toyota Showroom & Vehicle Catalog | Laxmi Toyota",
    description: "Browse the full lineup of Toyota vehicles, SUVs, hatchbacks, and sedans available at Laxmi Toyota.",
  },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

async function fetchVehicles(category?: string, search?: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const res = await fetch(`${apiBaseUrl}/api/vehicles?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return data.vehicles as Vehicle[];
  } catch (err) {
    console.error("Error loading vehicles on server:", err);
    return [];
  }
}

export default async function CustomerCatalogPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category;
  const search = resolvedSearchParams.search;

  const vehicles = await fetchVehicles(category, search);

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

      <main className="max-w-7xl mx-auto px-6 main-content pt-16">
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

        {/* Filters: Wrapped in Suspense because it uses searchParams hooks */}
        <Suspense fallback={<div className="h-20 bg-neutral-900/20 border border-neutral-800 rounded-xl animate-pulse mb-12" />}>
          <CatalogFilters />
        </Suspense>

        {/* Catalog Grid */}
        {vehicles.length === 0 ? (
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
