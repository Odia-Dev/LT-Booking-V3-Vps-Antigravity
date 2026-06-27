"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface TestDrive {
  id: string;
  testDriveId: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  notes?: string;
  assignedExecutive?: string;
  vehicle: {
    name: string;
  };
  variant: {
    name: string;
  };
  branch: {
    name: string;
    city: string;
  };
}

export default function CustomerTestDrivesPage() {
  const [appointments, setAppointments] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchTestDrives = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/test-drives`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load test drives");
        }

        setAppointments(data.appointments || []);
      } catch (err: unknown) {
        console.error("Fetch test drives error:", err);
        const msg = err instanceof Error ? err.message : "An error occurred while loading your appointments.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDrives();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Test Drive Appointments</h1>
        <p className="text-sm text-neutral-400">View status details for upcoming and completed dealer test experiences.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500 mb-6">No test drive appointments scheduled.</p>
          <Link
            href="/test-drive"
            className="px-6 py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-250 transition-colors inline-block text-sm"
          >
            Book a Test Drive
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-neutral-900/20 border border-neutral-850 rounded-2xl p-6 shadow-xl hover:border-neutral-700/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-850 pb-4 mb-4">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-1">Appointment Ref</span>
                  <span className="text-base font-bold text-white font-mono">{appointment.testDriveId}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  appointment.status === "CONFIRMED" || appointment.status === "COMPLETED" || appointment.status === "BOOKED"
                    ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                    : appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
                    ? "bg-red-950/80 border border-red-900 text-red-400"
                    : "bg-amber-950/80 border border-amber-900 text-amber-400"
                }`}>
                  Status: {appointment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Vehicle Selection</p>
                  <p className="text-white font-bold text-lg">{appointment.vehicle?.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Variant: {appointment.variant?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Schedule Date & Time</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(appointment.preferredDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">Time: {appointment.preferredTime}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Dealership Location</p>
                  <p className="text-white font-semibold">{appointment.branch?.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{appointment.branch?.city}</p>
                </div>
              </div>

              {(appointment.notes || appointment.assignedExecutive) && (
                <div className="mt-6 pt-4 border-t border-neutral-850/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
                  {appointment.assignedExecutive && (
                    <div>
                      <span className="font-semibold text-neutral-500 mr-2 uppercase tracking-wide">Assigned Advisor:</span>
                      <span>{appointment.assignedExecutive}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <div>
                      <span className="font-semibold text-neutral-500 mr-2 uppercase tracking-wide">Customer Notes:</span>
                      <span>{appointment.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
