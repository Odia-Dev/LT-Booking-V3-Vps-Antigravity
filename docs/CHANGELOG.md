# Changelog

All notable changes to the Laxmi Toyota Booking Portal V3 will be documented in this file.

---

## [1.0.0] - 2026-06-26

### Added
* **Razorpay Payment Integration (Milestone M12)**:
  - Extended database schema with `Payment` and `PaymentAudit` models for persistent order logging and status change records.
  - Initialized Razorpay Client SDK using environment-isolated API secrets.
  - Implemented backend Repository and Services to handle payment generation, cryptographic signature validation, and mock refund processing.
  - Configured REST controller endpoints for order creation, lookups, signature verifications, and administrative refund controls.
  - Mounted protected payment console routes under JWT check auth alongside public checkout routes `/api/public/payments/*`.
  - Upgraded public checkout forms (`/book-online`) to load the Razorpay SDK dynamically, launch payment screens, map verified callbacks, and render success/failure redirect interfaces.
  - Deployed Razorpay Webhook receiver (`POST /api/webhooks/razorpay`) verifying request buffer signatures, event handling (captured, failed, refunded), and payload hash idempotency checks.
  - Integrated notification hooks dispatching Email, SMS, and WhatsApp alerts on successful transactions, payment failures, confirmed status changes, and refunds.
* **Milestone M11 Online Booking Engine**:
  - Rewrote and extended the database model schema for `Booking` with physical relation mappings to vehicle catalog and customer profiles.
  - Developed monthly sequential, atomic, and concurrency-safe Unique Booking ID generation (`LT-YYYYMM-000001`).
  - Implemented backend Repository and Services supporting paginated lists, status/payment updates, and cancellation lifecycles.
  - Implemented secure API Controllers and Zod input validation schemas for `/api/bookings` with multi-tier role-based access controls.
  - Configured public booking flow (`/book-online` and `/book-online/[vehicle]`) supporting UTM campaign parameter tracking, automatic profile resolution, and a Payment Pending dashboard screen.
  - Designed the comprehensive Admin Booking Management Dashboard CRM console (`/admin/bookings` and `/admin/bookings/[id]`) with timeline activity logs and bulk updates.
  - Deployed an event-driven notification architecture for transactional booking status transitions with persistent logs stored in `NotificationLog`.
* **Security Hardening (Milestone S01)**:
  - Deployed production API security middlewares (`helmet`, `express-rate-limit`, `cors`, and `compression`).
  - Implemented role-based access control (RBAC) authorization guards checking `ADMIN` roles across critical resource routes (vehicles, variants, branches, colors, leads, and test drives).
  - Hardened cookie session configurations to `SameSite=Strict`, `httpOnly`, and `secure`.
  - Configured zero-leak logging policies and implemented Customer PII masking helpers (Email, Phone, Name) in console/audit logs.
  - Performed dependency security audits (`npm audit` / `npm outdated`) for frontend and backend.
  - Run complete production builds, Prisma schema validations, and verification checks.
* **Milestone M10 Test Drive Management**:
  - Implemented backend Repository, Services, and REST controllers for Test Drive Scheduling.
  - Setup slot conflict checking, double-booking prevention, and automatic customer User & Lead creation.
  - Configured public scheduling endpoint `POST /api/public/test-drives` supporting guest form bookings.
  - Built public web page `/test-drive` with selectors for Vehicle, Variant, Branch, preferred date, time slot, and customer consents.
  - Integrated Vehicle Details CTA and Branch CTA presets to redirect with auto-selected queries.
  - Configured tracking parameters (UTM campaign/source/medium, referrer, and landing page URLs).
  - Implemented multi-channel notification architecture hooks (Email confirmations, SMS hooks, WhatsApp templates, and push notifications).
  - Setup local DB `CalendarEvent` logs (Appointment, Reminder, Completion) and clean interfaces for Google Calendar and Microsoft Outlook synchronization.
* **Milestone M01 Core Foundation**: Initialized Next.js project with TailwindCSS and custom configuration.
* **Milestone M02 Authentication**: Implemented single-admin secure HTTP-only cookies token generation.
* **Milestone M03 User Management**: Configured roles and database profile updates.
* **Milestone M04 Admin Dashboard Shell**: Built admin landing panels and sidebar navigation controls.
* **Milestone M05 Vehicle Management**: Configured main catalog CMS.
  * Extended `Vehicle` schema with `startingPrice`, `bookingAmount`, `sortOrder`, and media fields (`thumbnail`, `gallery`, `brochure`, `youtubeUrl`).
  * Created public vehicle APIs (`GET /api/public/vehicles`, `GET /api/public/vehicles/:slug`) returning aggregated variant data.
  * Standardized dynamic SEO metadata (Open Graph, Twitter Cards, JSON-LD, Canonical URLs) on public vehicle detail pages.
  * Added frontend image gallery sorting and removal management.
* **Milestone M06 Vehicle Variant Management**: Extended variant pricing and spec customization options.
  * Added dynamic `specs` JSON column to model.
  * ImplementedSafety/Comfort/Exterior/Interior/Technology/Performance features.
  * Integrated dimension specifications (Length, Width, Height, Wheelbase, Ground Clearance, Boot Space, Fuel Tank, Tyres, Brakes, Suspension) into Admin CRUD.
  * Configured public SEO APIs (`/api/public/vehicles/:slug/variants` and `/api/public/variants/:slug`) with JSON-LD, Open Graph, and Canonical URL tags.
* **Milestone M07 Vehicle Color Management**: Added real Toyota color swatch selectors and hex swatches.
* **Milestone M07B SEO Architecture Refactor**: Standardized metadata tags and Schema.org JSON-LD structures.
* **Milestone M08 Branch Management**:
  * Database schema extended with required fields (`code`, `city`, `district`, `state`, `pincode`, coordinates, status, manager phone, salesManager, serviceManager, sortOrder).
  * Backend API endpoints configured with Zod schema verification and authentication middleware protection.
  * Tagged database configuration release: `production-db-ready`.
  * Created public Branch APIs (`GET /api/public/branches`, `GET /api/public/branches/:slug`).
  * Built complete Admin Branch CMS dashboard console under `/admin/branches` for full CRUD, search, pagination, and status toggles.
  * Built public directory listings page (`/branches`) and detail pages (`/branches/[slug]`) displaying embedded map previews, manager cards, contact CTAs, and dynamic SEO / JSON-LD schemas.
* **Milestone M09 Lead Management**:
  * Implemented database repository (`leadRepository.ts`) and business services (`leadService.ts`) for lead routing, scoring, sorting, and duplicate prevention.
  * Added production endpoints: public inquiry submission (`POST /api/public/leads`) with IP-based rate limiting and spam filtering, alongside secure admin CRM APIs.
  * Created reusable `LeadForm.tsx` component capturing customer data and UTM/referrer tracking across 6 inquiry forms.
  * Built Admin Lead CRM Dashboard console under `/admin/leads` and details view `/admin/leads/[id]` supporting status transitions, coordinator assignments, bulk actions, and note logs.


