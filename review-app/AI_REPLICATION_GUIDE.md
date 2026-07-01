# AI Replication & System Architecture Guide

This document contains the complete technical blueprint, logic, and architecture for the **AI-Powered Reputation Management App**. It is designed to be read by an LLM (or human developer) to fully understand, replicate, or rebuild the system from scratch.

---

## 1. Tech Stack & Infrastructure

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Matte finish, non-glassy, Blue/Grey color palette with `.bg-watermark` utility)
- **Database / Backend**: Supabase (PostgreSQL, row-level security disabled for rapid MVP, accessed via server-side API routes)
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash model)
- **Key Libraries**: `lucide-react` (icons), `qrcode.react` (QR generation), `xlsx` (Excel exports).

---

## 2. Database Schema (Supabase / PostgreSQL)

### Table: `clients`
Stores business clients who use the platform.
- `id` (uuid, primary key)
- `name` (text) - Business Name
- `slug` (text, unique) - Used for the QR code URL (`/review/[slug]`)
- `business_type` (text) - Used in AI prompt (e.g., "Cafe")
- `google_place_id` (text) - Used for Google Review redirection
- `about` (text, nullable) - Background info used to personalize AI reviews
- `license_key` (text, unique) - Admin-generated key for initial activation
- `is_active` (boolean, default true) - If false, QR scans and logins are blocked
- `expires_at` (timestamptz, nullable) - Account expiration date
- `client_username` (text, nullable, unique) - Login credential
- `client_password` (text, nullable) - Login credential
- `is_activated` (boolean, default false) - Has the client consumed their license key?
- `created_at` (timestamptz)

### Table: `scans`
Tracks every time a user rates a business (for analytics).
- `id` (uuid, primary key)
- `client_id` (uuid, references `clients.id`, ON DELETE CASCADE)
- `rating_given` (int, 1-5)
- `created_at` (timestamptz)

### Table: `negative_reviews`
Captures internal feedback for 1-3 star ratings.
- `id` (uuid, primary key)
- `client_id` (uuid, references `clients.id`, ON DELETE CASCADE)
- `rating` (int, 1-3)
- `feedback` (text, nullable) - The customer's complaint
- `created_at` (timestamptz)

---

## 3. Core Business Logic & User Flows

### A. The QR Review Flow (`/review/[slug]`)
This is the customer-facing interface when a QR code is scanned.
1. **Validation**: Fetches `client` by slug. Checks if `is_active == true` and `expires_at` is valid. Logs a `scan` entry.
2. **Rating Selection**: Shows 5 stars.
3. **Negative Flow (1-3 stars)**:
   - Intercepts the user.
   - Shows a textarea asking "What went wrong?".
   - On submit, saves to `negative_reviews` table.
   - Shows a polite "Thank you for your feedback" screen. **Does NOT redirect to Google.**
4. **Positive Flow (4-5 stars)**:
   - Calls `/api/generate-review` to write a custom review.
   - **AI Prompt Logic**: Enforces exactly 2-3 complete sentences. Integrates the `about` section from the client DB. 
   - **UI Mechanics**: 
     - Auto-copies the AI review to the clipboard.
     - Starts a 5-second countdown timer (can be paused).
     - Allows regenerating ("Try another version").
     - On timer expiration or button click, redirects the user to `https://search.google.com/local/writereview?placeid={google_place_id}` in the *same tab*.

### B. Admin Portal (`/admin`)
- **Authentication**: Secured via a simple password check (stored in env vars or edge config) against `/api/admin-auth`.
- **Capabilities**:
  - CRUD operations on `clients`.
  - Can edit the `about` section (to guide the AI).
  - Can manually edit `client_username` and `client_password`.
  - Can generate/regenerate `license_key`.
  - Can toggle `is_active` (Revoke/Reactivate).
  - Can completely delete a client and all cascading data.

### C. Client Portal (`/login` & `/dashboard`)
- **Login**: Clients log in using `client_username` and `client_password`. Alternatively, new clients go to `/activate` and use a `license_key` to create their credentials.
- **Dashboard**:
  - Displays Total Scans, Positive (4-5), and Negative (1-3) statistics.
  - Generates and displays the downloadable QR Code.
  - Lists internal negative feedback (exportable to XLSX).
  - **Account Settings**: Clients can update their own username/password or delete their account.

---

## 4. API Route Specifications (`app/api/...`)

All routes return standard JSON responses and interact securely with Supabase using `@supabase/supabase-js`.

- **`POST /api/generate-review`**
  - **Body**: `{ businessName, businessType, rating, about }`
  - **Logic**: Constructs prompt emphasizing 2-3 complete sentences and contextualizing via `about`. Calls Gemini API.
- **`POST /api/client-login`**
  - **Body**: `{ username, password }`
  - **Logic**: Verifies credentials and ensures `is_active` is true and `expires_at` is valid.
- **`PUT/DELETE /api/client-settings`**
  - **Logic**: Updates `clients` table credentials or drops the client entirely (and cascades).
- **`POST /api/client-data`**
  - **Body**: `{ clientId }`
  - **Logic**: Returns `{ stats, reviews, slug }`.
- **`POST /api/verify-license` & `POST /api/activate-client`**
  - **Logic**: Validates a license key. Activation consumes the key and sets initial credentials.
- **`GET /api/contact-redirect`**
  - **Logic**: Simple 302 redirect to the owner's WhatsApp number (server-side to protect the number).

---

## 5. Design & Aesthetic Guidelines
- **Color Palette**: Sky Blue, Blue, Slate/Grey. Removed all previous Amber/Rose references.
- **Styling Rules**: 
  - Flat, matte finishes. NO glassmorphism, glowing shadows, or heavy gradients.
  - `rounded-md` across the board (boxy appearance).
  - `bg-watermark` class (radial-gradient dot pattern) applied to the background of login and dashboard screens for depth without gloss.
  - Typography uses `leading-relaxed` (1.4 line-height) and `tracking-wide` for legibility.
- **Responsiveness**: Entire application relies on Tailwind's `max-w-*`, `md:`, and `sm:` prefixes to scale perfectly across iOS, Android, Tablets, and Desktop screens. Touch targets (buttons) are a minimum of `py-3` to `py-4`.
