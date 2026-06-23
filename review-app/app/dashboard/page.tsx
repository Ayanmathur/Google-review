"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from "xlsx";
import {
  LogOut,
  Loader2,
  Download,
  Star,
  MessageSquare,
  FileSpreadsheet,
  QrCode,
  AlertCircle,
  Eye,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface ReviewData {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  positive: number;
  negative: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientSlug, setClientSlug] = useState("");
  const [stats, setStats] = useState<Stats>({ total: 0, positive: 0, negative: 0 });
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [error, setError] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const reviewUrl =
    typeof window !== "undefined"
      ? `https://${window.location.host}/review/${clientSlug}`
      : "";

  const loadDashboard = useCallback(async () => {
    const clientId = localStorage.getItem("client_id");
    const name = localStorage.getItem("client_name");

    if (!clientId || !name) {
      router.push("/login");
      return;
    }

    setClientName(name);

    try {
      const res = await fetch("/api/client-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        localStorage.clear();
        router.push("/login");
        return;
      }

      setStats(data.stats);
      setReviews(data.reviews);
      setClientSlug(data.slug);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("client_id");
    localStorage.removeItem("client_name");
    localStorage.removeItem("client_slug");
    router.push("/");
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${clientSlug}-qr-code.png`;
    link.href = url;
    link.click();
  };

  const handleExportXLSX = () => {
    const data = reviews.map((r) => ({
      Date: new Date(r.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      Stars: r.rating,
      Feedback: r.feedback || "No feedback provided",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [{ wch: 14 }, { wch: 6 }, { wch: 60 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, `${clientSlug}-feedback.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Background Glows */}
      <div className="absolute top-[-5%] left-[-15%] w-[500px] h-[500px] rounded-full bg-blue-900/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-900/8 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{clientName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">Client Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                         hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                         font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            label="Total Scans"
            value={stats.total}
            color="text-gray-700 dark:text-gray-300"
            bgColor="from-gray-500/10 to-gray-600/5"
            borderColor="border-gray-200 dark:border-gray-800"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Positive (4-5★)"
            value={stats.positive}
            color="text-emerald-400"
            bgColor="from-emerald-500/10 to-emerald-600/5"
            borderColor="border-emerald-500/20"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Negative (1-3★)"
            value={stats.negative}
            color="text-red-400"
            bgColor="from-red-500/10 to-red-600/5"
            borderColor="border-red-500/20"
          />
        </div>

        {/* QR Code Section */}
        <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-blue-400" />
            Your Review QR Code
          </h2>
          <div className="flex items-center gap-6">
            <div ref={qrRef} className="bg-white rounded-xl p-3 flex-shrink-0">
              <QRCodeCanvas value={reviewUrl} size={120} level="M" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Print this QR code and place it at your business. Customers can
                scan it to leave a review.
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {reviewUrl}
              </p>
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
                           text-gray-900 dark:text-white text-sm font-medium transition-all
                           shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Customer Feedback
              <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
                ({reviews.length})
              </span>
            </h2>
            {reviews.length > 0 && (
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30
                           hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export XLSX
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                No negative feedback yet. That&apos;s great!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Stars
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Customer Feedback
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-md">
                        {review.feedback || (
                          <span className="italic text-gray-600">
                            No feedback provided
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${bgColor} border ${borderColor} rounded-2xl p-5 text-center space-y-2 backdrop-blur-sm`}
    >
      <div className={`flex items-center justify-center gap-2 ${color}`}>
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}
