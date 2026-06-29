"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to verify email");
      }

      setSuccess("Account verified successfully! You can now login.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired token.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Invalid Link</h1>
        <p className="text-sm text-neutral-400 mb-6">No verification token provided.</p>
        <Link href="/" className="px-6 py-3 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Verify Email
        </h1>
        <p className="text-sm text-neutral-400">
          Please set your account password to complete verification.
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
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-neutral-950 font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Set Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 font-sans">
      <header className="px-6 py-5 flex justify-between items-center border-b border-neutral-900">
        <span className="text-xl font-bold tracking-widest text-white uppercase">LAXMI TOYOTA</span>
        <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Back to catalog</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>

      <footer className="py-6 text-center border-t border-neutral-900">
        <p className="text-xs text-neutral-600">&copy; 2026 Laxmi Toyota. All rights reserved.</p>
      </footer>
    </div>
  );
}
