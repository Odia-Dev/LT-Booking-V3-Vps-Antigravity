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
* **Firewall Rules (UFW)**: The production server denies all incoming traffic except port `80` (HTTP), `443` (HTTPS), and `22` (SSH).

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
