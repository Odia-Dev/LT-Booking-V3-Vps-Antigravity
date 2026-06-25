import React from "react";
import Link from "next/link";
import { Metadata } from "next";

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
  thumbnail?: string;
  gallery?: string[];
  brochure?: string;
  youtubeUrl?: string;
  startingPrice?: number;
  bookingAmount?: number;
  variants?: Variant[];
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

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/public/vehicles/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.vehicle;
  } catch (err) {
    console.error("Failed to load vehicle:", err);
    return null;
  }
}

async function getColors(vehicleId: string): Promise<VehicleColor[]> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/vehicles/${vehicleId}/colors`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.colors || [];
  } catch (err) {
    console.error("Failed to load colors:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Laxmi Toyota",
    };
  }

  const title = vehicle.seoTitle || `${vehicle.name} Specifications & Booking | Laxmi Toyota`;
  const description = vehicle.seoDescription || vehicle.description || `Book the Toyota ${vehicle.name} online at Laxmi Toyota. Check variants, ex-showroom pricing, color options, and specs.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://laxmitoyota.com/vehicles/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://laxmitoyota.com/vehicles/${slug}`,
      type: "website",
      images: [
        {
          url: vehicle.heroImage || "https://laxmitoyota.com/og-banner.jpg",
          alt: vehicle.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [vehicle.heroImage || "https://laxmitoyota.com/og-banner.jpg"],
    },
  };
}

export default async function CustomerVehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-sm text-neutral-500">The requested vehicle slug does not exist.</p>
        <Link href="/vehicles" className="text-xs uppercase tracking-wider font-bold text-[#eb0a1e] hover:underline mt-4">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const variants = vehicle.variants || [];
  const colors = await getColors(vehicle.id);

  const priceBounds = variants.length > 0
    ? {
        minPrice: Math.min(...variants.map(v => v.price)),
        maxPrice: Math.max(...variants.map(v => v.price))
      }
    : null;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": vehicle.name,
    "description": vehicle.description,
    "image": vehicle.heroImage || vehicle.thumbnail,
    "brand": {
      "@type": "Brand",
      "name": "Toyota"
    },
    ...(priceBounds && {
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": priceBounds.minPrice,
        "highPrice": priceBounds.maxPrice,
        "offerCount": variants.length,
        "priceValuedOnly": "true"
      }
    })
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased pb-24">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
        <div className="space-y-8">
          {vehicle.heroImage ? (
            <div className="border border-[#27272a]/60 bg-[#18181b]/25 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
              <img
                src={vehicle.heroImage}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="border border-[#27272a]/60 bg-[#18181b]/25 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[45vh]">
              <span className="text-6xl mb-6 select-none animate-pulse">🏎️</span>
              <div className="text-center">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest bg-[#eb0a1e]/15 border border-[#eb0a1e]/25 text-[#eb0a1e] px-3 py-1 rounded-full mb-3">
                  {vehicle.category}
                </span>
                <p className="text-xs text-neutral-500 font-mono">NO HERO PREVIEW IMAGE</p>
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {vehicle.gallery && vehicle.gallery.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vehicle.gallery.map((imgUrl, idx) => (
                  <div key={idx} className="border border-[#27272a]/60 rounded-xl overflow-hidden aspect-video bg-[#18181b]/40">
                    <img
                      src={imgUrl}
                      alt={`${vehicle.name} gallery image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Video embedding */}
          {vehicle.youtubeUrl && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Video Walkthrough</h3>
              <div className="border border-[#27272a]/60 rounded-xl overflow-hidden aspect-video">
                <iframe
                  className="w-full h-full"
                  src={vehicle.youtubeUrl.includes("watch?v=") ? vehicle.youtubeUrl.replace("watch?v=", "embed/") : vehicle.youtubeUrl}
                  title={`${vehicle.name} Video`}
                  allowFullScreen
                />
              </div>
            </div>
          )}
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
            {vehicle.startingPrice && (
              <div>
                <span className="block text-xs text-neutral-500 font-medium">Starting Price</span>
                <span className="text-sm font-bold text-white">₹{vehicle.startingPrice.toLocaleString("en-IN")}*</span>
              </div>
            )}
            {vehicle.bookingAmount && (
              <div>
                <span className="block text-xs text-neutral-500 font-medium">Booking Deposit</span>
                <span className="text-sm font-bold text-[#eb0a1e]">₹{vehicle.bookingAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          {/* Variants and Trim levels */}
          <div className="border-t border-[#27272a]/40 pt-6 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
              Available Trims &amp; Specifications
            </h3>

            {variants.length === 0 ? (
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

            {colors.length === 0 ? (
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
            {vehicle.brochure && (
              <a
                href={vehicle.brochure}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-4 border border-[#eb0a1e]/40 hover:border-[#eb0a1e] text-[#eb0a1e] font-bold uppercase tracking-wider text-xs rounded hover:bg-[#eb0a1e]/10 transition-colors"
              >
                Download Brochure
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
