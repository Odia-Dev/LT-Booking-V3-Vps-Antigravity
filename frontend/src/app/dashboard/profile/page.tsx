"use client";

import React, { useState, useEffect } from "react";

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  preferredBranchId: string;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    preferredBranchId: "",
    communicationPreferences: {
      email: true,
      sms: true,
      whatsapp: true,
    },
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfileAndBranches = async () => {
      try {
        const token = localStorage.getItem("customerToken");
        const fetchOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include" as const,
        };

        // Fetch user profile and branch lists in parallel
        const [profileRes, branchesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/dashboard/profile`, fetchOptions),
          fetch(`${apiBaseUrl}/api/public/branches`),
        ]);

        if (profileRes.status === 401) {
          window.location.href = "/login";
          return;
        }

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          throw new Error(profileData.message || "Failed to load user profile");
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData.branches || branchesData.data || []);
        }

        const p = profileData.profile;
        setProfile({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          city: p.city || "",
          state: p.state || "",
          address: p.address || "",
          preferredBranchId: p.preferredBranchId || "",
          communicationPreferences: {
            email: p.communicationPreferences?.email !== false,
            sms: p.communicationPreferences?.sms !== false,
            whatsapp: p.communicationPreferences?.whatsapp !== false,
          },
        });
      } catch (err: unknown) {
        console.error("Fetch profile error:", err);
        const msg = err instanceof Error ? err.message : "Failed to load profile details.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndBranches();
  }, [apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("customerToken");
      const res = await fetch(`${apiBaseUrl}/api/dashboard/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          city: profile.city,
          state: profile.state,
          address: profile.address,
          preferredBranchId: profile.preferredBranchId || null,
          communicationPreferences: profile.communicationPreferences,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to update profile settings.");
      }

      setSuccess("Profile settings updated successfully.");
      const p = data.profile;
      setProfile({
        name: p.name || "",
        email: p.email || "",
        phone: p.phone || "",
        city: p.city || "",
        state: p.state || "",
        address: p.address || "",
        preferredBranchId: p.preferredBranchId || "",
        communicationPreferences: {
          email: p.communicationPreferences?.email !== false,
          sms: p.communicationPreferences?.sms !== false,
          whatsapp: p.communicationPreferences?.whatsapp !== false,
        },
      });
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while saving profile settings.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCommPrefChange = (channel: "email" | "sms" | "whatsapp") => {
    setProfile((prev) => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [channel]: !prev.communicationPreferences[channel],
      },
    }));
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
        <p className="text-sm text-neutral-400">Update your details to streamline vehicle booking and test-drive processes.</p>
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
          {/* Full Name */}
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

          {/* Verified Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-450 mb-2 flex items-center gap-1.5">
              Verified Phone <span className="text-[10px] text-emerald-500 bg-emerald-950/80 px-1.5 py-0.5 rounded font-mono">LOCKED</span>
            </label>
            <input
              type="text"
              disabled
              value={profile.phone}
              className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Registered Email */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-455 mb-2 flex items-center gap-1.5">
              Registered Email <span className="text-[10px] text-emerald-500 bg-emerald-950/80 px-1.5 py-0.5 rounded font-mono">LOCKED</span>
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* City */}
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

          {/* State */}
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

          {/* Preferred Branch */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Preferred Dealership Branch
            </label>
            <select
              value={profile.preferredBranchId}
              onChange={(e) => setProfile({ ...profile, preferredBranchId: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
            >
              <option value="">Select branch...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Billing/Delivery Address
            </label>
            <textarea
              placeholder="Enter your complete street address details..."
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors resize-none"
            />
          </div>

          {/* Communication Preferences */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Communication Channel Subscriptions
            </label>
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-neutral-950 border border-neutral-800/80 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profile.communicationPreferences.email}
                  onChange={() => handleCommPrefChange("email")}
                  className="rounded border-neutral-700 bg-neutral-950 text-[#eb0a1e] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-neutral-300">Email Notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profile.communicationPreferences.sms}
                  onChange={() => handleCommPrefChange("sms")}
                  className="rounded border-neutral-700 bg-neutral-950 text-[#eb0a1e] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-neutral-300">SMS Updates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profile.communicationPreferences.whatsapp}
                  onChange={() => handleCommPrefChange("whatsapp")}
                  className="rounded border-neutral-700 bg-neutral-950 text-[#eb0a1e] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-neutral-300">WhatsApp Alerts</span>
              </label>
            </div>
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
