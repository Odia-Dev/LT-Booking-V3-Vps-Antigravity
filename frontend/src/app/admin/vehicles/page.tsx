"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  heroImage: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder?: number;
  startingPrice?: number;
  bookingAmount?: number;
}

interface Variant {
  id: string;
  vehicleId: string;
  name: string;
  price: number;
  fuelType: string;
  transmission: string;
  seating: number;
  status: string;
  waitingPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleColor {
  id: string;
  vehicleId: string;
  name: string;
  colorCode: string;
  image?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (categoryFilter) params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${apiBaseUrl}/api/vehicles?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load vehicles");

      // Check if paginated response structure exists
      if (data.data) {
        setVehicles(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
      } else {
        setVehicles(data.vehicles || []);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, page, apiBaseUrl]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      
      setSuccess("Status updated successfully.");
      fetchVehicles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to toggle status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDuplicate = async (vehicle: Vehicle) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${vehicle.name} (Copy)`,
          slug: `${vehicle.slug}-copy`,
          category: vehicle.category,
          description: vehicle.description,
          heroImage: vehicle.heroImage,
          status: "ACTIVE",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to duplicate vehicle");

      setSuccess("Vehicle duplicated successfully.");
      fetchVehicles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to duplicate vehicle.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deletion failed");

      setSuccess("Vehicle deleted successfully!");
      fetchVehicles();
    } catch (err: unknown) {
      setError((err as Error).message || "Deletion failed.");
    }
  };

  // Vehicles page no longer contains modals for variants or colors.
  // They are managed through their respective dedicated pages.

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Vehicles CMS</h1>
          <p className="text-neutral-400 text-sm">Add, update, or remove fleet inventory items.</p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="px-5 py-3 bg-[#eb0a1e] hover:bg-[#c00717] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
        >
          + Add Vehicle
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm text-center">
          {success}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-3 text-neutral-600 hover:text-white">
              🔍
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors"
            >
              <option value="">All Categories</option>
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
            </select>
          </div>
        </form>
      </div>

      {/* Vehicles Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
          <span className="text-xs uppercase tracking-wider font-mono">Fetching fleet...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-[#18181b]/15 border border-neutral-800/60 rounded-xl p-12 text-center text-neutral-500 border-dashed">
          <span className="text-3xl mb-3 block">🚗</span>
          <p className="text-sm font-bold text-white mb-1">No Vehicles Configured</p>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">Get started by creating your first Toyota model record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-800/80 rounded-xl bg-[#18181b]/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500 bg-neutral-950/40">
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">SEO Title</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm font-light text-neutral-300">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{v.name}</div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">{v.slug}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-neutral-800 text-neutral-300">
                      {v.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleStatusToggle(v.id, v.status)}
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border transition-colors ${
                        v.status === "ACTIVE"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/20"
                          : "bg-neutral-800/40 text-neutral-400 border-neutral-800 hover:bg-neutral-850"
                      }`}
                    >
                      {v.status}
                    </button>
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={v.seoTitle || ""}>
                    {v.seoTitle || <span className="text-neutral-700 italic">None</span>}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleDuplicate(v)}
                      title="Duplicate"
                      className="px-2.5 py-1.5 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-xs transition-colors"
                    >
                      🗐
                    </button>
                    <Link
                      href="/admin/colors"
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors inline-block text-center"
                    >
                      Colors
                    </Link>
                    <Link
                      href="/admin/variants"
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors inline-block text-center"
                    >
                      Variants
                    </Link>
                    <button
                      onClick={() => router.push(`/admin/vehicles/edit/${v.id}`)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1.5 bg-red-950/45 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-neutral-800/80 flex items-center justify-between bg-[#18181b]/15 text-xs text-neutral-400">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-300 rounded font-semibold transition-colors"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-300 rounded font-semibold transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
