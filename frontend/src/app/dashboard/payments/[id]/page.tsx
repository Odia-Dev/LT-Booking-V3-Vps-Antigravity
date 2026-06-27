"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface PaymentAudit {
  id: string;
  statusBefore: string;
  statusAfter: string;
  notes?: string;
  createdAt: string;
}

interface Payment {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  createdAt: string;
  bookingId: string;
  booking?: {
    id: string;
    bookingId: string;
    bookingStatus: string;
    vehicle?: {
      name: string;
    };
    variant?: {
      name: string;
    };
  };
  audits?: PaymentAudit[];
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    bookingId: string;
    bookingRefId: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
  open: () => void;
}

interface CustomWindow extends Window {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"NONE" | "VERIFYING" | "SUCCESS" | "FAILED" | "CANCELLED">("NONE");
  const [paymentError, setPaymentError] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchPaymentDetails = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/dashboard/payments/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (res.status === 403 || res.status === 404) {
          setError(data.message || "Payment transaction record not found.");
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to load transaction details");
        }

        setPayment(data.data);
      } catch (err: unknown) {
        console.error("Fetch payment details error:", err);
        const msg = err instanceof Error ? err.message : "Could not load transaction receipt.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id, apiBaseUrl, router]);

  const launchRazorpayCheckout = (
    orderData: { key_id: string; amount: number; currency: string; razorpay_order_id: string },
    bookingId: string,
    bookingRefId: string,
    amount: number
  ) => {
    console.log(`Retrying checkout for amount: ₹${amount}`);
    setPaymentStatus("NONE");
    setPaymentError("");

    const options: RazorpayOptions = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Laxmi Toyota",
      description: `Payment Retry for Booking ${bookingRefId}`,
      image: "https://laxmitoyota.co.in/logo.png",
      order_id: orderData.razorpay_order_id,
      handler: async function (response: RazorpayResponse) {
        setPaymentStatus("VERIFYING");
        try {
          const verifyRes = await fetch(`${apiBaseUrl}/api/public/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setPaymentStatus("SUCCESS");
            setSuccess("Payment retried and verified successfully!");
            
            // Re-fetch details locally
            const res = await fetch(`${apiBaseUrl}/api/dashboard/payments/${id}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (res.ok) {
              const fresh = await res.json();
              setPayment(fresh.data);
            }
          } else {
            setPaymentStatus("FAILED");
            setPaymentError(verifyData.message || "Payment verification failed.");
          }
        } catch {
          setPaymentStatus("FAILED");
          setPaymentError("Unable to verify payment signature on the server.");
        }
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      notes: {
        bookingId: bookingId,
        bookingRefId: bookingRefId,
      },
      theme: {
        color: "#eb0a1e",
      },
      modal: {
        ondismiss: function () {
          setPaymentStatus("CANCELLED");
        },
      },
    };

    const customWindow = window as unknown as CustomWindow;
    if (!customWindow.Razorpay) {
      setPaymentStatus("FAILED");
      setPaymentError("Razorpay SDK not loaded yet. Please try again.");
      return;
    }

    const rzp = new customWindow.Razorpay(options);
    rzp.on("payment.failed", function (response: { error: { description: string } }) {
      setPaymentStatus("FAILED");
      setPaymentError(response.error.description || "Razorpay transaction failed.");
    });

    rzp.open();
  };

  const handleRetryPayment = async () => {
    if (!payment) return;
    setLoading(true);
    setPaymentError("");
    setSuccess("");

    try {
      const orderRes = await fetch(`${apiBaseUrl}/api/public/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: payment.bookingId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to initialize payment gateway order.");
      }

      launchRazorpayCheckout(
        orderData,
        payment.bookingId,
        payment.booking?.bookingId || "",
        payment.amount
      );
    } catch (err: unknown) {
      setPaymentStatus("FAILED");
      setPaymentError(err instanceof Error ? err.message : "Error initiating transaction.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-neutral-900/40 border border-neutral-850 rounded"></div>
        <div className="h-96 bg-neutral-900/40 border border-neutral-850 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Link href="/dashboard/payments" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
          ← Back to Payments
        </Link>
        <div className="p-8 rounded-2xl bg-neutral-900/20 border border-neutral-850 text-center">
          <p className="text-red-400 font-medium mb-4">{error || "Payment detail record not found."}</p>
          <Link href="/dashboard/payments" className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs transition-colors">
            Return to Transaction History
          </Link>
        </div>
      </div>
    );
  }

  const isFailed = payment.status === "FAILED";
  const isSuccess = payment.status === "SUCCESS";
  const isRefunded = payment.status === "REFUNDED" || payment.audits?.some(a => a.statusAfter === "REFUNDED");
  const canRetry = !isSuccess && !isRefunded && paymentStatus !== "VERIFYING";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back link */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/payments" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
          ← Back to Payments
        </Link>
        <span className="text-xs text-neutral-500 font-mono">Receipt Ref ID: {payment.id}</span>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm text-center">
          {success}
        </div>
      )}

      {paymentError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm text-center">
          {paymentError}
        </div>
      )}

      {paymentStatus === "VERIFYING" && (
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-neutral-300 text-sm text-center animate-pulse">
          🔄 Verifying secure transaction signature... Please do not refresh.
        </div>
      )}

      {/* Invoice Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invoice Summary */}
        <div className="lg:col-span-2 bg-neutral-900/25 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-neutral-850 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono text-[#eb0a1e] uppercase tracking-widest block mb-1">Razorpay Order ID</span>
              <h1 className="text-xl font-bold text-white font-mono">{payment.razorpayOrderId}</h1>
              {payment.razorpayPaymentId && (
                <p className="text-xs text-neutral-400 mt-1 font-mono">Payment ID: {payment.razorpayPaymentId}</p>
              )}
            </div>
            <div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                isSuccess
                  ? "bg-emerald-950/80 border border-emerald-900 text-emerald-400"
                  : isRefunded
                  ? "bg-blue-950/80 border border-blue-900 text-blue-400"
                  : isFailed
                  ? "bg-red-950/80 border border-red-900 text-red-400"
                  : "bg-amber-950/80 border border-amber-900 text-amber-400"
              }`}>
                {payment.status}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block">Booking Reference</span>
              {payment.booking ? (
                <Link href={`/dashboard/bookings/${payment.bookingId}`} className="text-white font-mono hover:text-[#eb0a1e] font-bold mt-1 block">
                  {payment.booking.bookingId} →
                </Link>
              ) : (
                <span className="text-white font-mono mt-1 block">N/A</span>
              )}
            </div>
            <div>
              <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block">Transaction Time</span>
              <span className="text-white mt-1 block">
                {new Date(payment.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block">Vehicle Model</span>
              <span className="text-white font-bold mt-1 block">
                {payment.booking?.vehicle?.name || "N/A"}
              </span>
              <span className="text-xs text-neutral-400">{payment.booking?.variant?.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block">Deposit Value</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: payment.currency || "INR",
                }).format(payment.amount)}
              </span>
            </div>
          </div>

          {/* Retry Button Option */}
          {canRetry && (
            <div className="pt-6 border-t border-neutral-850 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className="text-xs text-neutral-400 text-center sm:text-left">
                This transaction is pending. You can retry paying the deposit value to secure your booking.
              </p>
              <button
                onClick={handleRetryPayment}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-250 transition-colors text-xs tracking-wider uppercase"
              >
                Retry Payment
              </button>
            </div>
          )}
        </div>

        {/* Audit Log / Refunds history */}
        <div className="bg-neutral-900/15 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-4">
            Audit Trail & Refund Status
          </h2>
          {payment.audits && payment.audits.length > 0 ? (
            <div className="space-y-4">
              {payment.audits.map((audit) => (
                <div key={audit.id} className="border-l-2 border-neutral-800 pl-4 py-1 text-xs">
                  <div className="flex justify-between items-center text-neutral-500 font-mono text-[10px] mb-1">
                    <span>{new Date(audit.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    <span>{audit.statusBefore} → {audit.statusAfter}</span>
                  </div>
                  <p className="text-neutral-350">{audit.notes || "Status changed."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 text-center py-6">
              No audit logs or refund requests registered.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
