"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Offer {
  id: string;
  title: string;
  description: string;
  cashDiscount: number;
  exchangeBonus: number;
  corporateOffer: number;
  financeOffer: string;
  status: string;
  validUntil: string | null;
  createdAt: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cashDiscount, setCashDiscount] = useState<number>(0);
  const [exchangeBonus, setExchangeBonus] = useState<number>(0);
  const [corporateOffer, setCorporateOffer] = useState<number>(0);
  const [financeOffer, setFinanceOffer] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [validUntil, setValidUntil] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${apiBaseUrl}/api/admin/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load offers");
      setOffers(data.offers || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load offers.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingId(offer.id);
      setTitle(offer.title);
      setDescription(offer.description || "");
      setCashDiscount(offer.cashDiscount);
      setExchangeBonus(offer.exchangeBonus);
      setCorporateOffer(offer.corporateOffer);
      setFinanceOffer(offer.financeOffer || "");
      setStatus(offer.status || "ACTIVE");
      setValidUntil(offer.validUntil ? offer.validUntil.split("T")[0] : "");
    } else {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setCashDiscount(0);
      setExchangeBonus(0);
      setCorporateOffer(0);
      setFinanceOffer("");
      setStatus("ACTIVE");
      setValidUntil("");
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      title,
      description,
      cashDiscount: Number(cashDiscount),
      exchangeBonus: Number(exchangeBonus),
      corporateOffer: Number(corporateOffer),
      financeOffer,
      status,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
    };

    try {
      const url = editingId ? `${apiBaseUrl}/api/admin/offers/${editingId}` : `${apiBaseUrl}/api/admin/offers`;
      const method = editingId ? "PUT" : "POST";
      const token = localStorage.getItem("adminToken");

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");

      setSuccess(editingId ? "Offer updated successfully!" : "Offer created successfully!");
      setShowModal(false);
      fetchOffers();
    } catch (err: unknown) {
      setError((err as Error).message || "Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${apiBaseUrl}/api/admin/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deletion failed");

      setSuccess("Offer deleted successfully!");
      fetchOffers();
    } catch (err: unknown) {
      setError((err as Error).message || "Deletion failed.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Campaign & Offers</h1>
          <p className="text-neutral-400 text-sm">Manage sales campaigns, finance discounts, and exchange values.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg transition-colors text-xs uppercase tracking-wider shadow-lg"
        >
          + New Offer
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold animate-pulse">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Loading offers...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[40vh] border-dashed">
          <span className="text-4xl mb-4">🏷️</span>
          <h3 className="text-lg font-bold text-white mb-2">No active campaigns</h3>
          <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">
            Create your first marketing deal or promotional scheme to see it listed here.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg transition-colors text-xs uppercase tracking-wider"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{offer.title}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    offer.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                    offer.status === "INACTIVE" ? "bg-neutral-800 text-neutral-400" :
                    "bg-rose-500/20 text-rose-400"
                  }`}>
                    {offer.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(offer)} className="p-2 text-neutral-400 hover:text-white transition-colors">✏️</button>
                  <button onClick={() => handleDelete(offer.id)} className="p-2 text-rose-400 hover:text-rose-300 transition-colors">🗑️</button>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-6 flex-1 line-clamp-3">
                {offer.description || "No description provided."}
              </p>
              
              <div className="space-y-3 mb-6">
                {offer.cashDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-neutral-800/50 pb-2">
                    <span className="text-neutral-500">Cash Discount</span>
                    <span className="font-mono text-emerald-400">₹{offer.cashDiscount.toLocaleString()}</span>
                  </div>
                )}
                {offer.exchangeBonus > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-neutral-800/50 pb-2">
                    <span className="text-neutral-500">Exchange Bonus</span>
                    <span className="font-mono text-emerald-400">₹{offer.exchangeBonus.toLocaleString()}</span>
                  </div>
                )}
                {offer.corporateOffer > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-neutral-800/50 pb-2">
                    <span className="text-neutral-500">Corp Offer</span>
                    <span className="font-mono text-emerald-400">₹{offer.corporateOffer.toLocaleString()}</span>
                  </div>
                )}
                {offer.financeOffer && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Finance</span>
                    <span className="text-white font-medium">{offer.financeOffer}</span>
                  </div>
                )}
              </div>

              {offer.validUntil && (
                <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Valid Until</span>
                  <span className="text-xs text-white font-mono">{new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
              <h2 className="text-2xl font-black text-white">{editingId ? "Edit Offer" : "Create Offer"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-sm uppercase tracking-wider px-3 py-1.5 border border-neutral-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year End Bonanza"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Terms and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Cash Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={cashDiscount}
                    onChange={(e) => setCashDiscount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Exchange Bonus (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={exchangeBonus}
                    onChange={(e) => setExchangeBonus(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Corporate Offer (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={corporateOffer}
                    onChange={(e) => setCorporateOffer(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Finance Offer Details</label>
                <input
                  type="text"
                  placeholder="e.g. 5.99% ROI for 5 Years"
                  value={financeOffer}
                  onChange={(e) => setFinanceOffer(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-4 py-3 bg-[#09090b] border border-neutral-800 rounded-lg text-neutral-300 text-sm focus:outline-none focus:border-neutral-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
                >
                  {editingId ? "Save Changes" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
