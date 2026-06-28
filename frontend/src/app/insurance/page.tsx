"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function InsuranceInquiryPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleSelection: "",
    existingPolicyProvider: "",
    policyType: "NEW",
    preferredContactTime: "MORNING",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${apiBaseUrl}/api/public/insurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit inquiry");

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        vehicleSelection: "",
        existingPolicyProvider: "",
        policyType: "NEW",
        preferredContactTime: "MORNING",
        notes: "",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Inquiry Received!</h1>
        <p className="text-gray-600 mb-8">Thank you for your interest in Toyota Insurance. Our executives will contact you at your preferred time.</p>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Toyota Protect Insurance</h1>
      <p className="text-gray-600 mb-8">Get the best quote for your vehicle. Fill out the form below and we'll get in touch with you.</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border-l-4 border-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle/Variant *</label>
            <input required type="text" name="vehicleSelection" value={formData.vehicleSelection} onChange={handleChange} placeholder="e.g. Fortuner Legender 4x4" className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type *</label>
            <select name="policyType" value={formData.policyType} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
              <option value="NEW">New Policy</option>
              <option value="RENEWAL">Renewal</option>
            </select>
          </div>
          {formData.policyType === "RENEWAL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing Provider</label>
              <input type="text" name="existingPolicyProvider" value={formData.existingPolicyProvider} onChange={handleChange} placeholder="e.g. ICICI Lombard" className="w-full border rounded-md px-3 py-2" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Time</label>
            <select name="preferredContactTime" value={formData.preferredContactTime} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
              <option value="MORNING">Morning (9 AM - 12 PM)</option>
              <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
              <option value="EVENING">Evening (4 PM - 7 PM)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full border rounded-md px-3 py-2" placeholder="Any specific coverage requirements?"></textarea>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition disabled:opacity-50">
            {loading ? "Submitting..." : "Get a Quote"}
          </button>
        </div>
      </form>
    </div>
  );
}
