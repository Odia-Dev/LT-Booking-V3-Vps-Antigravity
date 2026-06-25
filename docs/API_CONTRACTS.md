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

### GET `/api/branches/slug/:slug` (Public Slug Detail)
* **Description**: Retrieve detailed records of a specific branch by its unique slug.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "branch": {
      "id": "uuid",
      "name": "Berhampur Showroom",
      "slug": "berhampur-showroom",
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
      "status": "ACTIVE",
      "salesManager": "Manoj Patnaik",
      "serviceManager": "Arakhita Das",
      "sortOrder": 1
    }
  }
  ```

### PUT `/api/admin/branches/:id` (Protected Edit)
* **Description**: Update fields of a specific branch. Accepts partial payloads.

### PATCH `/api/admin/branches/:id/status` (Protected Status Update)
* **Description**: Toggle branch status (ACTIVE, INACTIVE, ARCHIVED).
* **Payload**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```

### DELETE `/api/admin/branches/:id` (Protected Archive/Delete)
* **Description**: Soft delete/archive a branch by updating its status to ARCHIVED.

---

## 3b. Public Branch APIs (`/api/public/branches`)

### GET `/api/public/branches`
* **Description**: Returns all active public branches in the system, sorted by `sortOrder` ascending.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "branches": [
      {
        "id": "uuid",
        "name": "Berhampur Showroom",
        "slug": "berhampur-showroom",
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
        "status": "ACTIVE",
        "salesManager": "Manoj Patnaik",
        "serviceManager": "Arakhita Das",
        "sortOrder": 1
      }
    ]
  }
  ```

### GET `/api/public/branches/:slug`
* **Description**: Retrieves active branch details by unique slug.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "branch": {
      "id": "uuid",
      "name": "Berhampur Showroom",
      "slug": "berhampur-showroom",
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
      "status": "ACTIVE",
      "salesManager": "Manoj Patnaik",
      "serviceManager": "Arakhita Das",
      "sortOrder": 1
    }
  }
  ```

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

---

## 6. Lead Management APIs (`/api/leads`)

### POST `/api/leads` (Public Inquiry Submission)
* **Description**: Submits a customer lead/inquiry. Does not require authentication.
* **Request Body**:
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun@gmail.com",
    "phone": "9876543210",
    "type": "TEST_DRIVE",
    "source": "ORGANIC",
    "notes": "Interested in Hyryder Strong Hybrid",
    "branchId": "branch-uuid",
    "variantId": "variant-uuid",
    "campaign": "Summer-Offer",
    "medium": "Social",
    "message": "Custom contact message"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lead created successfully",
    "lead": {
      "id": "lead-uuid",
      "name": "Arun Kumar",
      "email": "arun@gmail.com",
      "phone": "9876543210",
      "type": "TEST_DRIVE",
      "status": "NEW",
      "source": "ORGANIC",
      "notes": "{\"campaign\":\"Summer-Offer\",\"medium\":\"Social\",\"message\":\"Custom contact message\",\"leadScore\":75,\"priority\":\"HIGH\"}",
      "branchId": "branch-uuid",
      "variantId": "variant-uuid",
      "createdAt": "2026-06-26T00:00:00.000Z",
      "updatedAt": "2026-06-26T00:00:00.000Z"
    }
  }
  ```


### POST `/api/public/leads` (Production Public Submission)
* **Description**: Submits a customer lead/inquiry with duplicate checking, rate limiting, and spam keyword protections. Triggers notifications (Email, Admin, Webhook, and WhatsApp hooks).
* **Request Body**: (Same format as POST `/api/leads`)
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lead created successfully",
    "lead": {
      "id": "lead-uuid",
      "name": "Arun Kumar",
      "email": "arun@gmail.com",
      "phone": "9876543210",
      "type": "TEST_DRIVE",
      "status": "NEW"
    }
  }
  ```
* **Response (429 Too Many Requests)**:
  ```json
  {
    "success": false,
    "message": "Too many requests. Please try again in a minute."
  }
  ```
* **Response (400 Bad Request - Spam)**:
  ```json
  {
    "success": false,
    "message": "Request flagged as spam"
  }
  ```

### GET `/api/leads` (Protected Admin Lead CRM Console)
* **Description**: Returns paginated list of leads with support for filtering, search, and date ranges.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Query Parameters**:
  * `status`: Filter by status (`NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  * `source`: Filter by source (`ORGANIC`, `GOOGLE_ADS`, `META_ADS`).
  * `type`: Filter by type (`TEST_DRIVE`, `SERVICE`, `FINANCE`, `EXCHANGE`, `GENERAL`).
  * `search`: Matches query string against name, email, or phone.
  * `page`: Page number (default: 1).
  * `limit`: Page limit (default: 10).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "lead-uuid",
        "name": "Arun Kumar",
        "email": "arun@gmail.com",
        "phone": "9876543210",
        "type": "TEST_DRIVE",
        "status": "NEW"
      }
    ],
    "total": 1
  }
  ```

### GET `/api/leads/:id` (Protected Admin Detail Lookup)
* **Description**: Retrieves full lead details by ID.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "lead": {
      "id": "lead-uuid",
      "name": "Arun Kumar",
      "email": "arun@gmail.com",
      "phone": "9876543210",
      "type": "TEST_DRIVE",
      "status": "NEW",
      "notes": "{...}"
    }
  }
  ```

### PUT `/api/leads/:id` (Protected Admin Lead Edit)
* **Description**: Updates lead parameters.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Request Body**:
  ```json
  {
    "name": "Arun Kumar Edit",
    "status": "IN_PROGRESS"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead updated successfully",
    "lead": {
      "id": "lead-uuid",
      "name": "Arun Kumar Edit",
      "status": "IN_PROGRESS"
    }
  }
  ```

### PATCH `/api/leads/:id/status` (Protected Admin Status Change)
* **Description**: Changes the lead status.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Request Body**:
  ```json
  {
    "status": "COMPLETED"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead status updated successfully"
  }
  ```

### PATCH `/api/leads/:id/assign` (Protected Admin Assign Lead)
* **Description**: Assigns the lead to a sales executive.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Request Body**:
  ```json
  {
    "executiveName": "Suresh Mohanty"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead assigned successfully"
  }
  ```

### DELETE `/api/leads/:id` (Protected Admin Soft Delete)
* **Description**: Soft deletes the lead by setting its status to `CANCELLED`.
* **Headers**: `Cookie: token=<admin-jwt>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead deleted successfully"
  }
  ```

---

## 7. Test Drive Management APIs (`/api/test-drives`)

All endpoints below require authentication.

### GET `/api/test-drives` (Protected Listing)
* **Description**: Returns all scheduled test drives with pagination, filters, and search.
* **Query Parameters**:
  * `status`: Filter by status (`REQUESTED`, `CONFIRMED`, `COMPLETED`, `BOOKED`, `CANCELLED`, `NO_SHOW`).
  * `branchId`: Filter by physical branch showroom.
  * `search`: Searches by customer name, phone, email, assigned coordinator, or readable TD ID.
  * `startDate` & `endDate`: Filter by appointment range.
  * `customerId`: List all appointments for specific customer.
  * `vehicleId`: List appointments for specific vehicle model.
  * `executiveName`: List appointments assigned to specific sales manager.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "td-uuid",
        "testDriveId": "TD-2026-0001",
        "customerId": "user-uuid",
        "vehicleId": "vehicle-uuid",
        "variantId": "variant-uuid",
        "branchId": "branch-uuid",
        "preferredDate": "2026-06-28T10:00:00.000Z",
        "preferredTime": "10:00 AM - 11:30 AM",
        "status": "REQUESTED",
        "assignedExecutive": "Unassigned"
      }
    ],
    "total": 1
  }
  ```

### GET `/api/test-drives/:id` (Protected Details)
* **Description**: Returns complete test drive details.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "appointment": {
      "id": "td-uuid",
      "testDriveId": "TD-2026-0001",
      "customerId": "user-uuid",
      "vehicleId": "vehicle-uuid",
      "variantId": "variant-uuid",
      "branchId": "branch-uuid",
      "preferredDate": "2026-06-28T10:00:00.000Z",
      "preferredTime": "10:00 AM - 11:30 AM",
      "status": "REQUESTED",
      "assignedExecutive": "Unassigned"
    }
  }
  ```

### POST `/api/test-drives` (Protected Schedule creation)
* **Description**: Schedules a new test drive appointment. Requires customer profile checks and prevents double bookings.
* **Request Body**:
  ```json
  {
    "customerId": "user-uuid",
    "vehicleId": "vehicle-uuid",
    "variantId": "variant-uuid",
    "branchId": "branch-uuid",
    "preferredDate": "2026-06-28T10:00:00.000Z",
    "preferredTime": "10:00 AM - 11:30 AM",
    "notes": "Prefer strong hybrid model"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Test drive scheduled successfully",
    "appointment": {
      "id": "td-uuid",
      "testDriveId": "TD-2026-0001",
      "status": "REQUESTED"
    }
  }
  ```

### PUT `/api/test-drives/:id` (Protected Edit)
* **Description**: Updates appointment fields.
* **Request Body**:
  ```json
  {
    "preferredTime": "1:00 PM - 2:30 PM",
    "notes": "Updated remarks"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Appointment updated successfully",
    "appointment": {
      "id": "td-uuid",
      "preferredTime": "1:00 PM - 2:30 PM"
    }
  }
  ```

### PATCH `/api/test-drives/:id/status` (Protected Status Transition)
* **Description**: Updates appointment status.
* **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Appointment status updated successfully"
  }
  ```

### PATCH `/api/test-drives/:id/assign` (Protected Executive Allocation)
* **Description**: Assigns executive to lead the drive.
* **Request Body**:
  ```json
  {
    "executiveName": "Suresh Mohanty"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Executive assigned successfully"
  }
  ```

### DELETE `/api/test-drives/:id` (Protected Cancel Appointment)
* **Description**: Cancels appointment status.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Test drive cancelled successfully"
  }
  ```
