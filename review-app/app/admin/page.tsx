"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
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
  KeyRound,
  ShieldCheck,
  ShieldX,
  RefreshCw,
  User,
  Lock as LockIcon,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// ─── License Key Generator ───
function generateLicenseKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `RVW-${seg()}-${seg()}-${seg()}`;
}

// ─── Types ───

interface Client {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  google_place_id: string;
  created_at: string;
  license_key: string;
  is_active: boolean;
  expires_at: string | null;
  client_username: string | null;
  client_password: string | null;
  is_activated: boolean;
  about: string;
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

  const router = useRouter();

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
          <Loader2 className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-500" />
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
          router.push("/");
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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">{children}</div>
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
        className="w-full max-w-sm space-y-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-8"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Access</h1>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200
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
          className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white font-medium
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
    try {
      const res = await fetch("/api/admin-clients");
      const data = await res.json();
      if (data.error) {
        setClients([]);
      } else {
        setClients(data.clients || []);
      }
    } catch {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Add Client Form */}
      <AddClientForm onClientAdded={fetchClients} />

      {/* Clients List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-500" />
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
  const [about, setAbout] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [keyCopied, setKeyCopied] = useState(false);

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

    const licenseKey = generateLicenseKey();

    try {
      const res = await fetch("/api/admin-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          business_type: businessType,
          google_place_id: googlePlaceId,
          about,
          license_key: licenseKey,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      } else {
        setSuccess(true);
        setGeneratedKey(licenseKey);
        setName("");
        setSlug("");
        setBusinessType("");
        setGooglePlaceId("");
        setAbout('');
        onClientAdded();
      }
    } catch {
      setError("Network error adding client");
    }

    setSubmitting(false);
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      // Clipboard may not be available
    }
  };

  const handleDone = () => {
    setSuccess(false);
    setGeneratedKey("");
    setOpen(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <Plus className="w-5 h-5 text-blue-500" />
          Add New Client
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-500" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {success && generatedKey ? (
            // Show generated license key after creation
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Client added successfully!
              </div>

              <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md p-4 space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">
                  License Key — Share this with the client
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-grow text-lg font-mono text-sky-500 tracking-wider">
                    {generatedKey}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                               text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                  >
                    {keyCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDone}
                className="w-full py-3 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium
                           text-sm transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Field label="About / Business Info">
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Details about the business that help generate better reviews (e.g., specialty dishes, unique services, years in business)"
                  rows={3}
                  className="form-input resize-none"
                />
              </Field>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white font-medium
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
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // ─── Edit State ───
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editSlug, setEditSlug] = useState(client.slug);
  const [editBusinessType, setEditBusinessType] = useState(client.business_type);
  const [editGooglePlaceId, setEditGooglePlaceId] = useState(client.google_place_id);
  const [editAbout, setEditAbout] = useState(client.about || '');
  const [editUsername, setEditUsername] = useState(client.client_username || '');
  const [editPassword, setEditPassword] = useState(client.client_password || '');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ─── License Management State ───
  const [revoking, setRevoking] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newKeyShown, setNewKeyShown] = useState("");
  const [expiryDate, setExpiryDate] = useState(
    client.expires_at ? client.expires_at.split("T")[0] : ""
  );
  const [updatingExpiry, setUpdatingExpiry] = useState(false);

  const reviewUrl =
    typeof window !== "undefined"
      ? `https://${window.location.host}/review/${client.slug}`
      : `/review/${client.slug}`;

  // Compute status
  const getStatus = (): { label: string; color: string; bgColor: string } => {
    if (!client.is_active) {
      return { label: "Revoked", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" };
    }
    if (client.expires_at && new Date(client.expires_at) < new Date()) {
      return { label: "Expired", color: "text-sky-500", bgColor: "bg-sky-600/10 border-sky-600/20" };
    }
    return { label: "Active", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" };
  };

  const status = getStatus();

  // Fetch stats
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/client-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: client.id }),
        });
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          if (data.reviews) {
            setFeedback(data.reviews);
          }
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }

    loadStats();
  }, [client.id]);

  // Fetch negative reviews on toggle
  const toggleFeedback = async () => {
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

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(client.license_key);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
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
    setEditAbout(client.about || '');
    setEditUsername(client.client_username || '');
    setEditPassword(client.client_password || '');
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

    try {
      const res = await fetch("/api/admin-clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: client.id,
          name: editName,
          slug: editSlug,
          business_type: editBusinessType,
          google_place_id: editGooglePlaceId,
          about: editAbout,
          client_username: editUsername || null,
          client_password: editPassword || null,
        }),
      });
      const data = await res.json();
      
      if (data.error) {
        setEditError(data.error);
      } else {
        setEditing(false);
        onClientUpdated();
      }
    } catch {
      setEditError("Failed to update client");
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete this client and all associated data? This cannot be undone.")) return;
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/admin-clients?id=${client.id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.error) {
        setEditError(data.error);
        setDeleting(false);
      } else {
        onClientUpdated();
      }
    } catch {
      setEditError("Network error deleting client");
      setDeleting(false);
    }
  };

  // ─── License Management ───

  const handleToggleRevoke = async () => {
    setRevoking(true);
    const res = await fetch("/api/admin-clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, is_active: !client.is_active }),
    });
    const data = await res.json();
    if (!data.error) {
      onClientUpdated();
    }
    setRevoking(false);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    const newKey = generateLicenseKey();

    const res = await fetch("/api/admin-clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, license_key: newKey, is_activated: false, client_username: null, client_password: null }),
    });
    const data = await res.json();
    
    if (!data.error) {
      setNewKeyShown(newKey);
      onClientUpdated();
    }
    setRegenerating(false);
  };

  const handleUpdateExpiry = async (dateStr: string) => {
    setExpiryDate(dateStr);
    setUpdatingExpiry(true);

    const expiresAt = dateStr ? new Date(dateStr + "T23:59:59Z").toISOString() : null;

    const res = await fetch("/api/admin-clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, expires_at: expiresAt }),
    });
    const data = await res.json();

    if (!data.error) {
      onClientUpdated();
    }
    setUpdatingExpiry(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
      {/* Header with Status Badge */}
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
            <Field label="About / Business Info">
              <textarea
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                rows={3}
                className="form-input resize-none"
              />
            </Field>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Client Login Credentials</h4>
              <Field label="Username">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="form-input"
                  placeholder="Optional"
                />
              </Field>
              <Field label="Password">
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="form-input"
                  placeholder="Optional"
                />
              </Field>
            </div>

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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                           text-gray-900 dark:text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                           text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              
              <div className="flex-grow"></div>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-40"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${status.bgColor} ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5">
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

      {/* License Key Section */}
      <div className="bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700/50 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            License Key
          </span>
          {!client.is_activated && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium">
              Not Activated
            </span>
          )}
          {client.is_activated && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              Activated
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <code className="flex-grow text-sm font-mono text-amber-300 tracking-wider bg-gray-50 dark:bg-gray-900/60 rounded-lg px-3 py-2">
            {newKeyShown || client.license_key}
          </code>
          <button
            onClick={handleCopyKey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                       text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors flex-shrink-0"
          >
            {keyCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Key
              </>
            )}
          </button>
        </div>

        {/* Client Credentials (visible to admin) */}
        {client.is_activated && client.client_username && (
          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg px-3 py-2.5 space-y-1.5 border border-gray-300 dark:border-gray-700/30">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
              Client Credentials
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                <span className="font-mono text-gray-700 dark:text-gray-300">{client.client_username}</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <LockIcon className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                <span className="font-mono text-gray-700 dark:text-gray-300">{client.client_password}</span>
              </span>
            </div>
          </div>
        )}

        {/* License Management Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Expiry Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-500" />
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => handleUpdateExpiry(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-xs
                         focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all
                         [color-scheme:dark]"
            />
            {updatingExpiry && <Loader2 className="w-3 h-3 animate-spin text-gray-500 dark:text-gray-500" />}
          </div>

          <div className="flex-grow" />

          {/* Revoke / Reactivate */}
          <button
            onClick={handleToggleRevoke}
            disabled={revoking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
              client.is_active
                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {revoking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : client.is_active ? (
              <ShieldX className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            {client.is_active ? "Revoke" : "Reactivate"}
          </button>

          {/* Regenerate Key */}
          <button
            onClick={handleRegenerateKey}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700/50 border border-gray-600/50
                       text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50 text-xs font-medium transition-colors disabled:opacity-40"
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Regenerate
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleDownloadQR}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                     text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download QR
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                     text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                         text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
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
                             text-gray-900 dark:text-white text-xs font-medium transition-colors disabled:opacity-40"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                             text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-900/50
                           text-gray-500 dark:text-gray-500 hover:text-red-400 text-xs font-medium transition-colors"
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
          color="text-gray-600 dark:text-gray-400"
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
        className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors w-full"
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
                className="bg-gray-100 dark:bg-gray-800/50 rounded-md px-4 py-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-sky-500 text-sky-500"
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
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
    <div className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-md px-3 py-2.5 text-center space-y-1">
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
