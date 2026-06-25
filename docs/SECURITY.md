# Security Policy & Implementation

This document describes the security protocols, encryption mechanisms, and route-protection configurations deployed in the LT-Booking-V3 project.

---

## 1. Authentication Security

* **Stateless Administration**: The platform avoids session database storage to keep operations lightweight. Sessions are validated cryptographically.
* **HTTP-Only Cookies**: Authentication tokens are signed in JWTs and stored in cookies configured with:
  * `HttpOnly`: Block access from client-side JavaScript APIs (mitigating XSS vulnerabilities).
  * `Secure`: Transmit tokens exclusively over encrypted HTTPS connections.
  * `SameSite=Lax`: Guard against Cross-Site Request Forgery (CSRF).

---

## 2. Password Policies

* **Password Hashing**: Administrative credentials must be pre-hashed using the **bcrypt** hashing algorithm with a salt factor of `10`.
* **Zero Plain-Text Storage**: The system never records raw passwords in database structures or environment files.

---

## 3. Network & Infrastructure Hardening

* **Unified Entrypoint Proxy**: All API interactions routing through Next.js and Express are mapped to a secure domain `https://laxmitoyota.co.in/api/*` protected by SSL.
* **Firewall Rules (UFW)**: The production server denies all incoming traffic except port `80` (HTTP), `443` (HTTPS), and `22` (SSH).
