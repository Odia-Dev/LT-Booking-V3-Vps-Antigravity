"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Variant {
  id: string;
  vehicleId: string;
  name: string;
  price: number;
  fuelType: string;
  transmission: string;
  seating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Vehicle {
  id: string;
  name: string;
}

export default function AdminVariantsPage() {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/vehicles`);
      const data = await res.json();
      if (res.ok) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  }, [apiBaseUrl]);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (vehicleFilter) params.append("vehicleId", vehicleFilter);

      const res = await fetch(`${apiBaseUrl}/api/variants?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load variants");

      setVariants(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load variants.");
    } finally {
      setLoading(false);
    }
  }, [page, search, vehicleFilter, apiBaseUrl]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVariants();
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/variants/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      
      setSuccess("Status updated successfully.");
      fetchVariants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to toggle status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/variants/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete variant");

      setSuccess("Variant deleted successfully.");
      fetchVariants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to delete variant.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDuplicate = async (variant: Variant) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: variant.vehicleId,
          name: `${variant.name} (Copy)`,
          price: variant.price,
          fuelType: variant.fuelType,
          transmission: variant.transmission,
          seating: variant.seating,
          status: "ACTIVE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to duplicate variant");

      setSuccess("Variant duplicated successfully.");
      fetchVariants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to duplicate variant.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Variant Management CMS</h1>
          <p className="text-neutral-400 text-sm">Configure engine models, pricing specifications, and features details.</p>
        </div>
        <Link
          href="/admin/variants/create"
          className="px-5 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
        >
          + Create New Variant
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#18181b]/45 border border-neutral-800/80 rounded-xl p-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search variants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-neutral-700"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Variant List Table */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading variants list...</span>
          </div>
        ) : variants.length === 0 ? (
          <div className="p-16 text-center">
            <span className="text-4xl block mb-4">🚗</span>
            <h3 className="text-lg font-bold text-white mb-1">No variants found</h3>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto mb-6">Create a variant or adjust search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#18181b]/70 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="p-4">Variant Name</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Transmission</th>
                  <th className="p-4">Fuel</th>
                  <th className="p-4">Seating</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm text-neutral-300">
                {variants.map((v) => {
                  const vehicleObj = vehicles.find((vh) => vh.id === v.vehicleId);
                  return (
                    <tr key={v.id} className="hover:bg-[#18181b]/20 transition-colors">
                      <td className="p-4 font-bold text-white">{v.name}</td>
                      <td className="p-4 text-neutral-400">{vehicleObj ? vehicleObj.name : "Loading..."}</td>
                      <td className="p-4 text-neutral-400">{v.transmission}</td>
                      <td className="p-4 text-neutral-400">{v.fuelType}</td>
                      <td className="p-4 text-neutral-400">{v.seating} Seats</td>
                      <td className="p-4 font-mono font-semibold text-white">
                        ₹{(v.price / 100000).toFixed(2)} Lakh
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(v.id, v.status)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                            v.status === "ACTIVE"
                              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                              : "bg-amber-950/30 border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {v.status}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDuplicate(v)}
                          title="Duplicate"
                          className="px-2.5 py-1.5 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-xs transition-colors"
                        >
                          🗐
                        </button>
                        <button
                          onClick={() => router.push(`/admin/variants/${v.id}/edit`)}
                          className="px-2.5 py-1.5 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-700/40 text-rose-400 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}
