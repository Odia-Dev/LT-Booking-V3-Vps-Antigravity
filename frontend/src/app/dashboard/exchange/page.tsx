"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ExchangeInquiry {
  id: string;
  brand: string;
  model: string;
  year: number;
  expectedValue?: number;
  valuation?: number;
  status: string;
  createdAt: string;
  assignedExecutive?: string;
}

export default function CustomerExchangeDashboard() {
  const [inquiries, setInquiries] = useState<ExchangeInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/exchange/my-inquiries`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load exchange requests");
      setInquiries(data.data || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your requests...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Vehicle Exchange Valuations</h1>
      
      {inquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <p className="text-gray-500 mb-4">You have not requested any vehicle evaluations.</p>
          <Link href="/exchange" className="text-red-600 font-medium hover:underline">Request Free Valuation</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow p-6 border flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{inquiry.brand} {inquiry.model} ({inquiry.year})</h3>
                <p className="text-sm text-gray-500">
                  Your Expected Value: {inquiry.expectedValue ? `₹${inquiry.expectedValue.toLocaleString()}` : 'Not provided'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:text-right border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="mb-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                    inquiry.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                    inquiry.status === "OFFER_MADE" ? "bg-blue-100 text-blue-800" :
                    inquiry.status === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {inquiry.status.replace("_", " ")}
                  </span>
                </div>
                
                {inquiry.valuation ? (
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="text-xs text-green-700 font-medium">Toyota Offer Value</p>
                    <p className="text-lg font-bold text-green-800">₹{inquiry.valuation.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Evaluation in progress...</p>
                )}
                
                {inquiry.assignedExecutive && (
                  <p className="text-xs text-gray-400 mt-2">An executive is assigned to your case.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
