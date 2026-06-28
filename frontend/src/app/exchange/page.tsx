"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExchangeInquiryPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brand: "",
    model: "",
    year: "",
    kmDriven: "",
    fuelType: "Petrol",
    expectedValue: "",
    registrationNumber: "",
    notes: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5)); // max 5 images
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      images.forEach(img => {
        data.append("images", img);
      });

      const res = await fetch(`${apiBaseUrl}/api/public/exchange`, {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to submit inquiry");

      setSuccess(true);
      setFormData({
        name: "", email: "", phone: "", brand: "", model: "",
        year: "", kmDriven: "", fuelType: "Petrol", expectedValue: "",
        registrationNumber: "", notes: "",
      });
      setImages([]);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Request Submitted!</h1>
        <p className="text-gray-600 mb-8">Our evaluation team will review your vehicle details and contact you shortly with an offer.</p>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Exchange Value Calculator</h1>
      <p className="text-gray-600 mb-8">Trade in your old car for a brand new Toyota. Provide your current vehicle details to get a free valuation.</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border-l-4 border-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border space-y-6">
        
        <h2 className="text-xl font-semibold border-b pb-2">Your Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>

        <h2 className="text-xl font-semibold border-b pb-2 mt-8">Vehicle Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
            <input required type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Maruti Suzuki" className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <input required type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Swift Dzire" className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year *</label>
            <input required type="number" name="year" min="1990" max={new Date().getFullYear()} value={formData.year} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total KM Driven *</label>
            <input required type="number" name="kmDriven" min="0" value={formData.kmDriven} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="EV">Electric (EV)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. MH-01-AB-1234" className="w-full border rounded-md px-3 py-2 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Value (₹)</label>
            <input type="number" name="expectedValue" value={formData.expectedValue} onChange={handleChange} placeholder="e.g. 500000" className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Vehicle Images (Max 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full border rounded-md px-3 py-2" />
            <p className="text-xs text-gray-500 mt-1">Upload front, back, interior, and dashboard (showing ODO).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full border rounded-md px-3 py-2" placeholder="Any major dents or issues?"></textarea>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition disabled:opacity-50">
            {loading ? "Submitting..." : "Submit for Free Evaluation"}
          </button>
        </div>
      </form>
    </div>
  );
}
