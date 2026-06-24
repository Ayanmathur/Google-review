"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, User, Lock } from "lucide-react";

type Step = "license" | "credentials";

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("license");

  // License step
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // Credentials step
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credError, setCredError] = useState("");
  const [credLoading, setCredLoading] = useState(false);

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError("");
    setLicenseLoading(true);

    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (data.valid) {
        setClientId(data.clientId);
        setClientName(data.clientName);
        setStep("credentials");
      } else {
        const messages: Record<string, string> = {
          invalid: "Invalid license key. Please check and try again.",
          expired: "This license key has expired. Contact your service provider.",
          already_activated: "This license key has already been activated. Please login instead.",
        };
        setLicenseError(messages[data.reason] || "Invalid license key.");
      }
    } catch {
      setLicenseError("Connection error. Please try again.");
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");

    if (password !== confirmPassword) {
      setCredError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setCredError("Password must be at least 6 characters.");
      return;
    }

    if (username.length < 3) {
      setCredError("Username must be at least 3 characters.");
      return;
    }

    setCredLoading(true);

    try {
      const res = await fetch("/api/activate-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKey.trim().toUpperCase(),
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("client_id", data.clientId);
        localStorage.setItem("client_name", data.clientName);
        localStorage.setItem("client_slug", data.slug || "");
        router.push("/dashboard");
      } else {
        setCredError(data.error || "Failed to create account.");
      }
    } catch {
      setCredError("Connection error. Please try again.");
    } finally {
      setCredLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex items-center justify-center px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step === "license"
                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-500 border border-blue-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {step === "credentials" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            License Key
          </div>
          <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step === "credentials"
                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-500 border border-blue-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border border-gray-300 dark:border-gray-700"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Create Account
          </div>
        </div>

        {step === "license" ? (
          <form
            onSubmit={handleVerifyLicense}
            className="w-full space-y-5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-md p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-md bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-500/20 dark:to-amber-500/20 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-rose-500" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Activate License
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Enter the license key provided by your admin
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="RVW-XXXX-XXXX-XXXX"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200
                           placeholder-gray-500 text-sm font-mono tracking-wider text-center focus:outline-none focus:ring-2
                           focus:ring-rose-400/40 focus:border-rose-400/40 transition-all uppercase"
              />
            </div>

            {licenseError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {licenseError}
              </div>
            )}

            <button
              type="submit"
              disabled={licenseLoading || !licenseKey.trim()}
              className="w-full py-3 rounded-md bg-rose-500 hover:bg-rose-600 text-gray-900 dark:text-white font-semibold
                         text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25"
            >
              {licenseLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Verify License Key"
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleCreateAccount}
            className="w-full space-y-5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-md p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-md bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-500/20 dark:to-amber-500/20 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-rose-500" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Your Account
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Welcome, <span className="text-gray-700 dark:text-gray-300 font-medium">{clientName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoFocus
                    required
                    minLength={3}
                    className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200
                               placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                               focus:ring-rose-400/40 focus:border-rose-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200
                               placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                               focus:ring-rose-400/40 focus:border-rose-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200
                               placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                               focus:ring-rose-400/40 focus:border-rose-400/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {credError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {credError}
              </div>
            )}

            <button
              type="submit"
              disabled={credLoading || !username || !password || !confirmPassword}
              className="w-full py-3 rounded-md bg-rose-500 hover:bg-rose-600 text-gray-900 dark:text-white font-semibold
                         text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25"
            >
              {credLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Create Account & Continue"
              )}
            </button>
          </form>
        )}

        {/* Back links */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link
            href="/login"
            className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Already have an account? Sign in
          </Link>
          <span className="text-gray-700">•</span>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
