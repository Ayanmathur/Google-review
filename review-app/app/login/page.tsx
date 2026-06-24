"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, KeyRound, MessageCircle, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("client_id", data.clientId);
        localStorage.setItem("client_name", data.clientName);
        localStorage.setItem("client_slug", data.slug);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
        setPassword("");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex items-center justify-center px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-4 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-md p-8"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-500/20 dark:to-amber-500/20 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-rose-500" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Client Login</h1>
              <p className="text-xs text-gray-500 mt-1">
                Sign in to access your dashboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                required
                className="form-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold
                       text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                       shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </button>

          {/* Forgot credentials */}
          <a
            href="/api/contact-redirect?type=forgot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Forgot username or password? Contact Admin
          </a>
        </form>

        {/* Activate Link */}
        <Link
          href="/activate"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800
                     hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium
                     transition-all"
        >
          <KeyRound className="w-4 h-4" />
          Have a license key? Activate your account
        </Link>

        {/* Get License Key */}
        <a
          href="/api/contact-redirect?type=license"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50
                     hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm font-medium
                     transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Don&apos;t have a license key? Get one
        </a>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
