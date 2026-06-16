# Development Roadmap

This roadmap breaks down the build process for the Laxmi Toyota Platform V3. Each phase corresponds to a specific milestone. A local commit must be made at the completion of each phase before proceeding.

---

## Git Branch Strategy
* **Current Working Branch**: `auth-setup`
* All development starts on `auth-setup` to implement the custom single-admin authentication flow. Once verified, it will be merged into the main development branch.

---

## Phase Breakdown

### Phase 1: Authentication & Base Project Configuration (Current Phase)
* **Goal**: Establish the Next.js 15 project setup, shadcn/ui theme config, and custom admin authentication.
* **Tasks**:
  1. Initialize Next.js 15 template with TypeScript, Tailwind, and ESLint.
  2. Install and configure Prisma ORM with PostgreSQL.
  3. Implement custom single-admin authentication using HTTP-only cookies (signed/encrypted JWT or session token).
  4. Create `/admin/login` page and auth middleware protection for `/admin/*` routes.
  5. Add credentials verification logic using environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
* **Verification**: Verify Next.js build and lint. Run local server and test login/logout flow.

### Phase 2: Database Schema & Core CMS Entities
* **Goal**: Define schemas and create the Admin Dashboard shells.
* **Tasks**:
  1. Define database schemas in `schema.prisma` (Branch, Vehicle, Color, Variant, Lead, Booking).
  2. Run migrations and verify table creation.
  3. Build layout for the Admin Dashboard (`/admin/dashboard`).
  4. Create database seed scripts to populate initial settings and branches.

### Phase 3: Vehicle & Branch CMS
* **Goal**: Build CMS features to manage vehicle models and branch details.
* **Tasks**:
  1. Implement Cloudinary widget or API route for image uploads.
  2. Build `/admin/vehicles` for Vehicle CRUD (price, specs, variants, brochures, color swatches, status).
  3. Build `/admin/branches` for Branch CRUD (address, map URLs, contact, manager details).

### Phase 4: Customer Catalog & SEO Landing Pages
* **Goal**: Create highly optimized, responsive public-facing pages.
* **Tasks**:
  1. Build home page, vehicle listing (with search and filter), and vehicle details.
  2. Implement responsive images (via Cloudinary integration) and lazy loading.
  3. Inject dynamic Schema.org JSON-LD structured data for vehicle product schemas.

### Phase 5: Lead Generation Forms & CRM Panel
* **Goal**: Collect leads and view them in the Admin CRM.
* **Tasks**:
  1. Create lead forms: Test Drive, Service, Finance Inquiry, Exchange Inquiry.
  2. Build `/admin/leads` to list, filter, search, and update lead statuses.
  3. Implement email notifications or WhatsApp notification webhook triggers.

### Phase 6: Payment Gateway Integration
* **Goal**: Implement booking deposit payments.
* **Tasks**:
  1. Integrate Razorpay Checkout SDK.
  2. Integrate ICICI Payment Gateway API as fallback/alternative.
  3. Implement webhook handlers to verify signatures, record transactions, and mark bookings as paid.

### Phase 7: Analytics & SEO Polish
* **Goal**: Integration of tracking scripts and dynamic SEO features.
* **Tasks**:
  1. Add Google Analytics 4, Meta Pixel, and Google Tag Manager.
  2. Generate dynamic `sitemap.xml` and static `robots.txt`.
  3. Set up performance auditing (Core Web Vitals checklist).
