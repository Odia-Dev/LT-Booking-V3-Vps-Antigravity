# API Contracts Specification

This document details the HTTP REST API endpoints exposed by the LT-Booking-V3 backend application.

---

## 1. Authentication Services (`/api/auth`)

### POST `/api/auth/register` (Admin Initialization)
* **Description**: Create the initial admin account (restricted by email matching environment key).
* **Payload**:
  ```json
  {
    "email": "admin@laxmitoyota.co.in",
    "password": "secure_password",
    "name": "Super Admin"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Admin user registered successfully"
  }
  ```

### POST `/api/auth/login`
* **Description**: Authenticate admin credentials and set signed cookie token.
* **Payload**:
  ```json
  {
    "email": "admin@laxmitoyota.co.in",
    "password": "secure_password"
  }
  ```
* **Response (200 OK)**: Sets HTTP-Only Cookie `admin_session` and returns:
  ```json
  {
    "success": true,
    "message": "Authenticated successfully"
  }
  ```

### POST `/api/auth/logout`
* **Description**: Clear session cookies.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### GET `/api/auth/me`
* **Description**: Retrieve current authenticated session info.
* **Headers**: Requires valid `admin_session` cookie.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "admin-uuid",
      "email": "admin@laxmitoyota.co.in",
      "name": "Super Admin",
      "role": "ADMIN"
    }
  }
  ```

---

## 2. Vehicle Catalog Services (`/api/vehicles` & `/api/admin/vehicles`)

### GET `/api/vehicles` (Public List)
* **Description**: Query all active vehicle models.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicles": [
      {
        "id": "vehicle-uuid",
        "name": "Urban Cruiser Hyryder",
        "slug": "urban-cruiser-hyryder",
        "category": "SUV",
        "description": "Strong Hybrid technology...",
        "heroImage": "https://...",
        "status": "ACTIVE"
      }
    ]
  }
  ```

### POST `/api/admin/vehicles` (Protected Create)
* **Description**: Add a new vehicle model.
* **Response (210 Created)**:
  ```json
  {
    "success": true,
    "message": "Vehicle created successfully",
    "vehicle": { ... }
  }
  ```

---

## 3. Branch Management Services (`/api/branches` & `/api/admin/branches`)

### GET `/api/branches` (Public List)
* **Description**: Returns all dealership branches active in the system.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "branches": [
      {
        "id": "uuid",
        "name": "Berhampur Showroom",
        "code": "BRH01",
        "address": "NH-16 Bypass Road",
        "city": "Berhampur",
        "district": "Ganjam",
        "state": "Odisha",
        "pincode": "760001",
        "phone": "+91 94370 12345",
        "email": "berhampur@laxmitoyota.co.in",
        "googleMapsUrl": "https://maps.google.com/...",
        "workingHours": "9:00 AM - 7:00 PM",
        "status": "ACTIVE"
      }
    ]
  }
  ```

### GET `/api/branches/:id` (Public Detail)
* **Description**: Retrieve detailed records of a specific branch.

### POST `/api/admin/branches` (Protected Create)
* **Payload**:
  ```json
  {
    "name": "Jeypore Showroom",
    "code": "JYP01",
    "address": "Jeypore Main Road",
    "city": "Jeypore",
    "district": "Koraput",
    "state": "Odisha",
    "pincode": "764001",
    "phone": "+91 94370 54321",
    "email": "jeypore@laxmitoyota.co.in",
    "googleMapsUrl": "https://maps.google.com/...",
    "workingHours": "9:00 AM - 7:00 PM",
    "managerName": "Suresh Kumar",
    "managerPhone": "+91 98765 01234",
    "status": "ACTIVE"
  }
  ```

### PUT `/api/admin/branches/:id` (Protected Edit)
* **Description**: Update fields of a specific branch. Accepts partial payloads.

### DELETE `/api/admin/branches/:id` (Protected Archive/Delete)
* **Description**: Remove a branch from the database physically.
