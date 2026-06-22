"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Star, Loader2, Copy, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  google_place_id: string;
}

type Phase =
  | "loading"
  | "invalid"
  | "rating"
  | "negative-form"
  | "generating"
  | "positive-result"
  | "negative-thankyou";

export default function ReviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<Client | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scanIdRef = useRef<string | null>(null);

  // Fetch client & log scan on mount
  useEffect(() => {
    async function init() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setPhase("invalid");
        return;
      }

      setClient(data as Client);

      // Log scan
      const { data: scan } = await supabase
        .from("scans")
        .insert({ client_id: data.id, rating_given: null })
        .select("id")
        .single();

      if (scan) {
        scanIdRef.current = scan.id;
      }

      setPhase("rating");
    }

    init();
  }, [slug]);

  const updateScanRating = useCallback(async (rating: number) => {
    if (!scanIdRef.current) return;
    await supabase
      .from("scans")
      .update({ rating_given: rating })
      .eq("id", scanIdRef.current);
  }, []);

  const handleStarClick = async (rating: number) => {
    setSelectedRating(rating);

    if (rating <= 3) {
      setPhase("negative-form");
    } else {
      // 4 or 5 stars → generate AI review
      setPhase("generating");

      try {
        const res = await fetch("/api/generate-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: client!.name,
            businessType: client!.business_type,
            rating,
          }),
        });

        const data = await res.json();
        const review = data.review || "";

        setGeneratedReview(review);
        setPhase("positive-result");

        // Auto-copy to clipboard
        try {
          await navigator.clipboard.writeText(review);
          setCopied(true);
        } catch {
          // Clipboard may fail on some mobile browsers
          setCopied(false);
        }

        // Update scan record
        await updateScanRating(rating);
      } catch {
        setGeneratedReview("Something went wrong. Please try again.");
        setPhase("positive-result");
      }
    }
  };

  const handleNegativeSubmit = async () => {
    if (!client) return;
    setSubmitting(true);

    try {
      await supabase.from("negative_reviews").insert({
        client_id: client.id,
        rating: selectedRating,
        feedback: feedback || null,
      });

      await updateScanRating(selectedRating);
      setPhase("negative-thankyou");
    } catch {
      // Silent fail — still show thank you
      setPhase("negative-thankyou");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReview);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: select text
    }
  };

  const googleReviewUrl = client?.google_place_id
    ? `https://search.google.com/local/writereview?placeid=${client.google_place_id}`
    : "#";

  // ─── Loading ───
  if (phase === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </Shell>
    );
  }

  // ─── Invalid Link ───
  if (phase === "invalid") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h1 className="text-xl font-semibold text-gray-200">Invalid link.</h1>
          <p className="text-gray-500 text-sm text-center">
            This review link doesn&apos;t exist or has been removed.
          </p>
        </div>
      </Shell>
    );
  }

  // ─── Star Rating ───
  if (phase === "rating") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">{client?.name}</h1>
            <p className="text-gray-400 text-base">How was your experience?</p>
          </div>
          <StarRow
            selected={selectedRating}
            hovered={hoveredRating}
            onHover={setHoveredRating}
            onClick={handleStarClick}
          />
          <p className="text-gray-600 text-xs">Tap a star to rate</p>
        </div>
      </Shell>
    );
  }

  // ─── Negative Feedback Form (1-3 stars) ───
  if (phase === "negative-form") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">{client?.name}</h1>
            <p className="text-gray-400 text-base">How was your experience?</p>
          </div>
          <StarRow
            selected={selectedRating}
            hovered={0}
            onHover={() => {}}
            onClick={() => {}}
            disabled
          />
          <div className="w-full space-y-4 mt-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what went wrong (optional)"
              rows={4}
              className="w-full rounded-xl border border-gray-700 bg-gray-800/60 text-gray-200 
                         placeholder-gray-500 px-4 py-3 text-sm focus:outline-none 
                         focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                         resize-none transition-all"
            />
            <button
              onClick={handleNegativeSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 
                         text-gray-900 font-semibold text-sm transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </span>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Generating Review ───
  if (phase === "generating") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 relative" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-semibold">Creating your review…</p>
            <p className="text-gray-500 text-sm">This only takes a moment</p>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Positive Result (4-5 stars) ───
  if (phase === "positive-result") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-8 gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">{client?.name}</h1>
            <StarRow
              selected={selectedRating}
              hovered={0}
              onHover={() => {}}
              onClick={() => {}}
              disabled
              size="small"
            />
          </div>

          {/* Generated Review Card */}
          <div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-950/20 
                          backdrop-blur-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Your Review
            </div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {generatedReview}
            </p>
            <button
              onClick={handleManualCopy}
              className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 
                         transition-colors mt-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>

          {/* Copied Confirmation */}
          {copied && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full 
                            bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">
                Review copied to your clipboard!
              </span>
            </div>
          )}

          {/* Google Button */}
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl 
                       bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm 
                       transition-all active:scale-[0.98] shadow-xl shadow-white/10"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Open Google to post your review
            <ExternalLink className="w-4 h-4 opacity-50" />
          </a>

          {/* Instructions */}
          <div className="w-full rounded-xl bg-gray-800/40 border border-gray-700/50 p-4">
            <p className="text-gray-400 text-xs leading-relaxed text-center">
              Your review is copied. Tap the button above, then long-press in
              the text field and tap <span className="text-gray-200 font-medium">Paste</span>.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Negative Thank You ───
  if (phase === "negative-thankyou") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Thank you for your feedback
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
              We&apos;ll use this to improve. Your experience matters to us.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  return null;
}

// ─── Shell wrapper ───
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex justify-center">
      <div className="w-full max-w-[420px] px-5">{children}</div>
    </div>
  );
}

// ─── Star Row ───
function StarRow({
  selected,
  hovered,
  onHover,
  onClick,
  disabled = false,
  size = "large",
}: {
  selected: number;
  hovered: number;
  onHover: (n: number) => void;
  onClick: (n: number) => void;
  disabled?: boolean;
  size?: "large" | "small";
}) {
  const starSize = size === "large" ? "w-12 h-12" : "w-7 h-7";
  const gap = size === "large" ? "gap-3" : "gap-1.5";

  return (
    <div className={`flex items-center justify-center ${gap}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hovered || selected);
        return (
          <button
            key={n}
            disabled={disabled}
            onMouseEnter={() => !disabled && onHover(n)}
            onMouseLeave={() => !disabled && onHover(0)}
            onClick={() => !disabled && onClick(n)}
            className={`transition-all duration-150 ${
              disabled ? "cursor-default" : "cursor-pointer active:scale-90"
            } ${!disabled && !active ? "hover:scale-110" : ""}`}
          >
            <Star
              className={`${starSize} transition-colors duration-150 ${
                active
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  : "fill-transparent text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
