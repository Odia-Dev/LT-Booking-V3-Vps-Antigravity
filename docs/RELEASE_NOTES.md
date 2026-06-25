# Release Notes

This document logs git release tags and production deploy branches history.

---

## Production Release Tags

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

