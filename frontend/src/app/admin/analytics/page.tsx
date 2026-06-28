"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

interface AnalyticsData {
  widgets: {
    totalLeads: number;
    totalTestDrives: number;
    totalBookings: number;
    totalRevenue: number;
    bookingConversionPct: string;
    paymentConversionPct: string;
  };
  performance: {
    branch: { name: string; bookings: number }[];
    vehicle: { name: string; bookings: number }[];
    source: { name: string; leads: number }[];
    executive: { name: string; bookings: number }[];
  };
  trends: {
    name: string;
    leads: number;
    bookings: number;
    revenue: number;
  }[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branchId: "",
    vehicleId: "",
    source: ""
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${apiBaseUrl}/api/admin/analytics?${query}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load analytics");
      setData(json.data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters, apiBaseUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const exportToCSV = () => {
    if (!data) return;
    
    // Create a CSV string from trends data
    const headers = ["Month", "Leads", "Bookings", "Revenue"];
    const rows = data.trends.map(t => [t.name, t.leads, t.bookings, t.revenue]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dealership_analytics.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50">{error}</div>;
  if (!data) return null;

  const { widgets, performance, trends } = data;

  // Funnel data logic
  const funnelData = [
    { name: 'Leads', value: widgets.totalLeads, fill: '#ef4444' },
    { name: 'Test Drives', value: widgets.totalTestDrives, fill: '#f97316' },
    { name: 'Bookings', value: widgets.totalBookings, fill: '#22c55e' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting (M18)</h1>
        <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full text-sm border rounded p-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full text-sm border rounded p-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
          <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full text-sm border rounded p-2">
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="GOOGLE">Google</option>
            <option value="WALK_IN">Walk-in</option>
          </select>
        </div>
        {/* Branch & Vehicle ID filters can be added here if we load their options, hiding for simplicity in UI */}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Leads", value: widgets.totalLeads, color: "text-blue-600" },
          { label: "Test Drives", value: widgets.totalTestDrives, color: "text-orange-600" },
          { label: "Bookings", value: widgets.totalBookings, color: "text-green-600" },
          { label: "Revenue (₹)", value: `₹${widgets.totalRevenue.toLocaleString()}`, color: "text-gray-900" },
          { label: "Booking Conv.", value: `${widgets.bookingConversionPct}%`, color: "text-purple-600" },
          { label: "Payment Conv.", value: `${widgets.paymentConversionPct}%`, color: "text-indigo-600" },
        ].map((w, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow text-center border">
            <p className="text-xs font-medium text-gray-500 uppercase">{w.label}</p>
            <p className={`text-xl font-bold mt-2 ${w.color}`}>{w.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Leads vs Bookings Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#ef4444" name="Leads" />
                <Line type="monotone" dataKey="bookings" stroke="#22c55e" name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend (₹)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Conversion Funnel</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Top Branches (Bookings)</h3>
              <ul className="space-y-2">
                {performance.branch.map((b, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{b.name}</span>
                    <span className="font-bold">{b.bookings}</span>
                  </li>
                ))}
                {performance.branch.length === 0 && <li className="text-xs text-gray-400">No data</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Top Vehicles (Bookings)</h3>
              <ul className="space-y-2">
                {performance.vehicle.map((v, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{v.name}</span>
                    <span className="font-bold">{v.bookings}</span>
                  </li>
                ))}
                {performance.vehicle.length === 0 && <li className="text-xs text-gray-400">No data</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Lead Sources</h3>
              <ul className="space-y-2">
                {performance.source.map((s, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="font-bold">{s.leads}</span>
                  </li>
                ))}
                {performance.source.length === 0 && <li className="text-xs text-gray-400">No data</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Top Executives (Bookings)</h3>
              <ul className="space-y-2">
                {performance.executive.map((e, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{e.name}</span>
                    <span className="font-bold">{e.bookings}</span>
                  </li>
                ))}
                {performance.executive.length === 0 && <li className="text-xs text-gray-400">No data</li>}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
