"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Ensure admin_session cookie is sent
        });

        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();
        if (!res.ok || data.user?.role !== "ADMIN") {
          router.replace("/admin/login");
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/admin/login");
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
      router.replace("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.replace("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Verifying System Credentials...
        </span>
      </div>
    );
  }

  // Sidebar Links Configuration
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Vehicles", path: "/admin/vehicles", icon: "🚗" },
    { name: "Branches", path: "/admin/branches", icon: "🏢" },
    { name: "Offers", path: "/admin/offers", icon: "🏷️" },
    { name: "Leads", path: "/admin/leads", icon: "👥" },
    { name: "Bookings", path: "/admin/bookings", icon: "💳" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  // Dynamic breadcrumbs based on pathname
  const pathSegments = pathname.split("/").filter((s) => s);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);

    return (
      <span key={path} className="flex items-center gap-1.5">
        <span className="text-neutral-700">/</span>
        {isLast ? (
          <span className="text-white font-medium">{name}</span>
        ) : (
          <Link href={path} className="hover:text-white transition-colors">
            {name}
          </Link>
        )}
      </span>
    );
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans flex">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen bg-[#09090b] border-r border-[#27272a]/60 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-0 md:w-20 overflow-hidden"
        }`}
      >
        <div>
          {/* Brand Logo header */}
          <div className="h-20 border-b border-[#27272a]/60 px-6 flex items-center gap-3">
            <span className="w-8 h-5.5 rounded-full border border-[#eb0a1e] flex items-center justify-center font-black text-[9px] tracking-widest text-[#eb0a1e] shrink-0">
              T
            </span>
            {sidebarOpen && (
              <span className="font-extrabold text-sm tracking-wider text-white whitespace-nowrap">
                SYSTEM CONSOLE
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#18181b] text-white border-l-2 border-[#eb0a1e]"
                      : "text-neutral-400 hover:text-white hover:bg-[#18181b]/45"
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions / logout */}
        <div className="p-4 border-t border-[#27272a]/60">
          {sidebarOpen ? (
            <div className="space-y-4">
              <div className="px-2">
                <span className="block text-xs font-semibold text-neutral-500">SIGNED IN AS</span>
                <span className="block text-sm font-bold text-white truncate">{user?.name}</span>
                <span className="block text-[10px] font-mono text-neutral-600 truncate">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-center text-[#eb0a1e] border border-[#eb0a1e]/20 bg-[#eb0a1e]/5 rounded hover:bg-[#eb0a1e]/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-full py-3 text-center text-lg text-[#eb0a1e] rounded hover:bg-[#eb0a1e]/10 transition-colors"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-20 border-b border-[#27272a]/60 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 border border-[#27272a] rounded flex items-center justify-center hover:bg-[#18181b] transition-colors"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div className="flex items-center gap-1.5">{breadcrumbs}</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#eb0a1e] bg-[#eb0a1e]/10 border border-[#eb0a1e]/20 px-2.5 py-1 rounded-full">
              LIVE CONSOLE
            </span>
          </div>
        </header>

        {/* Dynamic children pages view */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
