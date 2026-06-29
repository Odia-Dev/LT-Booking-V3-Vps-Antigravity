"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "CUSTOMER" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to login");
      }

      setSuccess("Authenticated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials. Please check and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 font-sans">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900">
        <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
        <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Back to catalog</Link>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-neutral-400">
              Sign in to manage your bookings and vehicles.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-xs text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/book-online" className="text-white hover:underline">
                  Book a vehicle
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
