"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import {
  Lock,
  Plus,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Star,
  MessageSquare,
  Eye,
  AlertCircle,
  LogOut,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

// ─── Types ───

interface Client {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  google_place_id: string;
  created_at: string;
}

interface ScanStats {
  total: number;
  positive: number;
  negative: number;
}

interface NegativeReview {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

// ─── Session Storage Key ───
const AUTH_KEY = "admin_authenticated";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      </PageShell>
    );
  }

  if (!authenticated) {
    return (
      <PageShell>
        <PasswordGate
          onSuccess={() => {
            sessionStorage.setItem(AUTH_KEY, "true");
            setAuthenticated(true);
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AdminDashboard
        onLogout={() => {
          sessionStorage.removeItem(AUTH_KEY);
          setAuthenticated(false);
        }}
      />
    </PageShell>
  );
}

// ═══════════════════════════════════════════════
// Page Shell
// ═══════════════════════════════════════════════

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">{children}</div>
  );
}

// ═══════════════════════════════════════════════
// Password Gate
// ═══════════════════════════════════════════════

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.authenticated) {
        onSuccess();
      } else {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 bg-gray-900 border border-gray-800 rounded-2xl p-8"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-white">Admin Access</h1>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200
                     placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                     focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
        />

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium
                     text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            "Unlock"
          )}
        </button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Admin Dashboard
// ═══════════════════════════════════════════════

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    setClients((data as Client[]) || []);
    setLoadingClients(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Add Client Form */}
      <AddClientForm onClientAdded={fetchClients} />

      {/* Clients List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-500" />
          Clients ({clients.length})
        </h2>

        {loadingClients ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            No clients yet. Add one above.
          </div>
        ) : (
          clients.map((client) => (
            <ClientCard key={client.id} client={client} onClientUpdated={fetchClients} />
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Add Client Form
// ═══════════════════════════════════════════════

function AddClientForm({ onClientAdded }: { onClientAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: insertError } = await supabase.from("clients").insert({
      name,
      slug,
      business_type: businessType,
      google_place_id: googlePlaceId,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setName("");
      setSlug("");
      setBusinessType("");
      setGooglePlaceId("");
      onClientAdded();
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1500);
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-white">
          <Plus className="w-5 h-5 text-blue-500" />
          Add New Client
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="h-px bg-gray-800" />

          <Field label="Business Name">
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="e.g. Joe's Barbershop"
              className="form-input"
            />
          </Field>

          <Field label="Slug">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="joes-barbershop"
              className="form-input font-mono text-xs"
            />
          </Field>

          <Field label="Business Type">
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              placeholder="e.g. Restaurant, Salon, Clinic"
              className="form-input"
            />
          </Field>

          <Field label="Google Place ID">
            <input
              type="text"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              required
              placeholder="ChIJ..."
              className="form-input font-mono text-xs"
            />
            <a
              href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Find my Place ID
              <ExternalLink className="w-3 h-3" />
            </a>
          </Field>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Client added successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium
                       text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Add Client"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Field helper ───

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Client Card
// ═══════════════════════════════════════════════

function ClientCard({ client, onClientUpdated }: { client: Client; onClientUpdated: () => void }) {
  const [stats, setStats] = useState<ScanStats>({
    total: 0,
    positive: 0,
    negative: 0,
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<NegativeReview[]>([]);
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // ─── Edit State ───
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editSlug, setEditSlug] = useState(client.slug);
  const [editBusinessType, setEditBusinessType] = useState(client.business_type);
  const [editGooglePlaceId, setEditGooglePlaceId] = useState(client.google_place_id);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reviewUrl =
    typeof window !== "undefined"
      ? `https://${window.location.host}/review/${client.slug}`
      : `/review/${client.slug}`;

  // Fetch stats
  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase
        .from("scans")
        .select("rating_given")
        .eq("client_id", client.id);

      if (data) {
        const total = data.length;
        const positive = data.filter(
          (s) => s.rating_given !== null && s.rating_given >= 4
        ).length;
        const negative = data.filter(
          (s) => s.rating_given !== null && s.rating_given <= 3
        ).length;
        setStats({ total, positive, negative });
      }
    }

    loadStats();
  }, [client.id]);

  // Fetch negative reviews on toggle
  const toggleFeedback = async () => {
    if (!feedbackOpen && !feedbackLoaded) {
      const { data } = await supabase
        .from("negative_reviews")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      setFeedback((data as NegativeReview[]) || []);
      setFeedbackLoaded(true);
    }
    setFeedbackOpen(!feedbackOpen);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard may not be available
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${client.slug}-qr.png`;
    link.href = url;
    link.click();
  };

  const handleStartEdit = () => {
    setEditName(client.name);
    setEditSlug(client.slug);
    setEditBusinessType(client.business_type);
    setEditGooglePlaceId(client.google_place_id);
    setEditError("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditError("");
  };

  const handleSaveEdit = async () => {
    setEditError("");
    setSaving(true);

    const { error } = await supabase
      .from("clients")
      .update({
        name: editName,
        slug: editSlug,
        business_type: editBusinessType,
        google_place_id: editGooglePlaceId,
      })
      .eq("id", client.id);

    if (error) {
      setEditError(error.message);
    } else {
      setEditing(false);
      onClientUpdated();
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);

    if (error) {
      setEditError(error.message);
      setDeleting(false);
    } else {
      onClientUpdated();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {editing ? (
          <div className="flex-grow space-y-3">
            <Field label="Business Name">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Slug">
              <input
                type="text"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className="form-input font-mono text-xs"
              />
            </Field>
            <Field label="Business Type">
              <input
                type="text"
                value={editBusinessType}
                onChange={(e) => setEditBusinessType(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Google Place ID">
              <input
                type="text"
                value={editGooglePlaceId}
                onChange={(e) => setEditGooglePlaceId(e.target.value)}
                className="form-input font-mono text-xs"
              />
            </Field>

            {editError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {editError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName || !editSlug || !editBusinessType || !editGooglePlaceId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                           text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                           text-gray-300 text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-base font-semibold text-white">{client.name}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                /{client.slug}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{client.business_type}</p>
            </div>

            {/* QR Code */}
            <div
              ref={qrRef}
              className="flex-shrink-0 bg-white rounded-lg p-2"
            >
              <QRCodeCanvas value={reviewUrl} size={80} level="M" />
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleDownloadQR}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                     text-gray-300 text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download QR
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                     text-gray-300 text-xs font-medium transition-colors"
        >
          {linkCopied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy link
            </>
          )}
        </button>
        {!editing && (
          <>
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                         text-gray-300 text-xs font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500
                             text-white text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                             text-gray-300 text-xs font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-red-900/50
                           text-gray-500 hover:text-red-400 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex gap-3">
        <StatBadge
          icon={<Eye className="w-3.5 h-3.5" />}
          label="Total scans"
          value={stats.total}
          color="text-gray-400"
        />
        <StatBadge
          icon={<Star className="w-3.5 h-3.5" />}
          label="4-5 star"
          value={stats.positive}
          color="text-emerald-400"
        />
        <StatBadge
          icon={<AlertCircle className="w-3.5 h-3.5" />}
          label="1-3 star"
          value={stats.negative}
          color="text-red-400"
        />
      </div>

      {/* Feedback Toggle */}
      <button
        onClick={toggleFeedback}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {feedbackOpen ? "Hide feedback" : "View feedback"}
        {feedbackOpen ? (
          <ChevronUp className="w-3.5 h-3.5 ml-auto" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-auto" />
        )}
      </button>

      {/* Feedback List */}
      {feedbackOpen && (
        <div className="space-y-2 pt-1">
          {feedback.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">
              No negative feedback yet.
            </p>
          ) : (
            feedback.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800/50 rounded-xl px-4 py-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {review.feedback || (
                    <span className="italic text-gray-600">
                      No feedback provided
                    </span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat Badge ───

function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2.5 text-center space-y-1">
      <div className={`flex items-center justify-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-base font-semibold">{value}</span>
      </div>
      <p className="text-[10px] text-gray-600 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
