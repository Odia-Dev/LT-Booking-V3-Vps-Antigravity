# Release Notes

This document logs git release tags and production deploy branches history.

---

## Production Release Tags

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

