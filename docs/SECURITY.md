# Security Policy & Implementation

This document describes the security protocols, encryption mechanisms, and route-protection configurations deployed in the LT-Booking-V3 project.

---

## 1. Authentication Security

* **Stateless Session Management**: The platform avoids database-backed session storage. Authentication sessions are validated cryptographically using JSON Web Tokens (JWT).
* **JWT Expiration Rules**:
  * **Administrator sessions** expire after **24 hours**.
  * **Customer sessions** expire after **7 days**.
* **Role-Based Access Control (RBAC)**:
  * A central `requireRole(roles: string[])` middleware is enforced across protected backend API endpoints.
  * Requests carrying unauthorized user roles are rejected with a strict HTTP `403 Forbidden` response.
* **Hardened Session Cookies**: JWT session tokens are set as cookies with:
  * `HttpOnly`: Block access from client-side JavaScript APIs to mitigate Cross-Site Scripting (XSS) risks.
  * `Secure`: Transmit tokens exclusively over encrypted HTTPS connections (enabled in production).
  * `SameSite=Strict`: Restrict cookies from being sent on cross-site requests to mitigate CSRF.

---

## 2. Password Policies

* **Password Hashing**: Administrative credentials must be pre-hashed using the **bcrypt** hashing algorithm with a cost factor (salt rounds) of `10`.
* **Zero Plain-Text Storage**: The system never records raw passwords in database structures or environment configuration files.

---

## 3. Network & Infrastructure Hardening

* **Unified Entrypoint Proxy**: All API interactions routing through Next.js and Express are mapped to a secure domain `https://laxmitoyota.co.in/api/*` protected by SSL.
* **SSL/TLS & HTTPS Redirections**: Port `80` (HTTP) requests are redirected to Port `443` (HTTPS) via a `301 Moved Permanently` rule. TLS v1.2 and v1.3 protocols are enforced with secure modern cipher suites.
* **Nginx Reverse Proxy Security Headers**:
  * **HSTS**: `Strict-Transport-Security` header enforces SSL for all subdomains and supports preloading.
  * **Clickjacking Protection**: `X-Frame-Options: DENY` ensures pages cannot be loaded inside frame structures.
  * **MIME Sniffing Prevention**: `X-Content-Type-Options: nosniff` forces browsers to adhere strictly to server-provided MIME content-types.
  * **Referrer Policy**: `Referrer-Policy: strict-origin-when-cross-origin` keeps query params and referrers private on external navigations.
* **Network Firewall Rules (UFW)**: The VPS operating system firewall restricts incoming network requests to only ports `22` (SSH), `80` (HTTP), and `443` (HTTPS).
* **Nginx Request Limiting & Payload Controls**:
  * A Nginx `limit_req_zone` restricts global burst traffic.
  * `client_max_body_size` is limited to **10M** to block oversized payload memory attacks.
  * Backend responses are compressed using `gzip` for optimized bandwidth.
* **Secure SSH Daemon Configuration**: Default root credentials and password-based SSH access are disabled (`PasswordAuthentication no`, `PermitRootLogin no`). Access is granted solely via authorized public keys.
* **PostgreSQL Isolation**: The PostgreSQL engine is bound strictly to local sockets (`listen_addresses = 'localhost'`) and cannot receive public packets on port `5432` / shadow port `5433`.
* **Fail2Ban Intrusion Prevention**: Protects SSH access from brute force cracking by automatically blocking IPs on consecutive connection failures.
* **Automatic Security Patches**: The Ubuntu VPS runs `unattended-upgrades` to automatically install critical operating system security patches.
* **PM2 Process Resilience**: Node processes are managed by PM2 and hooked to the system start service (`pm2 startup`) to ensure immediate recovery on server reboots.

---

## 4. API Security Hardening

To protect the server from request pollution, denial of service (DoS), and information leakage, the following middleware configurations have been applied in `app.ts`:

* **HTTP Security Headers**: Deployed **Helmet** middleware to configure secure HTTP response headers, preventing vulnerabilities such as Clickjacking, MIME type sniffing, and Cross-Site Scripting (XSS).
* **Information Disclosure Prevention**: Disabled the `X-Powered-By` header using `app.disable("x-powered-by")` to prevent attackers from fingerprinting the Node/Express runtime environment.
* **Payload Limits**: Strict maximum size limits are set at **50kb** for both JSON (`express.json`) and URL-encoded (`express.urlencoded`) request bodies to block huge payload attacks.
* **Response Compression**: Integrated **Compression** middleware to optimize bandwidth utilization by gzipping API response payloads.
* **Proxy Trust**: Configured `app.set("trust proxy", 1)` to accurately determine client IP addresses behind the front-facing Nginx load balancer.
* **CORS Access Rules**: Configured `cors` middleware with custom origin verification, validating incoming requests against environment-approved domains stored in `ALLOWED_ORIGINS` / `FRONTEND_URL`.

---

## 5. API Rate Limiting

To mitigate brute force attempts and DDoS, rate limits have been enforced using `express-rate-limit`. Exceeding these windows triggers a HTTP `429 Too Many Requests` status code.

| Target Endpoints | Rate Limit Window | Max Requests | Response Message |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | 15 minutes | 10 | "Too many login attempts. Please try again in 15 minutes." |
| `/api/public/leads` | 1 minute | 5 | "Too many lead submissions. Please try again in a minute." |
| `/api/test-drives` / `/api/public/test-drives` | 1 minute | 5 | "Too many test drive requests. Please try again in a minute." |
| `/api/bookings` | 1 minute | 5 | "Too many booking requests. Please try again in a minute." |

---

## 6. Production Error Handling

* Unhandled exceptions and errors are caught by a centralized error handling middleware.
* In **production** environment (`process.env.NODE_ENV === "production"`), the middleware suppresses detailed stack traces (`stack` parameters) and returns generic `"Internal server error"` messages, preventing database schema or backend filepath leakage.

---

## 7. Log Security & Data Protection

* **Zero-Leak Logging Policy**: The application strictly prohibits logging sensitive variables, parameters, or configurations. Specifically:
  * Raw user passwords or hashes are never printed or written to files.
  * Cryptographic secrets (such as JWT keys) and environment variables are never logged.
  * Payment gateways or other transaction-specific tokens/secrets are never printed in console or process logs.
* **PII Masking**: Customer Personal Identifiable Information (PII) including Name, Email, and Phone is obfuscated inside system-level logs (e.g. notifications and audit logs) using helper masking techniques to secure user privacy in the server logs (e.g., `srv1749249.hstgr.cloud` auth/PM2 logs).
* **Error Sanitization**: All controller catching logic filters and maps database-specific context (like `Prisma` engine messages) to non-sensitive messages before responding to client requests, avoiding technical metadata disclosures.
* **Backup Access Isolation**: Database backups are executed using PostgreSQL local socket connections without hardcoding passwords in backup cron scripts or system variables.

---

## 8. Dependency Security Audit

A comprehensive package vulnerability and update audit is performed regularly across both backend and frontend environments:

### A. Backend Package Audit
* **Vulnerability Status**: `0` vulnerabilities found.
* **Intentionally Unchanged Packages**:
  * `prisma` & `@prisma/client` (`5.22.0`): Pinned to version `5.22.0` (Latest: `7.8.0`) to avoid schema compatibility issues, migration engine shifts, and potential runtime queries regression.
  * `express` (`4.22.2`): Pinned to version `4.22.2` (Latest: `5.2.1`) to ensure middleware compatibility and stable TypeScript routing types.
  * `typescript` (`5.9.3`): Maintained at matching levels to prevent compiler flag changes.

### B. Frontend Package Audit
* **Vulnerability Status**: `2` moderate severity vulnerabilities found.
  * **Vulnerability Source**: `postcss` (< `8.5.10`) - XSS via Unescaped `</style>` in CSS Stringify Output.
  * **Impact**: Included transitively via the Next.js `next` framework packages.
* **Intentionally Unchanged Packages**:
  * `next` (`15.5.19`): Pinned to version `15.5.19` (Latest: `16.2.9`) to protect Next.js 15 routing structures, page builds, and App Router rendering pipelines from breaking.
  * `react` & `react-dom` (`19.1.0`): Maintained at version `19.1.0` (Latest: `19.2.7`) to match Next.js 15 runtime compatibility matrices.
* **Remediation Strategy**: Upgrade actions for Next.js and React are deferred until minor, verified non-breaking patches are certified.

---

## 9. Production Security Verification Status (2026-06-26)

The following verifications were successfully run and passed prior to final production hardening checkout:

* **Backend Build (`npm run build`)**: PASS (Verified TypeScript compilations and strict types stability)
* **Frontend Build (`npm run build`)**: PASS (Verified Next.js 15 App Router production builds and ESLint compliance)
* **Prisma Schema Validation (`npx prisma validate`)**: PASS (Verified database model schemas and client consistency)
* **Dependency Vulnerability Audit (`npm audit`)**:
  * **Backend**: PASS (0 vulnerabilities)
  * **Frontend**: Audited (2 moderate-risk transitive postcss vulnerabilities managed via version locking)
* **API Rate Limiting & Helmet Headers**: PASS (Verified protection boundaries on login, leads, and test drive modules)


