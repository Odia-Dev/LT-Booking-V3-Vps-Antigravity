"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  heroImage: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
}

interface Variant {
  id: string;
  vehicleId: string;
  name: string;
  price: number;
  fuelType: string;
  transmission: string;
  seating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleColor {
  id: string;
  vehicleId: string;
  name: string;
  colorCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("SUV");
  const [formDescription, setFormDescription] = useState("");
  const [formHeroImage, setFormHeroImage] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");

  // Variants CMS State
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedVehicleForVariants, setSelectedVehicleForVariants] = useState<Vehicle | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [variantSuccess, setVariantSuccess] = useState("");

  // Variant Form State
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [varFormName, setVarFormName] = useState("");
  const [varFormPrice, setVarFormPrice] = useState(0);
  const [varFormFuel, setVarFormFuel] = useState("Petrol");
  const [varFormTrans, setVarFormTrans] = useState("Manual");
  const [varFormSeat, setVarFormSeat] = useState(5);
  const [varFormStatus, setVarFormStatus] = useState("ACTIVE");

  // Colors CMS State
  const [showColorsModal, setShowColorsModal] = useState(false);
  const [selectedVehicleForColors, setSelectedVehicleForColors] = useState<Vehicle | null>(null);
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [colorError, setColorError] = useState("");
  const [colorSuccess, setColorSuccess] = useState("");

  // Color Form State
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [colFormName, setColFormName] = useState("");
  const [colFormCode, setColFormCode] = useState("#1C1C1E");
  const [colFormStatus, setColFormStatus] = useState("ACTIVE");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${apiBaseUrl}/api/vehicles?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load vehicles");
      setVehicles(data.vehicles);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, apiBaseUrl]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormCategory("SUV");
    setFormDescription("");
    setFormHeroImage("https://res.cloudinary.com/demo/image/upload/v1611234567/sample.png");
    setFormStatus("ACTIVE");
    setFormSeoTitle("");
    setFormSeoDescription("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setFormName(v.name);
    setFormCategory(v.category);
    setFormDescription(v.description || "");
    setFormHeroImage(v.heroImage || "");
    setFormStatus(v.status || "ACTIVE");
    setFormSeoTitle(v.seoTitle || "");
    setFormSeoDescription(v.seoDescription || "");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: formName,
      category: formCategory,
      description: formDescription,
      heroImage: formHeroImage,
      status: formStatus,
      seoTitle: formSeoTitle,
      seoDescription: formSeoDescription,
    };

    try {
      const url = editingId
        ? `${apiBaseUrl}/api/admin/vehicles/${editingId}`
        : `${apiBaseUrl}/api/admin/vehicles`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Operation failed");
      }

      setSuccess(editingId ? "Vehicle updated successfully!" : "Vehicle created successfully!");
      setShowModal(false);
      fetchVehicles();
    } catch (err: unknown) {
      setError((err as Error).message || "Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/vehicles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Deletion failed");
      }

      setSuccess("Vehicle deleted successfully!");
      fetchVehicles();
    } catch (err: unknown) {
      setError((err as Error).message || "Deletion failed.");
    }
  };

  // Variant CRUD Handlers
  const fetchVariants = useCallback(async (vehicleId: string) => {
    setLoadingVariants(true);
    setVariantError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/vehicles/${vehicleId}/variants`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load variants");
      setVariants(data.variants);
    } catch (err: unknown) {
      setVariantError((err as Error).message || "Failed to load variants.");
    } finally {
      setLoadingVariants(false);
    }
  }, [apiBaseUrl]);

  const handleOpenVariants = (v: Vehicle) => {
    setSelectedVehicleForVariants(v);
    setEditingVariantId(null);
    setVarFormName("");
    setVarFormPrice(0);
    setVarFormFuel("Petrol");
    setVarFormTrans("Manual");
    setVarFormSeat(5);
    setVarFormStatus("ACTIVE");
    setVariantError("");
    setVariantSuccess("");
    setShowVariantsModal(true);
    fetchVariants(v.id);
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVariantError("");
    setVariantSuccess("");

    if (!selectedVehicleForVariants) return;

    const payload = {
      vehicleId: selectedVehicleForVariants.id,
      name: varFormName,
      price: Number(varFormPrice),
      fuelType: varFormFuel,
      transmission: varFormTrans,
      seating: Number(varFormSeat),
      status: varFormStatus,
    };

    try {
      const url = editingVariantId
        ? `${apiBaseUrl}/api/admin/variants/${editingVariantId}`
        : `${apiBaseUrl}/api/admin/variants`;

      const method = editingVariantId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Operation failed");
      }

      setVariantSuccess(editingVariantId ? "Variant updated!" : "Variant created!");
      setEditingVariantId(null);
      setVarFormName("");
      setVarFormPrice(0);
      setVarFormFuel("Petrol");
      setVarFormTrans("Manual");
      setVarFormSeat(5);
      setVarFormStatus("ACTIVE");
      fetchVariants(selectedVehicleForVariants.id);
    } catch (err: unknown) {
      setVariantError((err as Error).message || "Operation failed.");
    }
  };

  const handleVariantDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
    setVariantError("");
    setVariantSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/variants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Deletion failed");
      }

      setVariantSuccess("Variant deleted successfully!");
      if (selectedVehicleForVariants) {
        fetchVariants(selectedVehicleForVariants.id);
      }
    } catch (err: unknown) {
      setVariantError((err as Error).message || "Deletion failed.");
    }
  };

  const handleStartEditVariant = (v: Variant) => {
    setEditingVariantId(v.id);
    setVarFormName(v.name);
    setVarFormPrice(v.price);
    setVarFormFuel(v.fuelType);
    setVarFormTrans(v.transmission);
    setVarFormSeat(v.seating);
    setVarFormStatus(v.status || "ACTIVE");
  };

  const handleCancelEditVariant = () => {
    setEditingVariantId(null);
    setVarFormName("");
    setVarFormPrice(0);
    setVarFormFuel("Petrol");
    setVarFormTrans("Manual");
    setVarFormSeat(5);
    setVarFormStatus("ACTIVE");
  };

  // Color CRUD Handlers
  const fetchColors = useCallback(async (vehicleId: string) => {
    setLoadingColors(true);
    setColorError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/vehicles/${vehicleId}/colors`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load colors");
      setColors(data.colors);
    } catch (err: unknown) {
      setColorError((err as Error).message || "Failed to load colors.");
    } finally {
      setLoadingColors(false);
    }
  }, [apiBaseUrl]);

  const handleOpenColors = (v: Vehicle) => {
    setSelectedVehicleForColors(v);
    setEditingColorId(null);
    setColFormName("");
    setColFormCode("#1C1C1E");
    setColFormStatus("ACTIVE");
    setColorError("");
    setColorSuccess("");
    setShowColorsModal(true);
    fetchColors(v.id);
  };

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setColorError("");
    setColorSuccess("");

    if (!selectedVehicleForColors) return;

    const payload = {
      vehicleId: selectedVehicleForColors.id,
      name: colFormName,
      colorCode: colFormCode,
      status: colFormStatus,
    };

    try {
      const url = editingColorId
        ? `${apiBaseUrl}/api/admin/colors/${editingColorId}`
        : `${apiBaseUrl}/api/admin/colors`;

      const method = editingColorId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Operation failed");
      }

      setColorSuccess(editingColorId ? "Color updated!" : "Color added!");
      setEditingColorId(null);
      setColFormName("");
      setColFormCode("#1C1C1E");
      setColFormStatus("ACTIVE");
      fetchColors(selectedVehicleForColors.id);
    } catch (err: unknown) {
      setColorError((err as Error).message || "Operation failed.");
    }
  };

  const handleColorDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this color?")) return;
    setColorError("");
    setColorSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/colors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Deletion failed");
      }

      setColorSuccess("Color deleted successfully!");
      if (selectedVehicleForColors) {
        fetchColors(selectedVehicleForColors.id);
      }
    } catch (err: unknown) {
      setColorError((err as Error).message || "Deletion failed.");
    }
  };

  const handleStartEditColor = (c: VehicleColor) => {
    setEditingColorId(c.id);
    setColFormName(c.name);
    setColFormCode(c.colorCode);
    setColFormStatus(c.status || "ACTIVE");
  };

  const handleCancelEditColor = () => {
    setEditingColorId(null);
    setColFormName("");
    setColFormCode("#1C1C1E");
    setColFormStatus("ACTIVE");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Vehicles CMS</h1>
          <p className="text-neutral-400 text-sm">Add, update, or remove fleet inventory items.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-[#eb0a1e] hover:bg-[#c00717] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
        >
          + Add Vehicle
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm text-center">
          {success}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-xl p-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-3 text-neutral-600 hover:text-white">
              🔍
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors"
            >
              <option value="">All Categories</option>
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
            </select>
          </div>
        </form>
      </div>

      {/* Vehicles Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <div className="w-8 h-8 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-4" />
          <span className="text-xs uppercase tracking-wider font-mono">Fetching fleet...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-[#18181b]/15 border border-neutral-800/60 rounded-xl p-12 text-center text-neutral-500 border-dashed">
          <span className="text-3xl mb-3 block">🚗</span>
          <p className="text-sm font-bold text-white mb-1">No Vehicles Configured</p>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">Get started by creating your first Toyota model record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-800/80 rounded-xl bg-[#18181b]/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500 bg-neutral-950/40">
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">SEO Title</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm font-light text-neutral-300">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{v.name}</div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">{v.slug}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-neutral-800 text-neutral-300">
                      {v.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${
                        v.status === "ACTIVE"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                          : "bg-neutral-800/40 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={v.seoTitle || ""}>
                    {v.seoTitle || <span className="text-neutral-700 italic">None</span>}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenColors(v)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors"
                    >
                      Colors
                    </button>
                    <button
                      onClick={() => handleOpenVariants(v)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors"
                    >
                      Variants
                    </button>
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1.5 bg-red-950/45 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-neutral-800 w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-6">
              {editingId ? "Edit Vehicle Config" : "Add Vehicle Model"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortuner"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                  >
                    <option value="SUV">SUV</option>
                    <option value="MPV">MPV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://cloudinary.com/..."
                  value={formHeroImage}
                  onChange={(e) => setFormHeroImage(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Details of vehicle specifications and performance..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div className="border-t border-neutral-800 pt-6">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e] mb-4">
                  SEO Configuration
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Book Toyota Fortuner Online | Laxmi Toyota"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      placeholder="e.g. Secure your SUV online with deposit payment."
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-neutral-800 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Variants CMS Modal */}
      {showVariantsModal && selectedVehicleForVariants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-neutral-800 w-full max-w-4xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Manage Variants
                </h2>
                <p className="text-xs text-[#eb0a1e] font-mono mt-1">
                  Model: {selectedVehicleForVariants.name}
                </p>
              </div>
              <button
                onClick={() => setShowVariantsModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-sm uppercase tracking-wider px-3 py-1.5 border border-neutral-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {variantError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 text-xs text-center">
                {variantError}
              </div>
            )}

            {variantSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs text-center">
                {variantSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Variant creation / edit form */}
              <form onSubmit={handleVariantSubmit} className="lg:col-span-4 space-y-4 bg-neutral-950/40 border border-neutral-800/80 p-5 rounded-xl">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 border-b border-neutral-900 pb-2 mb-3">
                  {editingVariantId ? "Edit Variant Details" : "Add New Variant"}
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E MT or 2.8L 4x4 AT"
                    value={varFormName}
                    onChange={(e) => setVarFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Ex-Showroom Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1114000"
                    value={varFormPrice || ""}
                    onChange={(e) => setVarFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={varFormFuel}
                      onChange={(e) => setVarFormFuel(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Transmission
                    </label>
                    <select
                      value={varFormTrans}
                      onChange={(e) => setVarFormTrans(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Seats
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5"
                      value={varFormSeat || ""}
                      onChange={(e) => setVarFormSeat(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Status
                    </label>
                    <select
                      value={varFormStatus}
                      onChange={(e) => setVarFormStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  {editingVariantId && (
                    <button
                      type="button"
                      onClick={handleCancelEditVariant}
                      className="flex-1 py-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded text-xs font-bold uppercase transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-white hover:bg-neutral-200 text-black rounded text-xs font-bold uppercase transition-colors"
                  >
                    {editingVariantId ? "Update" : "Add Variant"}
                  </button>
                </div>
              </form>

              {/* Variants List Section */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
                  Existing Variants list
                </h3>

                {loadingVariants ? (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                    <div className="w-5 h-5 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-3" />
                    <span className="text-[10px] uppercase font-mono">Fetching variants...</span>
                  </div>
                ) : variants.length === 0 ? (
                  <div className="p-8 border border-neutral-800/60 rounded-xl text-center text-neutral-500 border-dashed">
                    <p className="text-xs font-bold text-white mb-1">No Variants Configured</p>
                    <p className="text-[10px] text-neutral-500">Add variants to make them selectables during booking.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-800/60 rounded-xl bg-neutral-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 font-bold uppercase tracking-wider text-neutral-500 bg-neutral-950/40">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Specs</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850 text-neutral-300 font-light">
                        {variants.map((v) => (
                          <tr key={v.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="py-3 px-4 font-bold text-white">{v.name}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-neutral-850 text-[9px] uppercase font-mono text-neutral-400">
                                  {v.fuelType}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-neutral-850 text-[9px] uppercase font-mono text-neutral-400">
                                  {v.transmission}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-neutral-850 text-[9px] uppercase font-mono text-neutral-400">
                                  {v.seating} Str
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-white">
                              ₹{v.price.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                  v.status === "ACTIVE"
                                    ? "bg-emerald-950/40 text-emerald-400"
                                    : "bg-neutral-800/40 text-neutral-400"
                                }`}
                              >
                                {v.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleStartEditVariant(v)}
                                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded text-[10px] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleVariantDelete(v.id)}
                                className="px-2 py-1 bg-red-950/45 hover:bg-red-900/40 text-red-400 font-semibold rounded text-[10px] transition-colors"
                              >
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
            </div>
          </div>
        </div>
      )}
      {/* Colors CMS Modal */}
      {showColorsModal && selectedVehicleForColors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-neutral-800 w-full max-w-4xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">Manage Colors</h2>
                <p className="text-xs text-[#eb0a1e] font-mono mt-1">
                  Model: {selectedVehicleForColors.name}
                </p>
              </div>
              <button
                onClick={() => setShowColorsModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-sm uppercase tracking-wider px-3 py-1.5 border border-neutral-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {colorError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 text-xs text-center">
                {colorError}
              </div>
            )}

            {colorSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs text-center">
                {colorSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Color creation / edit form */}
              <form onSubmit={handleColorSubmit} className="lg:col-span-4 space-y-4 bg-neutral-950/40 border border-neutral-800/80 p-5 rounded-xl">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 border-b border-neutral-900 pb-2 mb-3">
                  {editingColorId ? "Edit Color" : "Add New Color"}
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attitude Black"
                    value={colFormName}
                    onChange={(e) => setColFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Hex Color Code
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <input
                        type="color"
                        value={colFormCode}
                        onChange={(e) => setColFormCode(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-neutral-700 bg-transparent p-0.5"
                        title="Pick color"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="#1C1C1E"
                      value={colFormCode}
                      onChange={(e) => setColFormCode(e.target.value)}
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                      title="Valid hex color e.g. #1C1C1E"
                      className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  {/* Live swatch preview */}
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-neutral-700 flex-shrink-0"
                      style={{ background: colFormCode }}
                    />
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Preview: {colFormName || "(no name)"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Status
                  </label>
                  <select
                    value={colFormStatus}
                    onChange={(e) => setColFormStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  {editingColorId && (
                    <button
                      type="button"
                      onClick={handleCancelEditColor}
                      className="flex-1 py-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded text-xs font-bold uppercase transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-white hover:bg-neutral-200 text-black rounded text-xs font-bold uppercase transition-colors"
                  >
                    {editingColorId ? "Update" : "Add Color"}
                  </button>
                </div>
              </form>

              {/* Colors List */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
                  Available Colors
                </h3>

                {loadingColors ? (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                    <div className="w-5 h-5 border-2 border-dashed border-[#eb0a1e] rounded-full animate-spin mb-3" />
                    <span className="text-[10px] uppercase font-mono">Fetching colors...</span>
                  </div>
                ) : colors.length === 0 ? (
                  <div className="p-8 border border-neutral-800/60 rounded-xl text-center text-neutral-500 border-dashed">
                    <p className="text-xs font-bold text-white mb-1">No Colors Configured</p>
                    <p className="text-[10px] text-neutral-500">Add color swatches for this vehicle model.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 p-3 bg-neutral-950/30 border border-neutral-800/60 rounded-xl hover:border-neutral-700 transition-all"
                      >
                        {/* Color Swatch */}
                        <div
                          className="w-10 h-10 rounded-full border-2 border-neutral-700 flex-shrink-0 shadow-lg"
                          style={{ background: c.colorCode }}
                          title={c.colorCode}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[9px] font-mono text-neutral-500 uppercase">{c.colorCode}</p>
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-950/40 text-emerald-400"
                                : "bg-neutral-800/40 text-neutral-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleStartEditColor(c)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded text-[10px] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleColorDelete(c.id)}
                            className="px-2 py-1 bg-red-950/45 hover:bg-red-900/40 text-red-400 font-semibold rounded text-[10px] transition-colors"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
