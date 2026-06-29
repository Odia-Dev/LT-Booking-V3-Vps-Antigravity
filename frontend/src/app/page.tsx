import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles } from "lucide-react";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import FaqSection from "@/components/FaqSection";
import MainHeader from "@/components/MainHeader";

interface Vehicle {
  name: string;
  type: string;
  tagline: string;
  price: string;
  fuel: string;
  transmission: string;
  imageColor: string;
  colors: { name: string; hex: string }[];
  specs: string[];
}

const VEHICLES: Vehicle[] = [
  {
    name: "Urban Cruiser Hyryder",
    type: "Premium SUV",
    tagline: "Hybrid Performance & Luxury",
    price: "₹ 11.14 Lakh*",
    fuel: "Strong Hybrid / Petrol / CNG",
    transmission: "e-Drive / Automatic / Manual",
    imageColor: "border-emerald-500 bg-emerald-950/20",
    colors: [
      { name: "Cafe White", hex: "#ffffff" },
      { name: "Sportin Red", hex: "#eb0a1e" },
      { name: "Gaming Grey", hex: "#3a3d40" },
      { name: "Enticing Silver", hex: "#d8dbe0" },
    ],
    specs: ["27.97 km/l Mileage", "Panoramic Sunroof", "Heated Seats", "360 View Camera"],
  },
  {
    name: "Urban Cruiser Taisor",
    type: "Compact SUV",
    tagline: "Bold Design. Dynamic Drive.",
    price: "₹ 7.74 Lakh*",
    fuel: "Turbo Petrol / CNG",
    transmission: "Automatic / Manual",
    imageColor: "border-red-500 bg-red-950/20",
    colors: [
      { name: "Lucent Orange", hex: "#f26722" },
      { name: "Sportin Red", hex: "#eb0a1e" },
      { name: "Cafe White", hex: "#ffffff" },
      { name: "Gaming Grey", hex: "#3a3d40" },
    ],
    specs: ["Turbocharger Engine", "Head-Up Display", "Wireless Apple Carplay", "6 Airbags"],
  },
  {
    name: "Toyota Rumion",
    type: "MPV",
    tagline: "Spacious Comfort For Families",
    price: "₹ 10.44 Lakh*",
    fuel: "Petrol / CNG",
    transmission: "6-Speed AT / Manual",
    imageColor: "border-blue-500 bg-blue-950/20",
    colors: [
      { name: "Rustic Brown", hex: "#5b4033" },
      { name: "Iconic Grey", hex: "#56585c" },
      { name: "Spunky Blue", hex: "#1e3d59" },
      { name: "Cafe White", hex: "#ffffff" },
    ],
    specs: ["7-Seater Configuration", "26.11 km/kg CNG Fuel Efficiency", "Paddle Shifters", "Roof Mounted AC"],
  },
  {
    name: "Toyota Glanza",
    type: "Premium Hatchback",
    tagline: "Hatchin' Intelligence",
    price: "₹ 6.86 Lakh*",
    fuel: "Petrol / CNG",
    transmission: "AMT / Manual",
    imageColor: "border-slate-500 bg-slate-900/20",
    colors: [
      { name: "Insta Blue", hex: "#0b3c5d" },
      { name: "Sportin Red", hex: "#eb0a1e" },
      { name: "Gaming Grey", hex: "#3a3d40" },
      { name: "Enticing Silver", hex: "#d8dbe0" },
    ],
    specs: ["22.94 km/l Mileage", "9-inch Touchscreen", "Auto Climate Control", "Toyota i-Connect"],
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I secure an online vehicle booking?",
    answer: "You can book your vehicle online by choosing your preferred model, variant, and color swatch, then making a secure deposit payment via Razorpay or ICICI. The deposit is held securely and fully logged against your customer profile.",
  },
  {
    question: "Are booking deposits refundable?",
    answer: "Yes, bookings can be cancelled or modified by contacting our branch managers prior to invoicing. Refunds are processed back to the original payment method within 5-7 working days.",
  },
  {
    question: "What documents are required to book a test drive?",
    answer: "You only need a valid Indian Driving License and proof of identity (Aadhaar or PAN). Please bring the physical copies to the selected branch at your scheduled slot.",
  },
  {
    question: "Can I exchange my old car online?",
    answer: "Yes, you can check the Exchange Inquiry option on our catalog. Our valuation experts will inspect the vehicle at your convenience (home or branch) and apply the exchange bonus to your new booking.",
  },
];

export const metadata: Metadata = {
  title: "Laxmi Toyota Odisha | Official Online Booking & Dealership Portal",
  description: "Explore and book the latest Toyota models online at Laxmi Toyota Odisha. Book test drives, calculate finance options, and secure allocations for Innova, Fortuner, Hyryder, and Glanza.",
  alternates: {
    canonical: "https://laxmitoyota.com",
  },
  openGraph: {
    title: "Laxmi Toyota Odisha | Official Online Booking & Dealership Portal",
    description: "Explore and book the latest Toyota models online at Laxmi Toyota Odisha. Book test drives, calculate finance options, and secure allocations.",
    url: "https://laxmitoyota.com",
    type: "website",
    images: [
      {
        url: "https://laxmitoyota.com/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Laxmi Toyota Showroom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laxmi Toyota Odisha | Official Online Booking & Dealership Portal",
    description: "Explore and book the latest Toyota models online at Laxmi Toyota Odisha.",
    images: ["https://laxmitoyota.com/og-banner.jpg"],
  },
};

export default function PremiumHomepage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-[#eb0a1e] selection:text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Header/Navigation */}
      <MainHeader />

      {/* 2. Hero Banner */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#27272a]/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#eb0a1e]/10 via-transparent to-transparent opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/60" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-[#eb0a1e] font-extrabold tracking-widest text-xs uppercase mb-4">
            ESTABLISHED IN ODISHA
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-[#71717a] bg-clip-text text-transparent">
            THE UNCONTESTED LEADER
          </h1>
          <p className="text-[#a1a1aa] text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Experience performance, precision, and state-of-the-art hybrid engineering. Book your next journey online.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto text-sm font-bold uppercase tracking-wider bg-white text-[#09090b] px-8 py-4 rounded hover:bg-neutral-200 transition-colors"
            >
              Book Online
            </Link>
            <a
              href="#featured"
              className="w-full sm:w-auto text-sm font-bold uppercase tracking-wider border border-[#27272a] bg-[#09090b]/50 px-8 py-4 rounded hover:bg-[#18181b] transition-colors"
            >
              Test Drive
            </a>
          </div>
        </div>
      </section>

      {/* 3. Featured Vehicles */}
      <section id="featured" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Featured Lineup</h2>
          <p className="text-[#a1a1aa] text-sm max-w-md">
            Explore advanced powertrains, smart safety packages, and unmatched styling.
          </p>
        </div>

        <FeaturedVehicles vehicles={VEHICLES} />
      </section>

      {/* 4. Why Book Online */}
      <section id="benefits" className="py-24 bg-[#18181b]/20 border-y border-[#27272a]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Why Book Online</h2>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              Ditch long queues and manual paperwork. Our digital platform is optimized for fast allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-[#27272a]/40 bg-[#09090b] flex flex-col gap-4">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-lg font-bold text-white">100% Secure Transaction</h3>
              <p className="text-sm text-[#a1a1aa] font-light leading-relaxed">
                All deposits are processed through PCI-compliant Razorpay & ICICI gateways. Zero storage of passwords or card details.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[#27272a]/40 bg-[#09090b] flex flex-col gap-4">
              <span className="text-3xl">⚡</span>
              <h3 className="text-lg font-bold text-white">Priority Vehicle Allocation</h3>
              <p className="text-sm text-[#a1a1aa] font-light leading-relaxed">
                Online bookings instantly register in our inventory system, locking down allocation ranks ahead of offline buyers.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[#27272a]/40 bg-[#09090b] flex flex-col gap-4">
              <span className="text-3xl">🔍</span>
              <h3 className="text-lg font-bold text-white">Transparent Invoicing</h3>
              <p className="text-sm text-[#a1a1aa] font-light leading-relaxed">
                No hidden costs. Dynamic road taxation breakdowns are calculated automatically according to your branch state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Current Offers */}
      <section id="offers" className="py-24 max-w-7xl mx-auto px-6">
        <div className="rounded-2xl border border-[#eb0a1e]/30 bg-gradient-to-br from-[#eb0a1e]/10 to-[#09090b] p-8 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-extrabold text-[#eb0a1e] mb-2 inline-block">
              LIMITED PERIOD SCHEMES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
              Unlock Monsoon Benefits
            </h2>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6 font-light">
              Get an exchange bonus up to ₹ 50,000 and loyalty vouchers worth ₹ 15,000 on bookings finalized this month. Special 7.99% finance offers through ICICI Bank.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-white">
              <span className="bg-[#27272a]/80 px-3.5 py-1.5 rounded-full border border-[#3f3f46]">Exchange Bonus: ₹50K</span>
              <span className="bg-[#27272a]/80 px-3.5 py-1.5 rounded-full border border-[#3f3f46]">Interest Rate: 7.99%</span>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full md:w-auto text-center text-sm font-bold uppercase tracking-wider bg-white text-black px-10 py-4 rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            Claim Offers
          </Link>
        </div>
      </section>

      {/* 6. Branch Network */}
      <section id="branches" className="py-24 bg-[#18181b]/10 border-t border-[#27272a]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Our Branches</h2>
            <p className="text-[#a1a1aa] text-sm max-w-sm">
              Visit us locally in Odisha for test drives, expert consultants, and service requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border border-[#27272a]/40 bg-[#18181b]/30">
              <span className="text-xs font-extrabold text-[#eb0a1e] uppercase tracking-wider">HEADQUARTERS</span>
              <h3 className="text-xl font-bold mt-1 mb-4 text-white">Laxmi Toyota Headquarters</h3>
              <p className="text-sm text-[#a1a1aa] font-light mb-6">
                123 Toyota Ring Road, Central Business District, Bhubaneswar, Odisha
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs pt-6 border-t border-[#27272a]/40 text-[#a1a1aa]">
                <div>
                  <span className="block text-[#71717a]">Manager</span>
                  <span className="font-semibold text-white">Rajesh Kumar</span>
                </div>
                <div>
                  <span className="block text-[#71717a]">Contact</span>
                  <span className="font-semibold text-white">+91 98765 43210</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-[#27272a]/40 bg-[#18181b]/30">
              <span className="text-xs font-extrabold text-[#eb0a1e] uppercase tracking-wider">CUTTACK BRANCH</span>
              <h3 className="text-xl font-bold mt-1 mb-4 text-white">Laxmi Toyota East</h3>
              <p className="text-sm text-[#a1a1aa] font-light mb-6">
                45 East Expressway Lane, Industrial Hub, Cuttack, Odisha
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs pt-6 border-t border-[#27272a]/40 text-[#a1a1aa]">
                <div>
                  <span className="block text-[#71717a]">Manager</span>
                  <span className="font-semibold text-white">Amit Sharma</span>
                </div>
                <div>
                  <span className="block text-[#71717a]">Contact</span>
                  <span className="font-semibold text-white">+91 98765 43211</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-[#a1a1aa] text-sm">
            Everything you need to know about bookings, test drives, and operations.
          </p>
        </div>

        <FaqSection faqs={FAQS} />
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-[#27272a]/60 bg-[#09090b] py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="w-8 h-5.5 rounded-full border border-[#eb0a1e] flex items-center justify-center font-black text-[9px] tracking-widest text-[#eb0a1e]">
                T
              </span>
              <span className="font-extrabold text-sm tracking-wider text-white">
                LAXMI TOYOTA
              </span>
            </div>
            <p className="text-xs text-[#71717a] font-light text-center md:text-left">
              © 2026 Laxmi Toyota Odisha. All rights reserved. Managed under Toyota booking portal V3.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-[#a1a1aa] font-medium">
            <a href="#featured" className="hover:text-white transition-colors">Lineup</a>
            <a href="#benefits" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#branches" className="hover:text-white transition-colors">Terms of Service</a>
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
