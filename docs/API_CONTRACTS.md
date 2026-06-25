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

### GET `/api/vehicles/:id` (Public Detail)
* **Description**: Query details for a specific vehicle by database UUID.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicle": {
      "id": "vehicle-uuid",
      "name": "Urban Cruiser Hyryder",
      "slug": "urban-cruiser-hyryder",
      "category": "SUV",
      "description": "Strong Hybrid technology..."
    }
  }
  ```

### GET `/api/vehicles/slug/:slug` (Public Detail)
* **Description**: Query details for a specific vehicle by unique slug.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicle": { ... }
  }
  ```

### POST `/api/admin/vehicles` (Protected Create)
* **Description**: Add a new vehicle model.
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Vehicle created successfully",
    "vehicle": { ... }
  }
  ```

### PUT `/api/admin/vehicles/:id` (Protected Update)
* **Description**: Update details for a specific vehicle by database UUID.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vehicle updated successfully",
    "vehicle": { ... }
  }
  ```

### PATCH `/api/admin/vehicles/:id/status` (Protected Status Update)
* **Description**: Update a specific vehicle status.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vehicle status updated successfully",
    "vehicle": { ... }
  }
  ```

### DELETE `/api/admin/vehicles/:id` (Protected Delete)
* **Description**: Soft delete a specific vehicle by upgrading status to ARCHIVED.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vehicle deleted successfully"
  }
  ```

---

## 2b. Public Vehicle APIs (`/api/public/vehicles`)

### GET `/api/public/vehicles`
* **Description**: Query all active (ACTIVE/UPCOMING) public vehicles. Returns vehicle details sorted by `sortOrder` ascending.
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
        "thumbnail": "https://...",
        "gallery": ["https://..."],
        "brochure": "https://...",
        "youtubeUrl": "https://...",
        "startingPrice": 1114000,
        "bookingAmount": 25000,
        "sortOrder": 1,
        "status": "ACTIVE",
        "seoTitle": "...",
        "seoDescription": "..."
      }
    ]
  }
  ```

### GET `/api/public/vehicles/:slug`
* **Description**: Retrieve active vehicle details by unique slug, including active Variants. Useful for rendering SEO metadata, Open Graph, Twitter Cards, JSON-LD schemas, and canonical links.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicle": {
      "id": "vehicle-uuid",
      "name": "Urban Cruiser Hyryder",
      "slug": "urban-cruiser-hyryder",
      "category": "SUV",
      "description": "Strong Hybrid technology...",
      "heroImage": "https://...",
      "thumbnail": "https://...",
      "gallery": ["https://..."],
      "brochure": "https://...",
      "youtubeUrl": "https://...",
      "startingPrice": 1114000,
      "bookingAmount": 25000,
      "sortOrder": 1,
      "status": "ACTIVE",
      "seoTitle": "...",
      "seoDescription": "...",
      "variants": [
        {
          "id": "variant-uuid",
          "name": "S E-Drive Hybrid",
          "price": 1649000,
          "fuelType": "Hybrid",
          "transmission": "Automatic"
        }
      ]
    }
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

---

## 4. Health Check Service (`/health`)

### GET `/health`
* **Description**: Returns detailed live diagnostics of the backend application and its database connection.
* **Response (200 OK - Healthy)**:
  ```json
  {
    "success": true,
    "application": "LT-Booking-V3",
    "version": "v1.0.0",
    "commit": "ca2bc65",
    "branch": "develop",
    "environment": "production",
    "uptime": 24.5,
    "nodeVersion": "v20.12.2",
    "database": "connected",
    "timestamp": "2026-06-25T13:43:00.000Z"
  }
  ```
* **Response (503 Service Unavailable - Database Down)**:
  ```json
  {
    "success": false,
    "database": "disconnected",
    "timestamp": "2026-06-25T13:43:00.000Z",
    "message": "Database connection failed."
  }
  ```

---

## 5. Public Variant Services (`/api/public`)

### GET `/api/public/vehicles/:slug/variants`
* **Description**: Retrieve variants associated with a vehicle slug.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicle": {
      "id": "vehicle-uuid",
      "name": "Urban Cruiser Hyryder",
      "slug": "urban-cruiser-hyryder",
      "category": "SUV",
      "description": "Strong Hybrid technology...",
      "heroImage": "https://...",
      "status": "ACTIVE"
    },
    "variants": [
      {
        "id": "variant-uuid",
        "vehicleId": "vehicle-uuid",
        "name": "V AT",
        "price": 2019000,
        "fuelType": "Hybrid",
        "transmission": "Automatic",
        "seating": 5,
        "status": "ACTIVE"
      }
    ]
  }
  ```

### GET `/api/public/variants/:slug`
* **Description**: Retrieve variant details by slug with SEO headers and JSON-LD schema metadata.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "vehicle": {
      "id": "vehicle-uuid",
      "name": "Urban Cruiser Hyryder",
      "slug": "urban-cruiser-hyryder",
      "category": "SUV",
      "description": "Strong Hybrid technology...",
      "heroImage": "https://...",
      "status": "ACTIVE"
    },
    "variant": {
      "id": "variant-uuid",
      "vehicleId": "vehicle-uuid",
      "name": "V AT",
      "price": 2019000,
      "fuelType": "Hybrid",
      "transmission": "Automatic",
      "seating": 5,
      "status": "ACTIVE",
      "specs": {
        "safetyFeatures": ["6 Airbags", "ABS with EBD"],
        "comfortFeatures": ["Ventilated Seats"],
        "length": "4365",
        "width": "1795"
      }
    },
    "features": {
      "safetyFeatures": ["6 Airbags", "ABS with EBD"],
      "comfortFeatures": ["Ventilated Seats"]
    },
    "specifications": {
      "length": "4365",
      "width": "1795"
    },
    "seo": {
      "title": "Urban Cruiser Hyryder V AT - Features & Specifications | Laxmi Toyota",
      "description": "Explore ex-showroom price, booking details, features and full technical specifications for the new Urban Cruiser Hyryder V AT variant at Laxmi Toyota.",
      "canonical": "http://localhost:3000/vehicles/urban-cruiser-hyryder/v-at",
      "openGraph": {
        "title": "Urban Cruiser Hyryder V AT - Features & Specifications | Laxmi Toyota",
        "description": "Explore ex-showroom price, booking details, features and full technical specifications for the new Urban Cruiser Hyryder V AT variant at Laxmi Toyota.",
        "url": "http://localhost:3000/vehicles/urban-cruiser-hyryder/v-at",
        "type": "website",
        "images": [
          {
            "url": "https://...",
            "alt": "Urban Cruiser Hyryder V AT"
          }
        ]
      },
      "jsonLd": {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": "Urban Cruiser Hyryder V AT",
        "description": "Explore ex-showroom price, booking details, features and full technical specifications for the new Urban Cruiser Hyryder V AT variant at Laxmi Toyota.",
        "image": "https://...",
        "brand": {
          "@type": "Brand",
          "name": "Toyota"
        },
        "offers": {
          "@type": "Offer",
          "price": 2019000,
          "priceCurrency": "INR",
          "url": "http://localhost:3000/vehicles/urban-cruiser-hyryder/v-at",
          "availability": "https://schema.org/InStock"
        },
        "vehicleEngine": {
          "@type": "EngineSpecification",
          "fuelType": "Hybrid"
        }
      }
    }
  }
  ```

