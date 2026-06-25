# Changelog

All notable changes to the Laxmi Toyota Booking Portal V3 will be documented in this file.

---

## [1.0.0] - 2026-06-25

### Added
* **Milestone M01 Core Foundation**: Initialized Next.js project with TailwindCSS and custom configuration.
* **Milestone M02 Authentication**: Implemented single-admin secure HTTP-only cookies token generation.
* **Milestone M03 User Management**: Configured roles and database profile updates.
* **Milestone M04 Admin Dashboard Shell**: Built admin landing panels and sidebar navigation controls.
* **Milestone M05 Vehicle Management**: Configured main catalog CMS.
* **Milestone M06 Vehicle Variant Management**: Extended variant pricing and spec customization options.
* **Milestone M07 Vehicle Color Management**: Added real Toyota color swatch selectors and hex swatches.
* **Milestone M07B SEO Architecture Refactor**: Standardized metadata tags and Schema.org JSON-LD structures.
* **Milestone M08 Branch Management (Current)**:
  * Database schema extended with required fields (`code`, `city`, `district`, `state`, `pincode`, coordinates, status, manager phone).
  * Backend API endpoints configured with Zod schema verification and authentication middleware protection.
  * Tagged database configuration release: `production-db-ready`.
