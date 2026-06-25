# Coding Standards

This document defines the coding standards, patterns, and principles to adhere to when developing features for the LT-Booking-V3 project.

---

## 1. Backend Standards (TypeScript & Express)

* **Design Pattern**: Feature-based modular structure (`src/modules/<feature>`).
* **Layers separation**:
  * **Validation Layer** (`*Validation.ts`): Built with Zod schemas to ensure input sanitization.
  * **Repository Layer** (`*Repository.ts`): Interacts directly with database models using Prisma client queries.
  * **Service Layer** (`*Service.ts`): Handles business logic, checks conditions, calls repository methods, and manages data formats.
  * **Controller Layer** (`*Controller.ts`): Processes HTTP requests, extracts parameters, invokes service logic, handles error try-catch blocks, and sends JSON response payloads.
* **Error Handling**: Follows standard try-catch blocks. Do not expose internal database error details to clients; log errors using `console.error` and return `{ success: false, message: "..." }`.

---

## 2. Frontend Standards (Next.js & TailwindCSS)

* **Architecture**: Next.js App Router structure.
* **Styling**: Vanilla CSS or TailwindCSS/PostCSS (depending on component rules). Avoid ad-hoc utility styles where generic class definitions exist.
* **Client Components**: Restrict client rendering to dynamic components using `"use client"` statements. Keep pages clean.
* **SEO & Layout**: Each route page must contain descriptive SEO tags, metadata, and JSON-LD schemas where applicable.
