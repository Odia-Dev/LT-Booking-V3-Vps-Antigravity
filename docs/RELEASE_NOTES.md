# Release Notes

This document logs git release tags and production deploy branches history.

---

## Production Release Tags

### `v1.0.0-m09-production-ready` (2026-06-25)
* **Goal**: Establish production-ready Lead Management backend API, security middlewares, reusable customer-facing forms, and admin CRM console.
* **Commit**: `feat(m09): production ready`
* **Details**:
  - Implemented lead repository and service logic including phone/email checks, intent scoring, priority mapping, and duplicate submission checks.
  - Deployed `/api/public/leads` with IP-based rate limiting (max 5 requests/minute) and spam keyword filters.
  - Setup async notification runner supporting customer emails, admin logs, webhooks, and future WhatsApp hooks.
  - Built reusable `LeadForm.tsx` tab component on the website (`/contact`) capturing UTM tracking data.
  - Deployed Admin CRM Console (`/admin/leads` and `/admin/leads/[id]`) with pagination, search, status transitions, bulk operations, and timeline note history.

### `v1.0.0-m08-production-ready` (2026-06-25)
* **Goal**: Establish production-ready dealership branch management API, admin CMS, and public website location pages.
* **Commit**: `feat(m08): production ready`
* **Details**:
  - Implemented Branch CRUD repository and service methods with validation rules (pincode, email, phone validations).
  - Admin Branch CMS dashboard (`/admin/branches`) supporting paginated location tables, name/code searches, status PATCH toggles, and deletion.
  - Public location showroom selectors (`/branches`) and custom dynamic metadata profile pages (`/branches/[slug]`) rendering embedded map embeds and auto-localizing coordinates.
  - Public branch JSON-LD structured schemas (`AutoDealer` type) and Open Graph parameters.

### `production-db-ready` (2026-06-25)
* **Goal**: Establish the base branch schema migrations and configurations for physical showrooms.
* **Commit**: Pushed onto origin branch `develop` containing backend Prisma schema upgrades and code specifications.
* **Details**: Base entity verification ready.

### `v1.0.0-m05-production-ready` (2026-06-25)
* **Goal**: Release the production-grade vehicle media management and public catalog pages.
* **Commit**: `feat(m05): production ready`
* **Details**:
  - Media references including Hero Image, Thumbnail, Brochure PDF URL, and YouTube Video URL stored in PostgreSQL.
  - Interactive multi-image gallery support on the Admin panel with custom drag/move ordering and removal.
  - Redesigned public vehicle detail page layout rendering real media, gallery list, YouTube video players, and brochure download links.
  - Dedicated public API endpoints: `GET /api/public/vehicles` and `GET /api/public/vehicles/:slug` returning active catalog details and associated variants.
  - Complete backend/frontend TypeScript verification and validation check.

### `v1.0.0-m06-production-ready` (2026-06-25)
* **Goal**: Release the production-grade vehicle variant specifications and SEO capabilities.
* **Commit**: `feat(m06): production ready`
* **Details**: 
  - Dynamic `specs` JSON column in `Variant` table.
  - Expanded specification form inputs in both create and edit pages in Admin UI.
  - Public SEO routes `/api/public/vehicles/:slug/variants` and `/api/public/variants/:slug` returning Schema.org JSON-LD, Open Graph, and canonical mappings.
  - Passes backend TypeScript build compiler checks and Next.js static optimizations.

