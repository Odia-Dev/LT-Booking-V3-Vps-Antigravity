"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  slug: string;
  code: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  workingHours: string;
  latitude?: number | null;
  longitude?: number | null;
  managerName?: string | null;
  managerPhone?: string | null;
  salesManager?: string | null;
  serviceManager?: string | null;
  status: string;
  sortOrder: number;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${apiBaseUrl}/api/branches?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load branches");

      if (data.data) {
        setBranches(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
      } else {
        setBranches(data.branches || []);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, apiBaseUrl]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBranches();
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/branches/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");

      setSuccess("Status updated successfully.");
      fetchBranches();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to toggle status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete/archive this branch?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/branches/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete branch");

      setSuccess("Branch deleted successfully.");
      fetchBranches();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to delete branch.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Branches CMS</h1>
          <p className="text-neutral-400 text-sm">Configure physical showroom locations, manager details, and contact coordinates.</p>
        </div>
        <Link
          href="/admin/branches/new"
          className="px-4 py-2.5 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors inline-block text-center"
        >
          + Add New Branch
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

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-4 bg-[#18181b]/35 border border-neutral-800 p-6 rounded-xl">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by showroom name, city, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs uppercase tracking-wider font-bold transition-colors"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading branches...</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-[#18181b]/35 border border-neutral-800 border-dashed rounded-xl p-16 text-center">
          <span className="text-4xl mb-4 block">🏢</span>
          <h3 className="text-lg font-bold text-white mb-2">No Showrooms Found</h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
            There are no branches configured in this catalog view. Create one above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#18181b]/20 border border-neutral-800 rounded-xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#18181b]/40 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Name & Code</th>
                <th className="p-4">Location</th>
                <th className="p-4">Contact Detail</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-800/10 transition-colors">
                  <td className="p-4">
                    <span className="font-extrabold text-white block">{b.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{b.code}</span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    <span className="block text-xs font-semibold">{b.city}, {b.state}</span>
                    <span className="block text-[11px] text-neutral-500 truncate max-w-xs">{b.address}</span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    <span className="block text-xs">{b.phone}</span>
                    <span className="block text-[11px] text-neutral-500">{b.email}</span>
                  </td>
                  <td className="p-4 font-mono text-neutral-400 text-xs">
                    {b.sortOrder}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleStatusToggle(b.id, b.status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        b.status === "ACTIVE"
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                          : b.status === "INACTIVE"
                          ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
                          : "bg-rose-950/40 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {b.status}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/branches/edit/${b.id}`}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-500/10 hover:border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-[#18181b]/10">
              <span className="text-xs text-neutral-500 font-mono">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
