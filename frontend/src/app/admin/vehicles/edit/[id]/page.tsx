"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("SUV");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [startingPrice, setStartingPrice] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Slugify from name (only if slug is not edited)
  useEffect(() => {
    if (name && !slug) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
      setSlug(generated);
    }
  }, [name, slug]);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/vehicles/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load vehicle details");

        const v = data.vehicle;
        setName(v.name);
        setSlug(v.slug);
        setCategory(v.category);
        setDescription(v.description || "");
        setHeroImage(v.heroImage || "");
        setStatus(v.status || "ACTIVE");
        setSeoTitle(v.seoTitle || "");
        setSeoDescription(v.seoDescription || "");
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          category,
          description,
          heroImage: heroImage || undefined,
          status,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
          startingPrice: startingPrice ? Number(startingPrice) : undefined,
          bookingAmount: bookingAmount ? Number(bookingAmount) : undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update vehicle");

      setSuccess("Vehicle updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/vehicles");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update vehicle.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Edit Vehicle</h1>
          <p className="text-neutral-400 text-sm">Modify car lineup model configurations.</p>
        </div>
        <Link
          href="/admin/vehicles"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs uppercase font-bold transition-colors"
        >
          Cancel
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#18181b]/35 border border-neutral-800 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Model Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Starting Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 3343000"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Booking Deposit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={bookingAmount}
              onChange={(e) => setBookingAmount(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Hero Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Description</label>
          <textarea
            rows={4}
            placeholder="Short details on specs, engine, efficiency..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="border-t border-neutral-800 pt-6">
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] mb-4">SEO Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Meta Title</label>
              <input
                type="text"
                placeholder="e.g. Book Toyota Fortuner Online | Laxmi Toyota"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Meta Description</label>
              <textarea
                rows={2}
                placeholder="e.g. Secure your SUV online with deposit payment."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? "Saving Changes..." : "Save Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
