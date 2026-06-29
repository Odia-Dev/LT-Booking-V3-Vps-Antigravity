import React, { useState } from "react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ label, value, onChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${apiBaseUrl}/api/admin/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      // data.url is the relative URL returned by the backend
      onChange(data.url);
    } catch (err: unknown) {
      setError((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative w-full h-32 bg-neutral-900 border border-neutral-700 rounded overflow-hidden flex items-center justify-center">
            <img src={value.startsWith("http") ? value : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${value}`} alt="Uploaded" className="max-w-full max-h-full object-contain" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-rose-500/80 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-bold shadow"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer w-full"
            />
          </div>
        )}
        {uploading && <p className="text-xs text-neutral-500 animate-pulse">Uploading...</p>}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    </div>
  );
}
