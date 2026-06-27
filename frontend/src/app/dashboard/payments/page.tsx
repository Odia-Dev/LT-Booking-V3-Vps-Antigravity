"use client";

import React, { useState, useEffect } from "react";

interface Payment {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  booking?: {
    bookingId: string;
  };
}

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/payments`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load payments");
        }

        setPayments(data.data || []);
      } catch (err: unknown) {
        console.error("Fetch payments error:", err);
        const msg = err instanceof Error ? err.message : "An error occurred while loading your payments.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/40 border border-neutral-850 rounded animate-pulse"></div>
        <div className="h-64 bg-neutral-900/40 border border-neutral-850 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Transaction History</h1>
        <p className="text-sm text-neutral-400">Review receipts and gateway transaction logs for online bookings.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="border border-neutral-850 rounded-2xl p-12 text-center bg-neutral-900/10">
          <p className="text-neutral-500">No payment transaction records found.</p>
        </div>
      ) : (
        <div className="bg-neutral-900/20 border border-neutral-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-850 bg-neutral-900/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Order Ref (Razorpay)</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4 text-right">Amount Paid</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <p className="text-white">{payment.razorpayOrderId}</p>
                      {payment.razorpayPaymentId && (
                        <p className="text-[10px] text-neutral-500 mt-0.5">PayID: {payment.razorpayPaymentId}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      {payment.booking?.bookingId || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white whitespace-nowrap">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: payment.currency || "INR",
                        maximumFractionDigits: 2,
                      }).format(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block ${
                        payment.status === "SUCCESS"
                          ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                          : payment.status === "FAILED"
                          ? "bg-red-950/80 border border-red-900 text-red-400"
                          : "bg-amber-950/80 border border-amber-900 text-amber-400"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
