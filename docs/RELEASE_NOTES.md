# Release Notes

This document logs git release tags and production deploy branches history.

---

## Production Release Tags

### `v1.2.0-m14-delivery-ready` (2026-06-27)
* **Goal**: Release the complete Delivery Management module (M14) covering backend handover infrastructure, 10-item checklist enforcement, admin dashboards, customer tracking portal, multi-channel notifications, and secure document uploads.
* **Commit**: `feat(m14): production ready`
* **Details**:
  - Extended Prisma schema with `Delivery`, `DeliveryChecklist`, `DeliveryTimeline`, and `DeliveryDocument` models with cascade relations to `Booking`, `User`, `Vehicle`, `Variant`, and `Branch`.
  - Built `deliveryRepository.ts` and `deliveryService.ts` managing 5-state lifecycle (`SCHEDULED → PREPARED → READY → DELIVERED / CANCELLED`) with mandatory 10-item checklist gate enforcement.
  - Deployed 7 secured REST API endpoints at `/api/deliveries` with Zod validation, pagination, full-text search, and role-based access control.
  - Implemented `PATCH /api/deliveries/:id/checklist` with milestone diff detection to fire targeted notifications only when specific items transition false → true.
  - Built Admin Delivery Dashboard (`/admin/deliveries`, `/admin/deliveries/[id]`) featuring interactive checklist checkboxes, status lifecycle dropdown, bulk update operations, and delivery schedule overlay modal.
  - Built Customer Delivery Tracking page (`/dashboard/delivery`) with an 8-step visual milestone progress tracker, scheduled date display, branch contact information, and multi-delivery dropdown selector.
  - Created `DeliveryNotificationService` dispatching Email, SMS, and WhatsApp alerts at 6 lifecycle trigger points with per-channel `NotificationLog` entries (with `deliveryId`) and portal `Notification` alerts.
  - Implemented secure Multer-based document upload system: per-delivery disk storage at `uploads/delivery/<id>/`, 10MB limit, PDF/JPEG/PNG/WEBP supported, metadata persisted in `DeliveryDocument` table.
  - Added typed multer error handlers (413/400/415) and served `uploads/` via Express static with `noSniff` header.
  - Verified zero-error TypeScript backend compile (`npx tsc --noEmit`), zero-error Next.js frontend build (32 routes), and Prisma schema validation.

### `v1.1.0-m13-customer-dashboard-ready` (2026-06-27)
* **Goal**: Release the production-grade Customer Dashboard module (M13) including layout shell, session authentication, profile editor, delivery status tracking timeline, invoice receipts list, Razorpay failed payment retries, notification center, and access-control security hardening.
* **Commit**: `feat(m13): production ready`
* **Details**:
  - Implemented responsive Customer Portal Shell layout with mobile menu header, sidebar navigation, and breadcrumb indicators.
  - Setup customer profile management with editable addresses, dealership branch selectors, and checkboxes for subscription channels.
  - Extended Prisma `User` schema with profile fields and established relation mappings with `Branch`.
  - Added new `Notification` model to Prisma schema supporting read/unread indicators linked to user records.
  - Built detailed vehicle delivery status tracking timeline showing booking progress stages (Created, Paid, Confirmed, Allocated, PDI, Ready for Delivery, Delivered).
  - Deployed payments invoice list and detail view supporting dynamically loaded Razorpay checkout retry overlays for failed/pending transactions.
  - Setup paginated, filterable, and searchable Notification Center enabling customers to mark alerts as read.
  - Hardened APIs with `dashboardLimiter` rate-limiting (60 req/min) and ownership checks preventing ID enumeration attacks.
  - Verified and passed backend compiler compilation and frontend Next.js production builds.

### `v1.0.0-m12-razorpay-ready` (2026-06-26)
* **Goal**: Release the production-grade Razorpay payment integration, including order creation, dynamic checkout scripting, cryptographically verified signature callbacks, async webhooks processing, refund tracking, and event-driven notifications.
* **Commit**: `feat(m12): production ready`
* **Details**:
  - Configured backend schema models (`Payment` & `PaymentAudit`) to register and monitor online transactions lifecycle history.
  - Implemented backend Repository and Services to initialize Razorpay SDK, verify signatures via SHA-256 HMAC buffers, and log mock refund details.
  - Deployed REST API controllers and routes (`/api/payments/*` and `/api/public/payments/*`) protected by RBAC checking.
  - Upgraded public checkout forms (`/book-online`) to dynamically load checkout overlays, verify payment responses, and present success/failed screen transitions with retry capabilities.
  - Deployed secure webhook receiver (`POST /api/webhooks/razorpay`) verifying signature hashes, capturing events (captured, failed, order paid, refund processed), and validating idempotency via payload hash audits.
  - Integrated notification dispatches (Email, SMS, WhatsApp alerts) across all transaction outcomes.
  - Verified compilation build safety and prisma schema checks.

### `v1.0.0-m11-booking-engine-ready` (2026-06-26)
* **Goal**: Launch the complete public Online Booking Engine experience, CRM booking consoles, payment/booking status lifecycles, and event-driven logging notification hooks.
* **Commit**: `feat(m11): production ready`
* **Details**:
  - Rewrote database model schema for `Booking` with relational references to Catalog elements, User customer profile, and optional inquiry dependencies.
  - Implemented monthly sequential, atomic, and concurrency-safe Unique Booking ID generation (`LT-YYYYMM-000001`).
  - Implemented backend Repository and Services supporting paginated list queries, date/branch filters, status updates, and cancellation flow.
  - Deployed secure controller endpoints protected by RBAC checking (Admins have full CRUD, Executives can only read assigned bookings and edit status/notes, Customers can only manage their own bookings).
  - Deployed public booking checkout forms (`/book-online` and `/book-online/[vehicle]`) tracking UTM metadata, auto-generating user profiles, and rendering transaction info.
  - Built comprehensive Admin Booking Management CRM dashboard (`/admin/bookings` and `/admin/bookings/[id]`) with timeline activity logs and bulk updates.
  - Deployed transaction notifications mapping (`booking.created`, `booking.confirmed`, `booking.cancelled`, `booking.payment_success`, `booking.payment_failed`) with database log audits.
  - Verified and passed backend compiler compilation and frontend Next.js production builds.

### `v1.0.0-s01-security-ready` (2026-06-26)
* **Goal**: Audit, harden, and verify the production security of the LT-Booking-V3 platform, including API middlewares, role-based authorization guards, log PII masking, Nginx reverse proxy headers, and dependency vulnerabilities.
* **Commit**: `security(s01): production security hardening`
* **Details**:
  - Configured backend security middlewares (`helmet`, `express-rate-limit`, `cors`, and `compression`) to block DDoS, Clickjacking, MIME sniffing, and information disclosure.
  - Implemented role-based access control (RBAC) via `requireRole(["ADMIN"])` middleware to restrict critical admin routes (leads, test drives, branch CMS, variants, vehicles).
  - Hardened session cookies to `SameSite=Strict`, `httpOnly`, and `secure` for all admin/customer validation paths.
  - Masked customer PII (Name, Email, Phone) in console outputs and server process logs.
  - Documented VPS configurations (SSH key authorization, local-only PostgreSQL network isolation, Fail2Ban, unattended OS security updates, and PM2 boot recovery).
  - Audited dependency security states and documented package pins (Next.js 15, React 19, Prisma 5, Express 4) for stability.
  - Verified and passed backend/frontend compilations (`npm run build`) and Prisma schema validation (`npx prisma validate`).

### `v1.0.0-m10-production-ready` (2026-06-26)
* **Goal**: Launch the complete public Test Drive booking experience, dynamic CRM administrative consoles, notification hooks, and calendar scheduling support.
* **Commit**: `feat(m10): production ready`
* **Details**:
  - Implemented backend Repository, Services, and REST controllers for Test Drive Scheduling with slot checks and duplicate prevention.
  - Setup public API endpoint `POST /api/public/test-drives` for guest form submissions.
  - Created public web page `/test-drive` with selectors for Vehicle, Variant, Branch, preferred date, time slot, and customer consents.
  - Connected Vehicle Details CTA (`/test-drive?vehicle=${vehicle.slug}`) and Branch CTA (`/test-drive?branch=${branch.id}`) presets.
  - Stored tracking metadata parameters (UTM campaign/source/medium, referrer, and landing page URLs).
  - Deployed multi-channel notification architecture hooks (Email, SMS, WhatsApp templates, and push notifications).
  - Implemented local DB `CalendarEvent` logs (Appointment, Reminder, Completion) and clean interfaces for Google Calendar and Microsoft Outlook synchronization.
  - Passed complete verification checks, database schema validate, and Next.js production builds.

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

 
 # #   R e l e a s e :   M o d u l e   1 5   ( F i n a n c e   M a n a g e m e n t )  
 # # #   H i g h l i g h t s  
 -   F u l l   v e h i c l e   f i n a n c e   l i f e c y c l e   i n c l u d i n g   t r a c k i n g ,   d o c u m e n t   u p l o a d s ,   a n d   d y n a m i c   s t a t u s   p i p e l i n e s .  
 -   N o t i f i c a t i o n s   v i a   E m a i l ,   S M S ,   a n d   W h a t s A p p   u p o n   l o a n   a p p r o v a l ,   r e j e c t i o n ,   a n d   d i s b u r s e m e n t .  
 -   S t r i c t   R B A C   c o n t r o l l i n g   a p p l i c a t i o n   a c c e s s   f o r   C u s t o m e r s ,   F i n a n c e   E x e c u t i v e s ,   a n d   A d m i n s .  
 