# Release Notes

This document logs git release tags and production deploy branches history.

---

## Production Release Tags

### `production-db-ready` (2026-06-25)
* **Goal**: Establish the base branch schema migrations and configurations for physical showrooms.
* **Commit**: Pushed onto origin branch `develop` containing backend Prisma schema upgrades and code specifications.
* **Details**: Base entity verification ready.

### `v1.0.0-m06-production-ready` (2026-06-25)
* **Goal**: Release the production-grade vehicle variant specifications and SEO capabilities.
* **Commit**: `feat(m06): production ready`
* **Details**: 
  - Dynamic `specs` JSON column in `Variant` table.
  - Expanded specification form inputs in both create and edit pages in Admin UI.
  - Public SEO routes `/api/public/vehicles/:slug/variants` and `/api/public/variants/:slug` returning Schema.org JSON-LD, Open Graph, and canonical mappings.
  - Passes backend TypeScript build compiler checks and Next.js static optimizations.

