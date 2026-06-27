"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface CustomerUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: string;
}

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok || data.user?.role !== "CUSTOMER") {
          if (data.user?.role === "ADMIN") {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/login");
          }
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, apiBaseUrl]);

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Securing Customer Session...
        </span>
      </div>
    );
  }

  // Sidebar Links
  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: "📊" },
    { name: "My Bookings", path: "/dashboard/bookings", icon: "🚗" },
    { name: "Payments", path: "/dashboard/payments", icon: "💳" },
    { name: "Test Drives", path: "/dashboard/test-drives", icon: "🕒" },
    { name: "Notifications", path: "/dashboard/notifications", icon: "🔔" },
    { name: "Profile", path: "/dashboard/profile", icon: "👤" },
    { name: "Settings", path: "/dashboard/settings", icon: "⚙️" },
  ];

  // Breadcrumbs
  const pathSegments = pathname.split("/").filter((s) => s);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const name = segment === "dashboard" ? "Dashboard" : segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

    return (
      <React.Fragment key={path}>
        <span className="text-neutral-600 mx-2 text-xs">/</span>
        {isLast ? (
          <span className="text-neutral-200 text-xs font-medium">{name}</span>
        ) : (
          <Link href={path} className="text-neutral-400 hover:text-white transition-colors text-xs">
            {name}
          </Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden w-full bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <span className="font-bold tracking-widest text-[#eb0a1e] uppercase">LAXMI TOYOTA</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-neutral-400 hover:text-white focus:outline-none p-1.5 rounded bg-neutral-800/50"
          aria-label="Toggle Navigation Menu"
        >
          {sidebarOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-30 w-64 bg-neutral-900 border-r border-neutral-850 flex flex-col justify-between transition-transform duration-300 transform 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 h-screen`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-850">
            <span className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eb0a1e] inline-block"></span>
              LAXMI TOYOTA
            </span>
          </div>

          {/* User Profile Info Mini Card */}
          <div className="p-4 mx-3 my-4 bg-neutral-950/40 border border-neutral-800/80 rounded-xl">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Customer</p>
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Laxmi Customer"}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.phone || user?.email || ""}</p>
          </div>

          {/* Menu Links */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-[#eb0a1e] text-white shadow-md shadow-[#eb0a1e]/10"
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-neutral-850">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-neutral-800 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-red-950/20 hover:border-red-900/40 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with Breadcrumbs & Static Info */}
        <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            <span className="text-neutral-500 text-xs font-mono uppercase tracking-wider">Laxmi Portal</span>
            {breadcrumbs}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Return to Catalog
            </Link>
            <div className="h-4 w-px bg-neutral-800"></div>
            <span className="text-xs text-[#eb0a1e] font-bold tracking-widest uppercase">Verified Session</span>
          </div>
        </div>

        {/* Mobile Breadcrumb display */}
        <div className="md:hidden flex items-center px-4 py-2 bg-neutral-900/60 border-b border-neutral-850 text-xs">
          <span className="text-neutral-500 font-mono">Portal</span>
          {breadcrumbs}
        </div>

        {/* Sub-page view render */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
