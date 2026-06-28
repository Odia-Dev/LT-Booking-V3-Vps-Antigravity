"use client";

import React, { useState, useEffect, useCallback } from "react";

interface InsuranceInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleSelection: string;
  existingPolicyProvider?: string;
  policyType: string;
  preferredContactTime?: string;
  notes?: string;
  status: string;
  assignedExecutive?: string;
  createdAt: string;
}

export default function AdminInsurancePage() {
  const [inquiries, setInquiries] = useState<InsuranceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/insurance`, {
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

  const handleUpdate = async (id: string, updates: Partial<InsuranceInquiry>) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/insurance/${id}`, {
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

  if (loading) return <div className="p-8 text-center">Loading inquiries...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Insurance Inquiries (M16)</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date / Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle / Policy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Exec</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 font-medium">{inquiry.name}</p>
                  <p className="text-xs text-gray-500">{inquiry.phone} | {inquiry.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(inquiry.createdAt).toLocaleDateString()} ({inquiry.preferredContactTime})</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 font-medium">{inquiry.vehicleSelection}</p>
                  <p className="text-xs text-gray-500">
                    {inquiry.policyType} {inquiry.existingPolicyProvider ? `(${inquiry.existingPolicyProvider})` : ""}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleUpdate(inquiry.id, { status: e.target.value })}
                    className={`text-xs rounded-full px-3 py-1 font-semibold ${
                      inquiry.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      inquiry.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    defaultValue={inquiry.assignedExecutive || ""} 
                    onBlur={(e) => {
                      if(e.target.value !== inquiry.assignedExecutive) {
                        handleUpdate(inquiry.id, { assignedExecutive: e.target.value });
                      }
                    }}
                    placeholder="Assign..."
                    className="text-sm border rounded px-2 py-1 w-32"
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea 
                    defaultValue={inquiry.notes || ""} 
                    onBlur={(e) => {
                      if(e.target.value !== inquiry.notes) {
                        handleUpdate(inquiry.id, { notes: e.target.value });
                      }
                    }}
                    placeholder="Add note..."
                    className="text-sm border rounded px-2 py-1 w-full h-10"
                  />
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No inquiries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
