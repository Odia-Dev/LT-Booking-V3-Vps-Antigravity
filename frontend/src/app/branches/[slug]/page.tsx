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
  latitude?: number | null;
  longitude?: number | null;
  salesManager?: string | null;
  serviceManager?: string | null;
  status: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getBranch(slug: string): Promise<Branch | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/branches/slug/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.branch;
  } catch (err) {
    console.error("Failed to load branch:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = await getBranch(slug);

  if (!branch || branch.status !== "ACTIVE") {
    return {
      title: "Showroom Not Found | Laxmi Toyota",
    };
  }

  const title = `${branch.name} - Toyota Showroom & Service | Laxmi Toyota`;
  const description = `Visit Laxmi Toyota authorized ${branch.name} in ${branch.city}. Address: ${branch.address}. Phone: ${branch.phone}. Book a test drive or service query today.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://laxmitoyota.com/branches/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://laxmitoyota.com/branches/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CustomerBranchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const branch = await getBranch(slug);

  if (!branch || branch.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Showroom Not Found</h2>
        <p className="text-sm text-neutral-500">The requested showroom location does not exist.</p>
        <Link href="/branches" className="text-xs uppercase tracking-wider font-bold text-[#eb0a1e] hover:underline mt-4">
          ← Back to Showrooms
        </Link>
      </div>
    );
  }

  const dealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": branch.name,
    "description": `Laxmi Toyota authorized dealership and service hub in ${branch.city}.`,
    "image": "https://laxmitoyota.com/og-banner.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": branch.address,
      "addressLocality": branch.city,
      "addressRegion": branch.state,
      "postalCode": branch.pincode,
      "addressCountry": "IN"
    },
    "telephone": branch.phone,
    "email": branch.email,
    "url": `https://laxmitoyota.com/branches/${branch.slug}`
  };

  // Determine if Google Maps URL is an embed code or direct link
  const isEmbed = branch.googleMapsUrl.includes("iframe") || branch.googleMapsUrl.includes("google.com/maps/embed");
  
  // Extract iframe src if it is a full iframe tag
  let mapSrc = branch.googleMapsUrl;
  if (branch.googleMapsUrl.includes("src=\"")) {
    const match = branch.googleMapsUrl.match(/src="([^"]+)"/);
    if (match) mapSrc = match[1];
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased pb-24">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerSchema) }}
      />

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
            href="/branches"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            ← Showroom Directory
          </Link>
        </div>
      </header>

      {/* Main branch profile */}
      <main className="max-w-7xl mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Interactive Map Preview */}
        <div className="space-y-6">
          <div className="border border-[#27272a]/60 bg-[#18181b]/25 rounded-2xl overflow-hidden aspect-video flex items-center justify-center min-h-[400px]">
            {isEmbed ? (
              <iframe
                src={mapSrc}
                className="w-full h-full border-0 min-h-[400px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="text-center p-8">
                <span className="text-6xl mb-6 block select-none">📍</span>
                <p className="text-sm text-neutral-400 mb-6">Interactive map is available at the link below.</p>
                <a
                  href={branch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors inline-block"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Quick coordinates */}
          {branch.latitude && branch.longitude && (
            <div className="flex justify-between items-center bg-[#18181b]/20 border border-neutral-800 p-4 rounded-xl text-xs text-neutral-400 font-mono">
              <span>Latitude: {branch.latitude}</span>
              <span>Longitude: {branch.longitude}</span>
            </div>
          )}
        </div>

        {/* Right Column: Branch Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
                Dealer Outlet
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider font-mono">
                Code: {branch.code}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{branch.name}</h1>
          </div>

          {/* Address Panel */}
          <div className="p-6 rounded-xl bg-[#18181b]/35 border border-neutral-800/80 space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
              Showroom Address
            </h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {branch.address}
            </p>
            <p className="text-sm font-semibold text-white">
              {branch.city}, {branch.district}, {branch.state} - {branch.pincode}
            </p>
          </div>

          {/* Contact Details & Working Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#27272a]/40 pt-6">
            <div>
              <span className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Working Hours</span>
              <span className="text-sm font-bold text-white block mt-1">{branch.workingHours}</span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Showroom Contact</span>
              <a href={`tel:${branch.phone}`} className="text-sm font-bold text-[#eb0a1e] hover:underline font-mono block mt-1">
                {branch.phone}
              </a>
              <a href={`mailto:${branch.email}`} className="text-xs text-neutral-400 hover:text-white hover:underline block mt-1">
                {branch.email}
              </a>
            </div>
          </div>

          {/* Leadership / Managers */}
          {(branch.salesManager || branch.serviceManager) && (
            <div className="border-t border-[#27272a]/40 pt-6 space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
                Support Personnel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branch.salesManager && (
                  <div className="p-4 bg-[#18181b]/30 border border-neutral-800/80 rounded-xl">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Sales Manager</span>
                    <span className="text-sm font-bold text-white block mt-1">{branch.salesManager}</span>
                  </div>
                )}
                {branch.serviceManager && (
                  <div className="p-4 bg-[#18181b]/30 border border-neutral-800/80 rounded-xl">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Service Manager</span>
                    <span className="text-sm font-bold text-white block mt-1">{branch.serviceManager}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#27272a]/40">
            <Link
              href="/login"
              className="flex-1 text-center py-4 bg-white text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-neutral-200 transition-colors"
            >
              Book Test Drive
            </Link>
            <a
              href={`mailto:${branch.email}`}
              className="flex-1 text-center py-4 border border-[#27272a] text-white font-bold uppercase tracking-wider text-xs rounded hover:bg-[#18181b]/50 transition-colors"
            >
              Send Email Query
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
