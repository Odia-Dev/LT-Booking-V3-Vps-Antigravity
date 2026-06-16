"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (res.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfile({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          city: data.profile.city || "",
          state: data.profile.state || "",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load user profile.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          city: profile.city,
          state: profile.state,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to update profile");
      }

      setSuccess("Profile settings updated successfully.");
      setProfile({
        name: data.profile.name || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        city: data.profile.city || "",
        state: data.profile.state || "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col text-neutral-100 font-sans">
        <header className="px-6 py-5 border-b border-neutral-900 flex justify-between items-center">
          <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
          <div className="h-5 w-24 bg-neutral-800 rounded animate-pulse"></div>
        </header>
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-neutral-900/20 border border-neutral-800/80 rounded-2xl p-8 space-y-6">
            <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-12 w-full bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-neutral-800 rounded animate-pulse"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 font-sans">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Catalog</Link>
          <button 
            onClick={async () => {
              await fetch(`${apiBaseUrl}/api/auth/logout`, { method: "POST" });
              window.location.href = "/login";
            }}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
            <p className="text-sm text-neutral-400">Update your details to streamline vehicle booking processes.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.phone}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cuttack"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Odisha"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
