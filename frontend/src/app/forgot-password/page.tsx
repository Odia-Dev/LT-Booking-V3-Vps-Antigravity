"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to process request");
      }

      setSuccess("If an account with that email exists, we have sent a password reset link.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 font-sans">
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900">
        <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
        <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">Back to login</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Forgot Password
            </h1>
            <p className="text-sm text-neutral-400">
              Enter your email address to receive a password reset link.
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

          {!success && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
