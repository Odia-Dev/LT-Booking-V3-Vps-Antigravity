"use client";

import React, { useState, useEffect, useCallback } from "react";

interface InsuranceInquiry {
  id: string;
  vehicleSelection: string;
  policyType: string;
  existingPolicyProvider?: string;
  status: string;
  createdAt: string;
  assignedExecutive?: string;
}

export default function CustomerInsuranceDashboard() {
  const [inquiries, setInquiries] = useState<InsuranceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/insurance/my-inquiries`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load your inquiries");
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your inquiries...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Insurance Inquiries</h1>
      
      {inquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <p className="text-gray-500 mb-4">You have not submitted any insurance inquiries yet.</p>
          <a href="/insurance" className="text-red-600 font-medium hover:underline">Get an Insurance Quote</a>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow p-6 border flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{inquiry.vehicleSelection}</h3>
                <p className="text-sm text-gray-500">
                  {inquiry.policyType} Policy {inquiry.existingPolicyProvider ? `(Current: ${inquiry.existingPolicyProvider})` : ""}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                  inquiry.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                  inquiry.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {inquiry.status.replace("_", " ")}
                </span>
                {inquiry.assignedExecutive && (
                  <p className="text-xs text-gray-500 mt-2">Agent assigned. We will contact you soon.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
