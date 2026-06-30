"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Google Login Integration
  useEffect(() => {
    // Add Google script dynamic loading
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Callback handler for Google sign-in
    (window as any).handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const res = await fetch(`${apiBaseUrl}/api/customer/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Google signup failed");

        // Save token to localStorage & cookie
        localStorage.setItem("customerToken", data.token);
        setSuccess("Signed up successfully with Google! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Google signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [apiBaseUrl, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/customer/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to sign up");
      }

      setSuccess("Account created successfully! Please verify your email.");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 font-sans">
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900">
        <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
        <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Back to catalog</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Create Account
            </h1>
            <p className="text-sm text-neutral-400">
              Register to track and manage your vehicle bookings.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700 text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700 text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Mobile Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. +91 94370 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink mx-4 text-neutral-500 text-xs uppercase font-bold tracking-wider">or</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          {/* Google SSO Container */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              id="g_id_onload"
              data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              data-context="signup"
              data-ux_mode="popup"
              data-callback="handleGoogleCredentialResponse"
              data-auto_prompt="false"
            ></div>
            <div
              className="g_id_signin"
              data-type="standard"
              data-shape="rectangular"
              data-theme="filled_blue"
              data-text="signup_with"
              data-size="large"
              data-logo_alignment="left"
            ></div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-neutral-500">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
