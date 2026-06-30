"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

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

  // New Specs & Flags States
  const [modelCode, setModelCode] = useState("");
  const [onRoadPrice, setOnRoadPrice] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [mileage, setMileage] = useState("");
  const [engine, setEngine] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [bootSpace, setBootSpace] = useState("");
  const [groundClearance, setGroundClearance] = useState("");
  const [warranty, setWarranty] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [seoKeywords, setSeoKeywords] = useState("");

  // New Media Fields
  const [thumbnail, setThumbnail] = useState("");
  const [brochure, setBrochure] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

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
        setShortDescription(v.shortDescription || "");
        setHeroImage(v.heroImage || "");
        setStatus(v.status || "ACTIVE");
        setSeoTitle(v.seoTitle || "");
        setSeoDescription(v.seoDescription || "");
        setSeoKeywords(v.seoKeywords || "");
        setSortOrder(v.sortOrder !== undefined ? String(v.sortOrder) : "0");
        setStartingPrice(v.startingPrice !== undefined ? String(v.startingPrice) : "");
        setOnRoadPrice(v.onRoadPrice !== undefined ? String(v.onRoadPrice) : "");
        setBookingAmount(v.bookingAmount !== undefined ? String(v.bookingAmount) : "");
        setModelCode(v.modelCode || "");
        setFuelType(v.fuelType || "");
        setTransmission(v.transmission || "");
        setMileage(v.mileage || "");
        setEngine(v.engine || "");
        setSeatingCapacity(v.seatingCapacity !== undefined ? String(v.seatingCapacity) : "");
        setBootSpace(v.bootSpace || "");
        setGroundClearance(v.groundClearance || "");
        setWarranty(v.warranty || "");
        setIsFeatured(v.isFeatured || false);
        setIsActive(v.isActive !== undefined ? v.isActive : true);
        setThumbnail(v.thumbnail || "");
        setBrochure(v.brochure || "");
        setYoutubeUrl(v.youtubeUrl || "");
        setGallery(v.gallery || []);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, apiBaseUrl]);

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
          shortDescription: shortDescription || undefined,
          heroImage: heroImage || undefined,
          thumbnail: thumbnail || undefined,
          brochure: brochure || undefined,
          youtubeUrl: youtubeUrl || undefined,
          gallery: gallery, // Send the sorted list, or empty array if cleared
          status,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          seoKeywords: seoKeywords || undefined,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
          startingPrice: startingPrice ? Number(startingPrice) : undefined,
          onRoadPrice: onRoadPrice ? Number(onRoadPrice) : undefined,
          bookingAmount: bookingAmount ? Number(bookingAmount) : undefined,
          modelCode: modelCode || undefined,
          fuelType: fuelType || undefined,
          transmission: transmission || undefined,
          mileage: mileage || undefined,
          engine: engine || undefined,
          seatingCapacity: seatingCapacity ? Number(seatingCapacity) : undefined,
          bootSpace: bootSpace || undefined,
          groundClearance: groundClearance || undefined,
          warranty: warranty || undefined,
          isFeatured,
          isActive,
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Model Code</label>
            <input
              type="text"
              placeholder="e.g. TGN160R"
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">On-Road Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 3850000"
              value={onRoadPrice}
              onChange={(e) => setOnRoadPrice(e.target.value)}
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Fuel Type</label>
            <input
              type="text"
              placeholder="e.g. Petrol, Diesel, Hybrid"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Transmission</label>
            <input
              type="text"
              placeholder="e.g. Manual, Automatic"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Mileage</label>
            <input
              type="text"
              placeholder="e.g. 14.2 kmpl"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Engine Specs</label>
            <input
              type="text"
              placeholder="e.g. 2755 cc, 4 Cylinders"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Seating Capacity</label>
            <input
              type="number"
              placeholder="e.g. 7"
              value={seatingCapacity}
              onChange={(e) => setSeatingCapacity(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Boot Space</label>
            <input
              type="text"
              placeholder="e.g. 296 Litres"
              value={bootSpace}
              onChange={(e) => setBootSpace(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Ground Clearance</label>
            <input
              type="text"
              placeholder="e.g. 220 mm"
              value={groundClearance}
              onChange={(e) => setGroundClearance(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Warranty</label>
            <input
              type="text"
              placeholder="e.g. 3 Years / 100,000 km"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <ImageUpload
            label="Hero Image"
            value={heroImage}
            onChange={setHeroImage}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div className="flex items-center gap-6 p-3 bg-neutral-950 rounded-lg border border-neutral-800 md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-800 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0 bg-[#09090b]"
              />
              Featured Vehicle
            </label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-800 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0 bg-[#09090b]"
              />
              Active on Site
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Description</label>
          <textarea
            rows={4}
            placeholder="Detailed overview on specifications, engine, efficiency..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Short Description</label>
          <textarea
            rows={2}
            placeholder="A brief single sentence summary of the car."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="border-t border-neutral-800 pt-6">
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] mb-4">Media Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ImageUpload
                label="Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
              />
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Meta Keywords</label>
              <input
                type="text"
                placeholder="e.g. toyota, fortuner, bookings, odisha"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
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
