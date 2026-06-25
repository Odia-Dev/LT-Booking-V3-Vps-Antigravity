import React from "react";
import Link from "next/link";
import { Metadata } from "next";

interface Branch {
  id: string;
  name: string;
  slug: string;
  code: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  workingHours: string;
  status: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/public/branches`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.branches || [];
  } catch (err) {
    console.error("Failed to load branches:", err);
    return [];
  }
}

export const metadata: Metadata = {
  title: "Toyota Showrooms & Service Centers | Laxmi Toyota",
  description: "Find Laxmi Toyota authorized showrooms, dealerships, and state-of-the-art service centers across Odisha. Check working hours and coordinates.",
  alternates: {
    canonical: "https://laxmitoyota.com/branches",
  },
  openGraph: {
    title: "Toyota Showrooms & Service Centers | Laxmi Toyota",
    description: "Locate authorized Laxmi Toyota dealerships and workshop centers in Odisha.",
    url: "https://laxmitoyota.com/branches",
    type: "website",
  },
};

export default async function PublicBranchesPage() {
  const branches = await getBranches();
  const activeBranches = branches.filter((b: Branch) => b.status === "ACTIVE");

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased pb-24">
      {/* Header */}
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
            Explore Fleet
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">Locate Us</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Our Showrooms & Workshop Network</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Visit authorized Laxmi Toyota showrooms and service hubs across Odisha for purchasing queries, test drives, and certified maintenance.
          </p>
        </div>

        {activeBranches.length === 0 ? (
          <div className="bg-[#18181b]/20 border border-neutral-800 rounded-2xl p-16 text-center max-w-md mx-auto">
            <span className="text-4xl block mb-4">🏢</span>
            <h3 className="text-lg font-bold text-white mb-2">No active locations</h3>
            <p className="text-neutral-500 text-sm">
              Dealership locations are currently being configured. Please contact support.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeBranches.map((b) => (
              <div
                key={b.id}
                className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700/60 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-[#eb0a1e] transition-colors">
                        {b.name}
                      </h3>
                      <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{b.code}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
                      Open
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-light min-h-[40px]">
                    {b.address}, {b.city}, {b.state} - {b.pincode}
                  </p>

                  <div className="border-t border-[#27272a]/40 pt-4 space-y-2 text-xs text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-500">Working Hours</span>
                      <span className="text-neutral-300 font-semibold">{b.workingHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-500">Phone</span>
                      <a href={`tel:${b.phone}`} className="text-neutral-300 hover:text-white hover:underline font-mono">
                        {b.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-500">Email</span>
                      <a href={`mailto:${b.email}`} className="text-neutral-300 hover:text-white hover:underline">
                        {b.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-[#27272a]/40">
                  <Link
                    href={`/branches/${b.slug}`}
                    className="flex-1 text-center py-3 border border-[#27272a] text-white font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#18181b]/50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href="/login"
                    className="flex-1 text-center py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-bold uppercase tracking-wider text-[10px] rounded transition-colors"
                  >
                    Book Test Drive
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
