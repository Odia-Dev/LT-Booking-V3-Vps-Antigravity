"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ExchangeInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  kmDriven: number;
  fuelType: string;
  expectedValue?: number;
  registrationNumber: string;
  images?: string[];
  valuation?: number;
  notes?: string;
  status: string;
  assignedExecutive?: string;
  createdAt: string;
}

export default function AdminExchangePage() {
  const [inquiries, setInquiries] = useState<ExchangeInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/exchange`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch inquiries");
      setInquiries(data.data || []);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdate = async (id: string, updates: Partial<ExchangeInquiry>) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/exchange/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchInquiries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Exchange Requests (M17)</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valuation (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exec / Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 font-medium">{inquiry.name}</p>
                  <p className="text-xs text-gray-500">{inquiry.phone} | {inquiry.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900">{inquiry.brand} {inquiry.model} ({inquiry.year})</p>
                  <p className="text-xs text-gray-500">{inquiry.fuelType} | {inquiry.kmDriven.toLocaleString()} km</p>
                  <p className="text-xs font-mono text-gray-600 mt-1">{inquiry.registrationNumber}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-500">Exp: {inquiry.expectedValue ? `₹${inquiry.expectedValue.toLocaleString()}` : 'N/A'}</p>
                    <input 
                      type="number" 
                      defaultValue={inquiry.valuation || ""} 
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if(!isNaN(val) && val !== inquiry.valuation) {
                          handleUpdate(inquiry.id, { valuation: val });
                        }
                      }}
                      placeholder="Enter Offer"
                      className="text-sm border rounded px-2 py-1 w-24"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleUpdate(inquiry.id, { status: e.target.value })}
                    className={`text-xs rounded-full px-3 py-1 font-semibold ${
                      inquiry.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                      inquiry.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      inquiry.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                      "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="EVALUATING">EVALUATING</option>
                    <option value="OFFER_MADE">OFFER MADE</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td className="px-6 py-4 space-y-2">
                  <input 
                    type="text" 
                    defaultValue={inquiry.assignedExecutive || ""} 
                    onBlur={(e) => {
                      if(e.target.value !== inquiry.assignedExecutive) {
                        handleUpdate(inquiry.id, { assignedExecutive: e.target.value });
                      }
                    }}
                    placeholder="Exec ID..."
                    className="text-xs border rounded px-2 py-1 w-full"
                  />
                  <textarea 
                    defaultValue={inquiry.notes || ""} 
                    onBlur={(e) => {
                      if(e.target.value !== inquiry.notes) {
                        handleUpdate(inquiry.id, { notes: e.target.value });
                      }
                    }}
                    placeholder="Internal notes..."
                    className="text-xs border rounded px-2 py-1 w-full h-12"
                  />
                </td>
                <td className="px-6 py-4">
                  {inquiry.images && inquiry.images.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                      {inquiry.images.map((img, idx) => (
                        <a key={idx} href={`${apiBaseUrl}${img}`} target="_blank" rel="noreferrer" className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-[8px] flex items-center justify-center">
                          Img {idx+1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No images</span>
                  )}
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No exchange requests found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
