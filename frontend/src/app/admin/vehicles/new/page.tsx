"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  // New Media Fields
  const [thumbnail, setThumbnail] = useState("");
  const [brochure, setBrochure] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Slugify from name
  useEffect(() => {
    const generated = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
    setSlug(generated);
  }, [name]);

  const addGalleryImage = () => {
    if (galleryInput && !gallery.includes(galleryInput)) {
      setGallery([...gallery, galleryInput]);
      setGalleryInput("");
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    const newGallery = [...gallery];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newGallery.length) {
      const temp = newGallery[index];
      newGallery[index] = newGallery[targetIndex];
      newGallery[targetIndex] = temp;
      setGallery(newGallery);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          category,
          description,
          heroImage: heroImage || undefined,
          thumbnail: thumbnail || undefined,
          brochure: brochure || undefined,
          youtubeUrl: youtubeUrl || undefined,
          gallery: gallery.length > 0 ? gallery : undefined,
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
      if (!res.ok) throw new Error(data.message || "Failed to create vehicle");

      setSuccess("Vehicle created successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/vehicles");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create Vehicle</h1>
          <p className="text-neutral-400 text-sm">Add a new car lineup to the fleet catalog.</p>
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
              placeholder="e.g. Fortuner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Slug (Generated)</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full bg-[#09090b]/55 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed"
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
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] mb-4">Media Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Thumbnail URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Brochure PDF URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={brochure}
                onChange={(e) => setBrochure(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">YouTube Video URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Gallery Images</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add Image URL to Gallery"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
              />
              <button
                type="button"
                onClick={addGalleryImage}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs uppercase font-bold transition-colors"
              >
                Add
              </button>
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#09090b]/50 p-4 border border-neutral-800 rounded-lg">
                {gallery.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#18181b] p-3 border border-neutral-800 rounded-md">
                    <span className="text-xs text-neutral-300 truncate mr-4">{url}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(index, "down")}
                        disabled={index === gallery.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="p-1 text-rose-500 hover:text-rose-400 ml-2 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            disabled={loading}
            className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? "Creating..." : "Save Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
