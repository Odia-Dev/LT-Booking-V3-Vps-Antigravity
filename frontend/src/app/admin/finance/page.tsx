"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface FinanceApplication {
  id: string;
  financeId: string;
  customer?: Customer;
  vehicle?: Vehicle;
  branch?: Branch;
  bankName: string | null;
  loanAmount: number | null;
  emiAmount: number | null;
  status: string;
  assignedExecutive: string | null;
  createdAt: string;
}

export default function AdminFinancePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [applications, setApplications] = useState<FinanceApplication[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [executiveFilter, setExecutiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (bankFilter) params.append("bankName", bankFilter);
      if (executiveFilter) params.append("assignedExecutive", executiveFilter);

      const res = await fetch(`${apiBaseUrl}/api/finance?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load finance applications");
      }

      setApplications(data.data || []);
      setTotalApplications(data.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, bankFilter, executiveFilter, apiBaseUrl]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/finance/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      setSuccess("Application deleted successfully");
      fetchApplications();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting application");
    }
  };

  const totalPages = Math.ceil(totalApplications / limit);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Applications</h1>
          <p className="mt-2 text-sm text-gray-700">Manage all customer vehicle financing requests.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
          <p>{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by ID, customer name..."
          className="border rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="INITIATED">Initiated</option>
          <option value="DOCUMENT_PENDING">Document Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SANCTION_APPROVED">Sanction Approved</option>
          <option value="SANCTION_REJECTED">Sanction Rejected</option>
          <option value="DISBURSEMENT_PENDING">Disbursement Pending</option>
          <option value="DISBURSED">Disbursed</option>
          <option value="CLOSED">Closed</option>
        </select>
        <input
          type="text"
          placeholder="Filter by Bank"
          className="border rounded-md px-3 py-2 text-sm"
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Executive ID"
          className="border rounded-md px-3 py-2 text-sm"
          value={executiveFilter}
          onChange={(e) => setExecutiveFilter(e.target.value)}
        />
        <button
          onClick={() => { setPage(1); fetchApplications(); }}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No finance applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank & Loan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executive</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.financeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.customer?.name || "N/A"} <br/>
                      <span className="text-xs text-gray-400">{app.customer?.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.vehicle?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{app.bankName || "Unassigned"}</div>
                      <div className="text-xs text-gray-400">
                        Amt: ₹{app.loanAmount || 0} | EMI: ₹{app.emiAmount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === "DISBURSED" ? "bg-green-100 text-green-800" :
                        app.status === "SANCTION_REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.assignedExecutive || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/finance/${app.id}`} className="text-red-600 hover:text-red-900 mr-4">
                        View
                      </Link>
                      <button onClick={() => handleDelete(app.id)} className="text-gray-500 hover:text-gray-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalApplications)}</span> of <span className="font-medium">{totalApplications}</span> results
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
