"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface FinanceApplication {
  id: string;
  financeId: string;
  vehicle?: { name: string };
  bankName: string | null;
  loanAmount: number | null;
  emiAmount: number | null;
  status: string;
  createdAt: string;
}

export default function CustomerFinancePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [applications, setApplications] = useState<FinanceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      // The backend enforces RBAC based on the cookie token to only return this customer's applications
      const res = await fetch(`${apiBaseUrl}/api/finance`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load finance applications");

      setApplications(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your finance applications...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Finance Applications</h1>
        <p className="mt-2 text-sm text-gray-600">Track and manage your vehicle financing requests.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center border">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Finance Applications Found</h2>
          <p className="text-gray-500">You don't have any ongoing vehicle financing requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow border p-6 flex flex-col md:flex-row justify-between items-center transition hover:shadow-md">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{app.vehicle?.name || "Vehicle"}</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    app.status === "DISBURSED" ? "bg-green-100 text-green-800" :
                    app.status === "SANCTION_REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Application ID: {app.financeId} • Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Bank</p>
                    <p className="font-medium text-gray-900">{app.bankName || "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Loan Amount</p>
                    <p className="font-medium text-gray-900">{app.loanAmount ? `₹${app.loanAmount.toLocaleString()}` : "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">EMI</p>
                    <p className="font-medium text-gray-900">{app.emiAmount ? `₹${app.emiAmount.toLocaleString()}` : "TBD"}</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto md:pl-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0">
                <Link
                  href={`/dashboard/finance/${app.id}`}
                  className="w-full inline-block text-center bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
