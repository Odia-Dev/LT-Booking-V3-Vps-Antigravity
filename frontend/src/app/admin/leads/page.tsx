"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
  vehicle: {
    name: string;
  };
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  source: string;
  notes: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  branchId: string | null;
  variantId: string | null;
  createdAt: string;
  branch?: Branch | null;
  variant?: Variant | null;
}

export default function AdminLeadsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Bulk actions state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkExecutive, setBulkExecutive] = useState("");

  // Options lists
  const [branches, setBranches] = useState<Branch[]>([]);

  // Fetch branches
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/public/branches`);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    }
    fetchBranches();
  }, [apiBaseUrl]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (sourceFilter) params.append("source", sourceFilter);

      const res = await fetch(`${apiBaseUrl}/api/leads?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load leads");
      }

      setLeads(data.data || []);
      setTotalLeads(data.total || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load leads";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, sourceFilter, apiBaseUrl]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle single delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete/archive this lead?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to delete lead");
      }
      setSuccess("Lead successfully deleted/archived");
      fetchLeads();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting lead");
    }
  };

  // Toggle selection
  const handleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  // Bulk actions handlers
  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedLeadIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          fetch(`${apiBaseUrl}/api/leads/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: bulkStatus }),
            credentials: "include",
          })
        )
      );
      setSuccess("Bulk status update completed successfully");
      setSelectedLeadIds([]);
      setBulkStatus("");
      fetchLeads();
    } catch (err) {
      setError("Some leads failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkExecutive || selectedLeadIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          fetch(`${apiBaseUrl}/api/leads/${id}/assign`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ executiveName: bulkExecutive }),
            credentials: "include",
          })
        )
      );
      setSuccess("Bulk executive assignment completed successfully");
      setSelectedLeadIds([]);
      setBulkExecutive("");
      fetchLeads();
    } catch (err) {
      setError("Some leads failed to assign");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0 || !window.confirm("Delete selected leads?")) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          fetch(`${apiBaseUrl}/api/leads/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
      setSuccess("Selected leads successfully archived");
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (err) {
      setError("Some leads failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const parseMetadata = (lead: Lead) => {
    if (!lead.notes) return { priority: "MEDIUM", assignedExecutive: "Unassigned", leadScore: 50 };
    try {
      const parsed = JSON.parse(lead.notes) as { priority?: string; assignedExecutive?: string; leadScore?: number };
      return {
        priority: parsed.priority || "MEDIUM",
        assignedExecutive: parsed.assignedExecutive || "Unassigned",
        leadScore: parsed.leadScore || 50,
      };
    } catch (e) {
      return { priority: "MEDIUM", assignedExecutive: "Unassigned", leadScore: 50 };
    }
  };

  const totalPages = Math.ceil(totalLeads / limit) || 1;

  const statuses = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "TEST_DRIVE",
    "NEGOTIATION",
    "BOOKED",
    "DELIVERED",
    "LOST",
    "FOLLOW_UP",
    "CANCELLED",
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Lead CRM Console</h1>
          <p className="text-neutral-400 text-sm">
            Monitor customer inquiries, test drive requests, exchange pricing, and assign coordinators.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs uppercase tracking-wider font-extrabold">Dismiss</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl text-sm flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-xs uppercase tracking-wider font-extrabold">Dismiss</button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Search Query</label>
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
          >
            <option value="" className="bg-[#18181b]">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-[#18181b]">{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Inquiry Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
          >
            <option value="" className="bg-[#18181b]">All Types</option>
            <option value="TEST_DRIVE" className="bg-[#18181b]">TEST DRIVE</option>
            <option value="SERVICE" className="bg-[#18181b]">SERVICE</option>
            <option value="FINANCE" className="bg-[#18181b]">FINANCE</option>
            <option value="EXCHANGE" className="bg-[#18181b]">EXCHANGE</option>
            <option value="GENERAL" className="bg-[#18181b]">GENERAL</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setTypeFilter("");
            setSourceFilter("");
            setPage(1);
          }}
          className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Bulk Action Controls */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-[#eb0a1e]/10 border border-[#eb0a1e]/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-white font-semibold">
            {selectedLeadIds.length} leads selected
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-2 bg-[#09090b] border border-neutral-800 rounded text-xs text-white focus:outline-none"
              >
                <option value="">Bulk Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusChange}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-bold"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Assign Executive..."
                value={bulkExecutive}
                onChange={(e) => setBulkExecutive(e.target.value)}
                className="px-3 py-2 bg-[#09090b] border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none w-40"
              />
              <button
                onClick={handleBulkAssign}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-bold"
              >
                Assign
              </button>
            </div>

            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-[#eb0a1e] hover:bg-[#c80818] text-white rounded text-xs font-bold"
            >
              Archive Selected
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-[#18181b]/20 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading lead registry...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <span className="text-3xl mb-4">👥</span>
            <p className="text-neutral-500 text-sm font-semibold">No inquiries match the current search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#18181b]/35 text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === leads.length}
                      onChange={handleSelectAll}
                      className="accent-[#eb0a1e]"
                    />
                  </th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Inquiry Type</th>
                  <th className="py-4 px-6">Model/Variant</th>
                  <th className="py-4 px-6">Branch</th>
                  <th className="py-4 px-6">Priority / Score</th>
                  <th className="py-4 px-6">Assigned Executive</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs">
                {leads.map((lead) => {
                  const metadata = parseMetadata(lead);
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr key={lead.id} className="hover:bg-[#18181b]/10 transition-colors">
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectLead(lead.id)}
                          className="accent-[#eb0a1e]"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{lead.name}</div>
                        <div className="text-neutral-500 text-[10px]">{lead.email} | {lead.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full font-bold text-[10px] text-neutral-400">
                          {lead.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {lead.variant ? (
                          <>
                            <div className="font-semibold text-white">{lead.variant.vehicle.name}</div>
                            <div className="text-neutral-500 text-[10px]">{lead.variant.name}</div>
                          </>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {lead.branch ? (
                          <span className="font-semibold text-white">{lead.branch.name}</span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              metadata.priority === "HIGH"
                                ? "bg-red-950/60 border border-red-900/50 text-red-400"
                                : metadata.priority === "MEDIUM"
                                ? "bg-amber-950/60 border border-amber-900/50 text-amber-400"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-400"
                            }`}
                          >
                            {metadata.priority}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            (Score: {metadata.leadScore})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-300">
                        {metadata.assignedExecutive}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.status === "NEW"
                              ? "bg-blue-950/60 border border-blue-900/50 text-blue-400"
                              : lead.status === "COMPLETED" || lead.status === "BOOKED" || lead.status === "DELIVERED"
                              ? "bg-emerald-950/60 border border-emerald-900/50 text-emerald-400"
                              : lead.status === "CANCELLED" || lead.status === "LOST"
                              ? "bg-red-950/60 border border-red-900/50 text-red-400"
                              : "bg-neutral-900 border border-neutral-800 text-neutral-400"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold transition-colors text-[10px] uppercase tracking-wider"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="px-3 py-1.5 border border-red-900/40 hover:bg-red-950/40 text-red-400 rounded font-bold transition-colors text-[10px] uppercase tracking-wider"
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
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <span className="text-xs text-neutral-500">
            Showing Page {page} of {totalPages} ({totalLeads} total records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-300 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-300 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
