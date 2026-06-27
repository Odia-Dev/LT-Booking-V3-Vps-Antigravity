"use client";

import React, { useState, useEffect } from "react";

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
          credentials: "include",
        });
        const data = await res.json();

        if (res.status === 401) {
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
        credentials: "include",
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
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-neutral-850 rounded-2xl p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-800 rounded"></div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-neutral-800 rounded"></div>
          <div className="h-12 w-full bg-neutral-800 rounded"></div>
          <div className="h-12 w-full bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-neutral-900/35 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
        <p className="text-sm text-neutral-400">Update your details to streamline vehicle booking processes.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
              className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
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
            className="w-full md:w-auto px-8 py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-250 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
