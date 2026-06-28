"use client";

import React, { useState, useEffect, useCallback } from "react";

interface InventoryItem {
  id: string;
  vin: string;
  engineNumber?: string;
  chassisNumber?: string;
  vehicleId: string;
  variantId: string;
  colorId: string;
  branchId: string;
  status: string; // AVAILABLE, RESERVED, SOLD, TRANSFERRED
  notes?: string;
  receivedAt: string;
  
  vehicle?: { id: string; name: string };
  variant?: { id: string; name: string };
  color?: { id: string; name: string };
  branch?: { id: string; name: string };
}

interface AlertData {
  agingInventory: InventoryItem[];
  lowStockAlerts: { vehicle: string; count: number }[];
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters for fetching
  const [filters, setFilters] = useState({ branchId: "", status: "", vehicleId: "" });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Form State for Add Stock
  const [formData, setFormData] = useState({
    vin: "",
    engineNumber: "",
    chassisNumber: "",
    vehicleId: "",
    variantId: "",
    colorId: "",
    branchId: "",
    status: "AVAILABLE",
    notes: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filters).toString();
      
      const [invRes, alertRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/admin/inventory?${q}`, { credentials: "include" }),
        fetch(`${apiBaseUrl}/api/admin/inventory/alerts`, { credentials: "include" })
      ]);
      
      const invData = await invRes.json();
      const alertData = await alertRes.json();
      
      if (!invRes.ok) throw new Error(invData.message);
      
      setItems(invData.data || []);
      setAlerts(alertData.data || null);
    } catch (err: unknown) {
      setError((err as Error).message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [filters, apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add stock");
      
      setShowAddModal(false);
      fetchData();
      setFormData({
        vin: "", engineNumber: "", chassisNumber: "", vehicleId: "",
        variantId: "", colorId: "", branchId: "", status: "AVAILABLE", notes: ""
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management (M19)</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
          + Add Stock
        </button>
      </div>

      {/* ALERTS SECTION */}
      {alerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Low Stock Alerts</h3>
            {alerts.lowStockAlerts.length === 0 ? (
              <p className="text-sm text-gray-500">All vehicles have healthy stock levels (3+).</p>
            ) : (
              <ul className="space-y-1">
                {alerts.lowStockAlerts.map((a, i) => (
                  <li key={i} className="text-sm text-red-600 font-medium">
                    ⚠️ {a.vehicle} - Only {a.count} left in stock
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Aging Inventory (> 90 Days)</h3>
            {alerts.agingInventory.length === 0 ? (
              <p className="text-sm text-gray-500">No aging inventory detected.</p>
            ) : (
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {alerts.agingInventory.map((a, i) => (
                  <li key={i} className="text-sm text-orange-700 font-medium">
                    🕒 {a.vehicle?.name} (VIN: {a.vin}) - Received: {new Date(a.receivedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Filter by Status (e.g. AVAILABLE, RESERVED)"
          value={filters.status}
          onChange={e => setFilters({...filters, status: e.target.value.toUpperCase()})}
          className="border p-2 rounded text-sm w-full max-w-xs"
        />
        <button onClick={fetchData} className="bg-gray-200 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-300">Refresh</button>
      </div>

      {/* INVENTORY TABLE */}
      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading inventory...</div>
      ) : error ? (
        <div className="text-center p-8 text-red-600 bg-red-50 rounded">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle / Identifiers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch & Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aging</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => {
                const daysOld = Math.floor((new Date().getTime() - new Date(item.receivedAt).getTime()) / (1000 * 3600 * 24));
                return (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-900">{item.vehicle?.name} - {item.variant?.name}</p>
                    <p className="text-xs text-gray-600">Color: {item.color?.name}</p>
                    <div className="mt-1 font-mono text-[10px] text-gray-500">
                      <p>VIN: {item.vin}</p>
                      <p>ENG: {item.engineNumber || 'N/A'}</p>
                      <p>CHAS: {item.chassisNumber || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {item.branch?.name || item.branchId}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      className={`text-xs font-bold rounded-full px-3 py-1 ${
                        item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        item.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="RESERVED">RESERVED</option>
                      <option value="SOLD">SOLD</option>
                      <option value="TRANSFERRED">TRANSFERRED</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <p className={`text-sm font-medium ${daysOld > 90 ? 'text-red-600' : 'text-gray-900'}`}>{daysOld} days</p>
                    <p className="text-xs text-gray-500">{new Date(item.receivedAt).toLocaleDateString()}</p>
                  </td>
                </tr>
              )})}
              {items.length === 0 && (
                <tr><td colSpan={4} className="text-center p-6 text-gray-500">No inventory found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New Inventory Stock</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">VIN *</label>
                  <input required type="text" value={formData.vin} onChange={e=>setFormData({...formData, vin: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Engine Number</label>
                  <input type="text" value={formData.engineNumber} onChange={e=>setFormData({...formData, engineNumber: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Chassis Number</label>
                  <input type="text" value={formData.chassisNumber} onChange={e=>setFormData({...formData, chassisNumber: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vehicle ID *</label>
                  <input required type="text" value={formData.vehicleId} onChange={e=>setFormData({...formData, vehicleId: e.target.value})} className="w-full border p-2 rounded" placeholder="UUID of Vehicle" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Variant ID *</label>
                  <input required type="text" value={formData.variantId} onChange={e=>setFormData({...formData, variantId: e.target.value})} className="w-full border p-2 rounded" placeholder="UUID of Variant" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color ID *</label>
                  <input required type="text" value={formData.colorId} onChange={e=>setFormData({...formData, colorId: e.target.value})} className="w-full border p-2 rounded" placeholder="UUID of Color" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Branch ID *</label>
                  <input required type="text" value={formData.branchId} onChange={e=>setFormData({...formData, branchId: e.target.value})} className="w-full border p-2 rounded" placeholder="UUID of Branch" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Save Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
