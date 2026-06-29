import React from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";

export default function MainHeader() {
  return (
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

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#a1a1aa]">
          <Link href="/vehicles" className="hover:text-white transition-colors">Vehicles</Link>
          <Link href="/offers" className="hover:text-white transition-colors">Offers</Link>
          <Link href="/test-drive" className="hover:text-white transition-colors">Test Drive</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/book-online"
            className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#e11d48] to-[#be123c] px-5 py-2.5 rounded hover:opacity-90 transition-opacity"
          >
            Book Now
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
