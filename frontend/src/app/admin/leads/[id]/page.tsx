"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
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
  updatedAt: string;
  branch?: Branch | null;
  variant?: Variant | null;
}

interface ParsedNotes {
  campaign?: string;
  medium?: string;
  message?: string;
  interestedModel?: string;
  preferredContactTime?: string;
  assignedExecutive?: string;
  priority?: string;
  leadScore?: number;
  originalNotes?: string;
}

export default function AdminLeadDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [executive, setExecutive] = useState("");
  const [updating, setUpdating] = useState(false);

  // New Note state
  const [newNoteText, setNewNoteText] = useState("");

  const fetchLead = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/leads/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load lead details");
      }
      setLead(data.lead);
      setStatus(data.lead.status);

      // Parse metadata from notes
      if (data.lead.notes) {
        try {
          const parsed: ParsedNotes = JSON.parse(data.lead.notes);
          setPriority(parsed.priority || "MEDIUM");
          setExecutive(parsed.assignedExecutive || "");
        } catch (e) {
          // ignore
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading lead");
    } finally {
      setLoading(false);
    }
  }, [id, apiBaseUrl]);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id, fetchLead]);

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      // 1. Update status
      const resStatus = await fetch(`${apiBaseUrl}/api/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!resStatus.ok) throw new Error("Failed to update status");

      // 2. Update priority
      const resPriority = await fetch(`${apiBaseUrl}/api/leads/${id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
        credentials: "include",
      });

      if (!resPriority.ok) throw new Error("Failed to update priority");

      // 3. Update executive
      const resAssign = await fetch(`${apiBaseUrl}/api/leads/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executiveName: executive }),
        credentials: "include",
      });

      if (!resAssign.ok) throw new Error("Failed to assign executive");

      setSuccess("Lead updated successfully");
      fetchLead();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save updates");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !lead) return;

    setUpdating(true);
    try {
      interface NotesMetadata {
        campaign?: string;
        medium?: string;
        message?: string;
        interestedModel?: string;
        preferredContactTime?: string;
        assignedExecutive?: string;
        priority?: string;
        leadScore?: number;
        originalNotes?: string;
        history?: { text: string; createdAt: string; author: string }[];
      }
      let notesObj: NotesMetadata = {};
      if (lead.notes) {
        try {
          notesObj = JSON.parse(lead.notes) as NotesMetadata;
        } catch (e) {
          notesObj = { message: lead.notes || undefined };
        }
      }

      // Append note to a notes history list in metadata
      const history = notesObj.history || [];
      history.push({
        text: newNoteText,
        createdAt: new Date().toISOString(),
        author: "Admin Coordinator",
      });

      notesObj.history = history;

      const res = await fetch(`${apiBaseUrl}/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: JSON.stringify(notesObj) }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to append note");

      setNewNoteText("");
      setSuccess("Internal note added");
      fetchLead();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Archive this lead?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      router.push("/admin/leads");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting lead");
    }
  };

  // Helper to parse notes metadata safely
  const getMetadata = (): {
    campaign?: string;
    medium?: string;
    message?: string;
    interestedModel?: string;
    preferredContactTime?: string;
    leadScore?: number;
    originalNotes?: string;
    history?: { text: string; createdAt: string; author: string }[];
  } => {
    if (!lead?.notes) return {};
    try {
      return JSON.parse(lead.notes);
    } catch (e) {
      return { originalNotes: lead.notes };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Loading lead record details...
        </span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center p-12 space-y-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-lg font-bold text-white">Lead Record Not Found</h2>
        <Link href="/admin/leads" className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] hover:underline">
          ← Back to Registry
        </Link>
      </div>
    );
  }

  const meta = getMetadata();
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link href="/admin/leads" className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] hover:underline flex items-center gap-1.5">
          ← Back to Lead CRM
        </Link>
      </div>

      {/* Header Panel */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full font-bold text-[10px] text-neutral-400">
              {lead.type}
            </span>
            <span className="text-xs text-neutral-500 font-mono">Submitted: {new Date(lead.createdAt).toLocaleString()}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{lead.name}</h1>
        </div>

        <button
          onClick={handleDelete}
          className="px-5 py-2.5 border border-red-900/40 hover:bg-red-950/40 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          Archive Lead
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer profile */}
          <div className="p-6 bg-[#18181b]/20 border border-neutral-800 rounded-xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Email Address</span>
                <a href={`mailto:${lead.email}`} className="text-sm font-bold text-white hover:underline block mt-1">{lead.email}</a>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Phone Number</span>
                <a href={`tel:${lead.phone}`} className="text-sm font-bold text-[#eb0a1e] hover:underline font-mono block mt-1">{lead.phone}</a>
              </div>
            </div>
          </div>

          {/* Model Interest details */}
          <div className="p-6 bg-[#18181b]/20 border border-neutral-800 rounded-xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Model Interest Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Vehicle Model</span>
                <span className="text-sm font-bold text-white block mt-1">
                  {lead.variant ? lead.variant.vehicle.name : meta.interestedModel || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Variant Specification</span>
                <span className="text-sm font-bold text-white block mt-1">
                  {lead.variant ? `${lead.variant.name} (Ex-Showroom: ₹${(lead.variant.price / 100000).toFixed(2)} L)` : "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Preferred Showroom Location</span>
                <span className="text-sm font-bold text-white block mt-1">
                  {lead.branch ? `${lead.branch.name} (${lead.branch.city})` : "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Lead Source</span>
                <span className="text-sm font-mono text-neutral-300 block mt-1">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Campaign UTM metadata */}
          <div className="p-6 bg-[#18181b]/20 border border-neutral-800 rounded-xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Campaign & Context Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">UTM Campaign</span>
                <span className="font-mono text-neutral-300 bg-neutral-900 px-2.5 py-1.5 rounded block border border-neutral-800">{meta.campaign || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">UTM Medium</span>
                <span className="font-mono text-neutral-300 bg-neutral-900 px-2.5 py-1.5 rounded block border border-neutral-800">{meta.medium || "—"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Customer Remarks / Message</span>
                <div className="bg-[#09090b]/60 p-4 border border-neutral-800 rounded-lg text-neutral-300 font-light leading-relaxed">
                  {meta.message || meta.originalNotes || "No custom message attached"}
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Notes history */}
          <div className="p-6 bg-[#18181b]/20 border border-neutral-800 rounded-xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Internal Activity Timeline</h3>

            {/* Note submit form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log call updates, customer feedback, or meeting results..."
                rows={3}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
              />
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                Add Note
              </button>
            </form>

            {/* Notes history list */}
            <div className="space-y-4 pt-4 border-t border-neutral-900">
              {meta.history && meta.history.length > 0 ? (
                meta.history.slice().reverse().map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#18181b]/30 border border-neutral-900 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-neutral-500">
                      <span className="font-bold text-neutral-400">{item.author}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{item.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-neutral-600 py-4 text-xs">No activity logged yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Update controls */}
        <div className="space-y-8">
          <div className="p-6 bg-[#18181b]/25 border border-neutral-800/80 rounded-xl space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Lead Scoring & Status</h3>

            {/* Score pill */}
            <div className="flex justify-between items-center bg-[#09090b]/60 border border-neutral-800 p-4 rounded-xl">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Lead Intent Score</span>
              <span className="text-xl font-black text-emerald-500 font-mono">{meta.leadScore || 50} / 100</span>
            </div>

            <form onSubmit={handleUpdateLead} className="space-y-4">
              <div>
                <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Deal Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="bg-[#18181b]">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Lead Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-700 appearance-none"
                >
                  <option value="HIGH" className="bg-[#18181b]">HIGH</option>
                  <option value="MEDIUM" className="bg-[#18181b]">MEDIUM</option>
                  <option value="LOW" className="bg-[#18181b]">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Assigned Executive</label>
                <input
                  type="text"
                  placeholder="Enter employee name..."
                  value={executive}
                  onChange={(e) => setExecutive(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white font-extrabold uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-40"
              >
                {updating ? "Saving..." : "Save Status Updates"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
