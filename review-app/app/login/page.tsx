"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, KeyRound } from "lucide-react";

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
    <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 bg-gray-900/80 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Client Login</h1>
              <p className="text-xs text-gray-500 mt-1">
                Sign in to access your dashboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200
                           placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200
                           placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold
                       text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                       shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Activate Link */}
        <Link
          href="/activate"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900/60 border border-gray-800
                     hover:bg-gray-800/60 hover:border-gray-700 text-gray-400 hover:text-gray-200 text-sm font-medium
                     transition-all backdrop-blur-sm"
        >
          <KeyRound className="w-4 h-4" />
          Have a license key? Activate your account
        </Link>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
