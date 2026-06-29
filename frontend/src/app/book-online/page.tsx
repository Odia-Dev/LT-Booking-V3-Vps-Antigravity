"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  startingPrice?: number;
  bookingAmount?: number;
}

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Color {
  id: string;
  name: string;
  hexCode?: string;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

function BookOnlineContent() {
  const searchParams = useSearchParams();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // URL Presets
  const presetVehicleSlug = searchParams.get("vehicle") || "";
  const presetBranchId = searchParams.get("branch") || "";

  // Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(presetBranchId);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [financeRequired, setFinanceRequired] = useState(false);
  const [exchangeRequired, setExchangeRequired] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ id: string; bookingId: string; bookingAmount: number } | null>(null);
  const [error, setError] = useState("");

  // Payment Flow States: NONE, SUCCESS, FAILED, CANCELLED, VERIFYING
  const [paymentStatus, setPaymentStatus] = useState<"NONE" | "SUCCESS" | "FAILED" | "CANCELLED" | "VERIFYING">("NONE");
  const [paymentError, setPaymentError] = useState("");

  // UTM Metadata
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [referrer, setReferrer] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch branches and vehicles
  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, branchesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/public/vehicles`),
          fetch(`${apiBaseUrl}/api/public/branches`),
        ]);

        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          const vehiclesList = data.vehicles || [];
          setVehicles(vehiclesList);

          // Apply preset vehicle if slug matches
          if (presetVehicleSlug) {
            const found = vehiclesList.find((v: Vehicle) => v.slug === presetVehicleSlug);
            if (found) {
              setSelectedVehicle(found.id);
            }
          }
        }
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    fetchData();
  }, [apiBaseUrl, presetVehicleSlug]);

  // Fetch variants and colors when vehicle changes
  useEffect(() => {
    if (!selectedVehicle) {
      setVariants([]);
      setColors([]);
      setSelectedVariant("");
      setSelectedColor("");
      return;
    }

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (!vehicle) return;

    const vehicleSlug = vehicle.slug;
    const vehicleId = vehicle.id;

    async function fetchOptions() {
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/public/vehicles/${vehicleSlug}/variants`),
          fetch(`${apiBaseUrl}/api/vehicles/${vehicleId}/colors`),
        ]);

        if (variantsRes.ok) {
          const data = await variantsRes.json();
          setVariants(data.variants || []);
        }
        if (colorsRes.ok) {
          const data = await colorsRes.json();
          setColors(data.colors || []);
        }
      } catch (err) {
        console.error("Failed to load variants and colors", err);
      }
    }

    fetchOptions();
  }, [selectedVehicle, vehicles, apiBaseUrl]);

  // Capture UTM parameters & Referrer info
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtmSource(params.get("utm_source") || sessionStorage.getItem("utm_source") || "");
      setUtmMedium(params.get("utm_medium") || sessionStorage.getItem("utm_medium") || "");
      setUtmCampaign(params.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "");
      setReferrer(document.referrer || "");
      setLandingPageUrl(window.location.href);
    }
  }, []);

  // Determine current booking amount
  const getBookingAmount = () => {
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    return vehicle?.bookingAmount || 25000; // default booking amount
  };

  const launchRazorpayCheckout = (
    orderData: { key_id: string; amount: number; currency: string; razorpay_order_id: string },
    newBookingId: string,
    newBookingRefId: string,
    amount: number
  ) => {
    // Make use of amount variable to satisfy unused-vars check
    console.log(`Launching checkout session for amount: ₹${amount}`);
    
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Laxmi Toyota",
      description: `Reservation Payment for Booking ${newBookingRefId}`,
      image: "https://laxmitoyota.co.in/logo.png",
      order_id: orderData.razorpay_order_id,
      handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
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
          } else {
            setPaymentStatus("FAILED");
            setPaymentError(verifyData.message || "Payment signature verification failed.");
          }
        } catch {
          setPaymentStatus("FAILED");
          setPaymentError("Unable to reach transaction verification server.");
        }
      },
      prefill: {
        name,
        email,
        contact: phone,
      },
      notes: {
        bookingId: newBookingId,
        bookingRefId: newBookingRefId,
      },
      theme: {
        color: "#eb0a1e", // Toyota Brand Red
      },
      modal: {
        ondismiss: function () {
          setPaymentStatus("CANCELLED");
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(options);
    
    rzp.on("payment.failed", function (response: { error: { description: string } }) {
      setPaymentStatus("FAILED");
      setPaymentError(response.error.description || "Razorpay transaction failed.");
    });

    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPaymentError("");
    setPaymentStatus("NONE");

    if (!consent) {
      setError("Please check the consent box to proceed with the booking.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Booking
      const payload = {
        name,
        email,
        phone,
        city,
        state,
        vehicleId: selectedVehicle,
        variantId: selectedVariant,
        colorPreference: selectedColor || undefined,
        branchId: selectedBranch,
        bookingAmount: getBookingAmount(),
        notes: message || undefined,
        campaign: utmCampaign || undefined,
        medium: utmMedium || undefined,
        source: utmSource || undefined,
        referrer: referrer || undefined,
        landingPageUrl: landingPageUrl || undefined,
        createAccount,
        financeRequired,
        exchangeRequired,
      };

      const res = await fetch(`${apiBaseUrl}/api/public/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate online booking. Please try again.");
      }

      setSuccessDetails(data.booking);
      setSuccess(true);

      // Step 2: Create Razorpay Order
      const orderRes = await fetch(`${apiBaseUrl}/api/public/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: data.booking.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to initialize payment gateway order.");
      }

      // Step 3: Launch Razorpay Checkout
      launchRazorpayCheckout(orderData, data.booking.id, data.booking.bookingId, data.booking.bookingAmount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!successDetails) return;
    setLoading(true);
    setPaymentError("");
    setPaymentStatus("NONE");

    try {
      const orderRes = await fetch(`${apiBaseUrl}/api/public/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: successDetails.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to initialize payment gateway order.");
      }

      launchRazorpayCheckout(orderData, successDetails.id, successDetails.bookingId, successDetails.bookingAmount);
    } catch (err: unknown) {
      setPaymentStatus("FAILED");
      setPaymentError(err instanceof Error ? err.message : "Error initiating transaction.");
    } finally {
      setLoading(false);
    }
  };

  // If a booking was successfully initiated, show status-specific views
  if (success && successDetails) {
    // 1. Verifying Payment state
    if (paymentStatus === "VERIFYING") {
      return (
        <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[450px] space-y-6">
          <div className="w-12 h-12 border-4 border-t-[#eb0a1e] border-neutral-800 rounded-full animate-spin"></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Verifying Secure Payment</h2>
            <p className="text-xs text-neutral-400 font-mono mt-1.5 font-light">
              Booking Ref ID: {successDetails.bookingId}
            </p>
          </div>
          <p className="text-neutral-400 text-sm max-w-sm font-light">
            We are confirming your transaction status with the payment gateway. Please do not close the browser or click back.
          </p>
        </div>
      );
    }

    // 2. Success state
    if (paymentStatus === "SUCCESS") {
      return (
        <div className="bg-[#18181b]/35 border border-green-700/50 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[450px] space-y-6 animate-fadeIn">
          <span className="text-5xl bg-green-950/50 p-4 rounded-full text-green-500 border border-green-900/40">✓</span>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Booking Confirmed!</h2>
            <p className="text-xs text-neutral-400 font-mono mt-1.5">Booking Ref ID: {successDetails.bookingId}</p>
          </div>

          <div className="bg-[#09090b]/80 border border-neutral-800 rounded-xl p-6 w-full max-w-md text-left space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-green-500 flex justify-between">
              <span>Booking Summary</span>
              <span>Status: SUCCESS</span>
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Vehicle:</span>
              <span className="text-white font-semibold">
                {vehicles.find((v) => v.id === selectedVehicle)?.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Variant:</span>
              <span className="text-white font-semibold">
                {variants.find((v) => v.id === selectedVariant)?.name}
              </span>
            </div>
            {selectedColor && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Color Preference:</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-neutral-700"
                    style={{ backgroundColor: colors.find((c) => c.name === selectedColor)?.hexCode || "#fff" }}
                  ></div>
                  {selectedColor}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Dealership Branch:</span>
              <span className="text-white font-semibold">
                {branches.find((b) => b.id === selectedBranch)?.name}
              </span>
            </div>
            <div className="h-px bg-neutral-800 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Paid Amount:</span>
              <span className="text-lg font-black text-green-400">₹{successDetails.bookingAmount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-neutral-300 text-sm max-w-md leading-relaxed font-light">
            Your transaction was processed successfully. A booking confirmation alert has been sent to your registered contact coordinates. A sales specialist will reach out shortly to guide you through registration.
          </p>

          <div>
            <Link
              href="/"
              className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    // 3. Failed or Cancelled states
    if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      const isFailed = paymentStatus === "FAILED";
      return (
        <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[450px] space-y-6">
          <span className={`text-5xl p-4 rounded-full border ${
            isFailed 
              ? "bg-red-950/40 text-red-500 border-red-900/30" 
              : "bg-yellow-950/40 text-yellow-500 border-yellow-900/30"
          }`}>
            {isFailed ? "⚠️" : "✕"}
          </span>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Payment {isFailed ? "Failed" : "Cancelled"}
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1.5">Booking Ref ID: {successDetails.bookingId}</p>
          </div>

          <div className="bg-[#09090b]/80 border border-neutral-800 rounded-xl p-6 w-full max-w-md text-left space-y-4">
            <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider">
              <span className="text-neutral-400">Transaction Status:</span>
              <span className={isFailed ? "text-red-500" : "text-yellow-500"}>
                {paymentStatus}
              </span>
            </div>
            {isFailed && paymentError && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-lg font-mono">
                {paymentError}
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Amount Due:</span>
              <span className="text-white font-semibold">₹{successDetails.bookingAmount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-neutral-300 text-sm max-w-md leading-relaxed font-light">
            Your booking is saved in the system, but the payment gateway transaction was {isFailed ? "declined" : "cancelled"}. You can retry processing the payment now.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleRetryPayment}
              disabled={loading}
              className="px-6 py-3 bg-[#eb0a1e] hover:bg-[#c90817] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "Initializing..." : "Retry Payment"}
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    // Default "Order Created / Launching Payment Gateway" loading screen
    return (
      <div className="bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-8 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[450px] space-y-6">
        <div className="w-12 h-12 border-4 border-t-[#eb0a1e] border-neutral-800 rounded-full animate-spin"></div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Initiating Payment Gateway</h2>
          <p className="text-xs text-neutral-400 font-mono mt-1.5 font-light">
            Booking Ref ID: {successDetails.bookingId}
          </p>
        </div>
        <p className="text-neutral-400 text-sm max-w-sm font-light">
          Launching Razorpay secure checkout. If the popup does not open automatically, please click below.
        </p>
        <button
          onClick={handleRetryPayment}
          disabled={loading}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          Open Checkout Manual
        </button>
      </div>
    );
  }

  // Original Form View
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-[#18181b]/35 border border-neutral-800/80 rounded-2xl p-6 md:p-8">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
          Toyota Online Store
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">Book Your Toyota Online</h1>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
          Complete the form below to initiate your vehicle reservation. Our team will coordinate delivery and options.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Model Selection */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">1. Select Vehicle & Variant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Model</label>
              <div className="relative">
                <select
                  required
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
                >
                  <option value="" className="bg-[#18181b]">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#18181b]">
                      {v.name} (Booking: ₹{(v.bookingAmount || 25000).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Variant</label>
              <div className="relative">
                <select
                  required
                  value={selectedVariant}
                  disabled={!selectedVehicle}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 disabled:opacity-40 appearance-none"
                >
                  <option value="" className="bg-[#18181b]">Select Variant</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#18181b]">
                      {v.name} (Ex-Showroom: ₹{v.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Color Preference (Optional)</label>
              <div className="relative">
                <select
                  value={selectedColor}
                  disabled={!selectedVehicle || colors.length === 0}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 disabled:opacity-40 appearance-none"
                >
                  <option value="" className="bg-[#18181b]">{colors.length === 0 ? "No colors available" : "Select Color Preference"}</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.name} className="bg-[#18181b]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Showroom Location */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">2. Select Showroom Location</h3>
          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Branch</label>
            <div className="relative">
              <select
                required
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 appearance-none"
              >
                <option value="" className="bg-[#18181b]">Select Branch Showroom</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#18181b]">
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Customer Information */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">3. Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">Additional Message (Optional)</label>
            <textarea
              rows={3}
              placeholder="Any specific delivery preferences or options request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b]/60 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 resize-none"
            />
          </div>
        </div>

        {/* Step 4: Summary & Consent */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">4. Booking Summary & Consent</h3>
          
          <div className="bg-[#09090b]/40 border border-neutral-800/80 rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Standard Reservation Amount</span>
              <span className="text-white font-mono">₹{getBookingAmount().toLocaleString()}</span>
            </div>
            <div className="h-px bg-neutral-800 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">Total Booking Amount:</span>
              <span className="text-xl font-black text-[#eb0a1e]">₹{getBookingAmount().toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-normal font-light">
              *The booking amount is fully adjustable against the final ex-showroom price of the vehicle at the time of final invoice. Terms and conditions apply.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <input
                id="financeRequired"
                type="checkbox"
                checked={financeRequired}
                onChange={(e) => setFinanceRequired(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-800 bg-[#09090b]/60 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="financeRequired" className="text-xs text-neutral-300 leading-relaxed font-light">
                I am interested in vehicle finance options
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="exchangeRequired"
                type="checkbox"
                checked={exchangeRequired}
                onChange={(e) => setExchangeRequired(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-800 bg-[#09090b]/60 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="exchangeRequired" className="text-xs text-neutral-300 leading-relaxed font-light">
                I want to exchange my old vehicle
              </label>
            </div>
          </div>

          <div className="bg-[#18181b] border border-neutral-800/80 rounded-xl p-6 mt-4">
            <div className="flex items-start gap-3">
              <input
                id="createAccount"
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-800 bg-[#09090b]/60 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="createAccount" className="text-xs text-neutral-200 leading-relaxed font-semibold">
                Create an account to track booking status and delivery progress
                <p className="font-light text-neutral-500 mt-1">If unchecked, you will complete this booking as a guest. You will still receive booking updates via email.</p>
              </label>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-800 bg-[#09090b]/60 text-[#eb0a1e] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="consent" className="text-xs text-neutral-300 leading-relaxed font-light">
                I hereby declare that the information provided is correct. I authorize Laxmi Toyota to contact me via Call, SMS, WhatsApp, and Email. I accept the{" "}
                <span className="text-[#eb0a1e] hover:underline cursor-pointer">Terms & Conditions</span>.
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#eb0a1e] hover:bg-[#c90817] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Processing Booking..." : "Submit & Pay Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookOnlinePage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-8 bg-black">
      <Suspense fallback={<div className="text-white text-center py-10">Loading reservation portal...</div>}>
        <BookOnlineContent />
      </Suspense>
    </main>
  );
}
