"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [workingHours, setWorkingHours] = useState("9:00 AM - 7:00 PM");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [salesManager, setSalesManager] = useState("");
  const [serviceManager, setServiceManager] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [sortOrder, setSortOrder] = useState("0");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/branches/${id}`);
        const data = await res.json();
        if (res.ok && data.branch) {
          const b = data.branch;
          setName(b.name || "");
          setCode(b.code || "");
          setAddress(b.address || "");
          setCity(b.city || "");
          setDistrict(b.district || "");
          setState(b.state || "");
          setPincode(b.pincode || "");
          setPhone(b.phone || "");
          setWhatsapp(b.whatsapp || "");
          setEmail(b.email || "");
          setGoogleMapsUrl(b.googleMapsUrl || "");
          setWorkingHours(b.workingHours || "");
          setLatitude(b.latitude ? String(b.latitude) : "");
          setLongitude(b.longitude ? String(b.longitude) : "");
          setSalesManager(b.salesManager || "");
          setServiceManager(b.serviceManager || "");
          setStatus(b.status || "ACTIVE");
          setSortOrder(b.sortOrder ? String(b.sortOrder) : "0");
        }
      } catch (err) {
        console.error("Failed to fetch branch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [id, apiBaseUrl]);


  // Auto slugify from name
  useEffect(() => {
    const generated = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
    setSlug(generated);
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${apiBaseUrl}/api/admin/branches/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          slug,
          code,
          address,
          city,
          district,
          state,
          pincode,
          phone,
          whatsapp: whatsapp || null,
          email,
          googleMapsUrl,
          workingHours,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          salesManager: salesManager || null,
          serviceManager: serviceManager || null,
          status,
          sortOrder: sortOrder ? Number(sortOrder) : 0,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update branch");

      setSuccess("Branch updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/branches");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update branch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Edit Branch</h1>
          <p className="text-neutral-400 text-sm">Add a new physical showroom or service center outlet.</p>
        </div>
        <Link
          href="/admin/branches"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs uppercase font-bold transition-colors"
        >
          Cancel
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#18181b]/35 border border-neutral-800 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Showroom Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Bhubaneswar HQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Branch Code (Unique)</label>
            <input
              type="text"
              required
              placeholder="e.g. BBSR01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Slug (Generated)</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full bg-[#09090b]/55 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Phone</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 94370 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">WhatsApp</label>
            <input
              type="text"
              placeholder="e.g. +91 94370 12345"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email</label>
            <input
              type="email"
              required
              placeholder="e.g. showroom@laxmitoyota.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Working Hours</label>
            <input
              type="text"
              placeholder="e.g. 9:00 AM - 7:00 PM"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Address</label>
            <input
              type="text"
              required
              placeholder="Full physical street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">City</label>
            <input
              type="text"
              required
              placeholder="Bhubaneswar"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">District</label>
            <input
              type="text"
              required
              placeholder="Khurda"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">State</label>
            <input
              type="text"
              required
              placeholder="Odisha"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Pincode</label>
            <input
              type="text"
              required
              placeholder="e.g. 751010"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 20.2961"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 85.8245"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Google Maps URL</label>
            <input
              type="text"
              required
              placeholder="https://maps.google.com/..."
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Sales Manager</label>
            <input
              type="text"
              placeholder="Sales Manager Name"
              value={salesManager}
              onChange={(e) => setSalesManager(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Service Manager</label>
            <input
              type="text"
              placeholder="Service Manager Name"
              value={serviceManager}
              onChange={(e) => setServiceManager(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c80818] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? "Creating..." : "Save Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}
