"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Star, Loader2, CheckCircle2, AlertCircle, RefreshCw, Copy, Pause, Play } from "lucide-react";

interface Client {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  google_place_id: string;
  about: string | null;
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
  
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const scanIdRef = useRef<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValueRef = useRef(5);
  const isPausedRef = useRef(false);
  const googleReviewUrlRef = useRef("#");

  // Keep google review URL ref in sync
  useEffect(() => {
    if (client?.google_place_id) {
      googleReviewUrlRef.current = `https://search.google.com/local/writereview?placeid=${client.google_place_id}`;
    }
  }, [client?.google_place_id]);

  // Sync isPaused state to ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // ─── Fetch Client & Log Scan ───
  useEffect(() => {
    async function loadClient() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setPhase("invalid");
        return;
      }

      setClient(data);
      setPhase("rating");

      // Log scan
      const { data: scanData } = await supabase
        .from("scans")
        .insert({ client_id: data.id })
        .select("id")
        .single();

      if (scanData) {
        scanIdRef.current = scanData.id;
      }
    }
    loadClient();
  }, [slug]);

  const updateScanRating = async (rating: number) => {
    if (scanIdRef.current) {
      await supabase
        .from("scans")
        .update({ rating_given: rating })
        .eq("id", scanIdRef.current);
    }
  };

  // ─── Countdown Logic ───
  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const resetCountdown = useCallback(() => {
    countdownValueRef.current = 5;
    setCountdown(5);
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdown();
    countdownValueRef.current = 5;
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      
      countdownValueRef.current -= 1;
      setCountdown(countdownValueRef.current);

      if (countdownValueRef.current <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        window.location.href = googleReviewUrlRef.current;
      }
    }, 1000);
  }, [clearCountdown]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Interaction listeners to reset countdown (only in positive-result phase and if not paused)
  useEffect(() => {
    if (phase !== "positive-result") return;

    const handleInteraction = () => {
      if (!isPausedRef.current) {
        resetCountdown();
      }
    };

    const events = ["click", "touchstart", "scroll", "mousemove"];
    events.forEach((evt) => window.addEventListener(evt, handleInteraction, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleInteraction));
    };
  }, [phase, resetCountdown]);

  // Clean up countdown on unmount
  useEffect(() => {
    return () => clearCountdown();
  }, [clearCountdown]);

  // ─── Generate review helper ───
  const generateReview = useCallback(
    async (rating: number) => {
      if (!client) return "";

      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: client.name,
          businessType: client.business_type,
          rating,
          about: client.about,
        }),
      });

      const data = await res.json();
      return data.review || "";
    },
    [client]
  );

  const autoCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const handleManualCopy = async () => {
    await autoCopy(generatedReview);
  };

  // ─── Handlers ───
  const handleStarClick = async (rating: number) => {
    setSelectedRating(rating);

    if (rating <= 3) {
      setPhase("negative-form");
    } else {
      setPhase("generating");

      try {
        const review = await generateReview(rating);
        setGeneratedReview(review);
        setPhase("positive-result");

        await autoCopy(review);
        startCountdown();
        await updateScanRating(rating);
      } catch {
        setGeneratedReview("Something went wrong. Please try again.");
        setPhase("positive-result");
      }
    }
  };

  const handleTryAnother = async () => {
    if (regenerating) return;
    setRegenerating(true);
    // Pause while regenerating so it doesn't redirect
    setIsPaused(true);

    try {
      const review = await generateReview(selectedRating);
      setGeneratedReview(review);
      await autoCopy(review);
      resetCountdown();
    } catch {
      // Keep existing review
    } finally {
      setRegenerating(false);
      setIsPaused(false);
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
      setPhase("negative-thankyou");
    } finally {
      setSubmitting(false);
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
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-gray-600 dark:text-gray-400 text-sm font-sans">Loading…</p>
        </div>
      </Shell>
    );
  }

  // ─── Invalid Link ───
  if (phase === "invalid") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-14 h-14 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-gray-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-sans">
            Oops, link not found.
          </h1>
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center font-sans">
            This review link doesn&apos;t seem to exist or has been removed.
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
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-sans tracking-wide">
              {client?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-sans leading-relaxed">
              Hey there! How was your experience with us?
            </p>
          </div>
          <StarRow
            selected={selectedRating}
            hovered={hoveredRating}
            onHover={setHoveredRating}
            onClick={handleStarClick}
          />
          <p className="text-gray-500 text-xs font-sans">Tap a star to rate</p>
        </div>
      </Shell>
    );
  }

  // ─── Negative Feedback Form (1-3 stars) ───
  if (phase === "negative-form") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-sans tracking-wide">
              {client?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-sans leading-relaxed">
              We&apos;re sorry to hear that. What went wrong?
            </p>
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
              placeholder="Your honest feedback helps us improve..."
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700
                         bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
                         placeholder-gray-500 px-4 py-3 text-sm font-sans
                         focus:outline-none focus:ring-2 focus:ring-sky-600/50 focus:border-sky-600/50
                         resize-none transition-all"
            />
            <button
              onClick={handleNegativeSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-md bg-sky-600 hover:bg-sky-700
                         text-white font-semibold text-sm font-sans transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Feedback"
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
            <Loader2 className="w-10 h-10 animate-spin text-sky-600 relative" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-gray-900 dark:text-white font-semibold font-sans tracking-wide">
              Writing a great review for you...
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm font-sans">
              Hang tight, this will just take a second.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Positive Result (4-5 stars) ───
  if (phase === "positive-result") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-8 gap-5 w-full">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-sans tracking-wide">
              {client?.name}
            </h1>
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
          <div
            className="w-full rounded-md border border-sky-200 dark:border-sky-900/40
                        bg-sky-50 dark:bg-sky-950/20 p-5 md:p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-600 text-xs md:text-sm font-semibold font-sans uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
              Here is a draft for you
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-sans">
              {generatedReview}
            </p>
          </div>

          {/* Try Another */}
          <button
            onClick={handleTryAnother}
            disabled={regenerating}
            className="flex items-center gap-1.5 text-sm md:text-base text-gray-500 dark:text-gray-400
                       hover:text-sky-700 dark:hover:text-sky-500 transition-colors font-sans
                       disabled:opacity-50 font-medium py-2"
          >
            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${regenerating ? "animate-spin" : ""}`} />
            Try another version
          </button>

          {/* Action Buttons Row */}
          <div className="w-full flex items-center gap-3 md:gap-4 mt-2">
            <a
              href={googleReviewUrl}
              className="flex-1 flex items-center justify-center gap-2 py-4 md:py-5 rounded-md
                         bg-sky-500 hover:bg-sky-600 text-gray-900 font-bold text-base md:text-lg font-sans
                         transition-all active:scale-[0.98] shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-md p-0.5" fill="none">
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
              Go to Google
            </a>
            
            <button
              onClick={handleManualCopy}
              className={`flex flex-col items-center justify-center w-[72px] md:w-[84px] py-3 md:py-4 rounded-md transition-all active:scale-[0.98] border shadow-sm
                ${copied 
                  ? 'bg-sky-100 border-sky-200 text-amber-700 dark:bg-sky-900/40 dark:border-sky-800 dark:text-sky-500' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750'
                }`}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <Copy className="w-5 h-5 md:w-6 md:h-6" />}
              <span className="text-[11px] md:text-xs mt-1 font-medium">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Countdown & Pause */}
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/80 px-5 py-3 md:py-4 rounded-md">
            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-sans font-medium">
              Redirecting in {countdown}s
            </span>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
            <button
              onClick={togglePause}
              className="text-gray-500 hover:text-sky-700 dark:hover:text-sky-500 transition-colors p-1"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>

          {/* Paste instructions */}
          <div
            className="w-full rounded-md bg-gray-100 dark:bg-gray-800/40 border border-gray-200
                        dark:border-gray-700 p-5 md:p-6 mt-2"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed text-center font-sans">
              We&apos;ve copied your review! Just tap the <strong className="text-gray-900 dark:text-gray-100">Go to Google</strong> button, long-press in the review box there, and tap <strong className="text-gray-900 dark:text-gray-100">Paste</strong>.
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
          <div className="w-16 h-16 rounded-md bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-sky-600" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sans tracking-wide">
              Thank you for sharing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-[280px] font-sans">
              We appreciate your honest feedback. We&apos;ll use this to make things better next time.
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
    <div className="min-h-screen bg-white dark:bg-[#111] flex justify-center items-center py-8">
      <div className="w-full max-w-[420px] sm:max-w-md md:max-w-lg px-6 sm:px-8">{children}</div>
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
                  ? "fill-sky-500 text-sky-500"
                  : "fill-gray-100 text-gray-200 dark:fill-gray-800 dark:text-gray-700"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
