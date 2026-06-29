"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role === "CUSTOMER") {
            setIsAuthenticated(true);
            setUserName(data.user.name || data.user.email || "User");
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [apiBaseUrl]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      setIsAuthenticated(false);
      setUserName(null);
      setIsOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#eb0a1e]"
        aria-label="User menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-[#a1a1aa]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#09090b] border border-[#27272a] ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {loading ? (
              <div className="block px-4 py-2 text-sm text-[#a1a1aa]">Loading...</div>
            ) : isAuthenticated ? (
              <>
                <div className="block px-4 py-2 text-xs text-[#eb0a1e] font-semibold border-b border-[#27272a] truncate">
                  Welcome, {userName}
                </div>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Signup
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="block px-4 py-2 text-sm text-[#f4f4f5] hover:bg-[#18181b] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Track Booking
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
