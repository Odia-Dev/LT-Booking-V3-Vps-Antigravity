"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Vehicle {
  name: string;
  type: string;
  tagline: string;
  price: string;
  fuel: string;
  transmission: string;
  imageColor: string;
  colors: { name: string; hex: string }[];
  specs: string[];
}

interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
}

export default function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  const [selectedVehicleColors, setSelectedVehicleColors] = useState<Record<string, string>>(
    vehicles.reduce((acc, v) => ({ ...acc, [v.name]: v.colors[0].name }), {})
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.name}
          className="group relative rounded-xl border border-[#27272a]/60 bg-[#18181b]/30 p-8 flex flex-col justify-between hover:border-[#eb0a1e]/40 transition-all hover:shadow-2xl"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#eb0a1e]">
                  {vehicle.type}
                </span>
                <h3 className="text-2xl font-bold mt-1 text-white">{vehicle.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#a1a1aa]">Starting at</span>
                <p className="text-lg font-extrabold text-white">{vehicle.price}</p>
              </div>
            </div>

            <p className="text-[#a1a1aa] text-sm font-light mb-6">{vehicle.tagline}</p>

            {/* Mock Vehicle Swatch Preview Frame */}
            <div
              className={`w-full h-44 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 mb-6 transition-all ${
                vehicle.imageColor
              }`}
            >
              <span className="text-xs text-[#a1a1aa] tracking-widest font-mono">
                COLOR SWATCH: {selectedVehicleColors[vehicle.name]?.toUpperCase()}
              </span>
              <div
                className="w-24 h-3 rounded-full shadow-inner"
                style={{
                  backgroundColor:
                    vehicle.colors.find((c) => c.name === selectedVehicleColors[vehicle.name])?.hex || "#fff",
                }}
              />
            </div>

            {/* Specs List */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-8 text-xs text-[#a1a1aa]">
              {vehicle.specs.map((spec) => (
                <div key={spec} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eb0a1e]" />
                  {spec}
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Swatch Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#27272a]/40 mb-6">
              <span className="text-xs text-[#71717a] font-medium">Select Swatch</span>
              <div className="flex gap-2.5">
                {vehicle.colors.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() =>
                      setSelectedVehicleColors((prev) => ({ ...prev, [vehicle.name]: color.name }))
                    }
                    className={`w-6 h-6 rounded-full border transition-all ${
                      selectedVehicleColors[vehicle.name] === color.name
                        ? "border-white scale-110"
                        : "border-[#27272a] hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Card CTA Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                className="text-center text-xs font-bold uppercase tracking-wider bg-white text-black py-3 rounded hover:bg-neutral-200 transition-colors"
              >
                Configure
              </Link>
              <Link
                href="/login"
                className="text-center text-xs font-bold uppercase tracking-wider border border-[#27272a] text-white py-3 rounded hover:bg-[#27272a]/40 transition-colors"
              >
                Test Drive
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
