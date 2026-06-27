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

---

## 8. Test Drive Notification & Calendar Event System Architecture

### 8.1 Notification Delivery Systems
The Test Drive module triggers automated alerts across multiple channels upon scheduling, confirming, or updating appointments:

* **Email Confirmation**: Sends HTML/text confirmation detailing the model, variant, showroom location, date, and selected time slot.
* **SMS Gateway Hook**: Dispatches transactional SMS reminders specifying the Test Drive Ref ID, driver license requirements, and showroom contact info.
* **WhatsApp Cloud API Hook**: Sends structured templates (`test_drive_confirmation`) with interactive quick-replies (e.g., reschedule, cancel).
* **Push Notification Hook**: Triggers silent/visible web pushes to registered customer browsers and native app views.

### 8.2 Calendar Synchronization Contracts
To facilitate executive scheduling and customer diaries, the system persists calendar states locally and prepares hooks for external providers (Google Calendar, Microsoft Outlook):

#### 8.2.1 Event Types
1. **APPOINTMENT**: Created when a slot is booked. Set as a 60-minute duration block.
2. **REMINDER**: Created 24 hours prior to the appointment.
3. **COMPLETION**: Logged immediately when the status changes to `COMPLETED`.

#### 8.2.2 Service Provider Mocks & Interfaces
Future external synchronization is built on the `ICalendarProvider` interface, allowing hot-swapping between `GoogleCalendarProvider` and `OutlookCalendarProvider`.
Local DB stores state in the `CalendarEvent` table with the following schema contract:
```json
{
  "id": "event-uuid",
  "testDriveId": "td-uuid",
  "type": "APPOINTMENT | REMINDER | COMPLETION",
  "title": "Test Drive Appointment: TD-2026-0001",
  "description": "Text details with vehicle specifications...",
  "eventDate": "2026-06-28T10:00:00.000Z",
  "provider": "LOCAL | GOOGLE | OUTLOOK | GOOGLE_OUTLOOK_MOCK",
  "externalId": "gcal-id|outlook-id",
  "status": "PENDING | SYNCED | COMPLETED | CANCELLED"
}
```

---

## 9. Online Booking Engine Services (`/api/bookings`)

All bookings endpoints require a valid session via `admin_session` cookie.

### GET `/api/bookings`
* **Description**: Retrieve list of bookings with paginated search filters.
* **Access Rules**: 
  * `ADMIN`: Reads all bookings.
  * `SALES_EXECUTIVE`: Reads only bookings where `assignedExecutive` matches their identifier.
  * `CUSTOMER`: Reads only their own bookings.
* **Query Parameters**:
  * `status`: filter by booking status (e.g. `CONFIRMED`)
  * `paymentStatus`: filter by payment status (e.g. `SUCCESS`)
  * `branchId`: UUID filter
  * `vehicleId`: UUID filter
  * `customerId`: UUID filter
  * `search`: text query (searches bookingId, notes, customer details, vehicle name)
  * `startDate` / `endDate`: date range ISO string filters
  * `page` (default `1`) / `limit` (default `10`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "booking-uuid",
        "bookingId": "LT-202606-000001",
        "customerId": "user-uuid",
        "leadId": "lead-uuid",
        "testDriveId": null,
        "vehicleId": "vehicle-uuid",
        "variantId": "variant-uuid",
        "branchId": "branch-uuid",
        "bookingAmount": 25000,
        "paymentGateway": "RAZORPAY",
        "paymentId": "pay_XYZ123",
        "orderId": "order_ABC456",
        "paymentStatus": "PENDING",
        "bookingStatus": "INITIATED",
        "assignedExecutive": null,
        "notes": "Premium color selection",
        "createdAt": "2026-06-26T12:00:00.000Z",
        "updatedAt": "2026-06-26T12:00:00.000Z"
      }
    ],
    "total": 1
  }
  ```

### GET `/api/bookings/:id`
* **Description**: Get booking by database UUID.
* **Access Rules**: Admin, Assigned Executive, or Owner Customer only.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...bookingDetails }
  }
  ```

### GET `/api/bookings/booking-id/:bookingId`
* **Description**: Get booking by human-readable booking ID (e.g., `LT-202606-000001`).
* **Access Rules**: Admin, Assigned Executive, or Owner Customer only.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...bookingDetails }
  }
  ```

### POST `/api/bookings`
* **Description**: Create new booking. Checks existences of dependencies and prevents duplicate active bookings for the same customer/vehicle.
* **Access Rules**: Admin, or Customer (can only book for themselves).
* **Payload**:
  ```json
  {
    "customerId": "user-uuid",
    "leadId": "lead-uuid",
    "testDriveId": null,
    "vehicleId": "vehicle-uuid",
    "variantId": "variant-uuid",
    "branchId": "branch-uuid",
    "bookingAmount": 25000,
    "notes": "Notes about booking request"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": { ...bookingDetails }
  }
  ```

### POST `/api/public/bookings`
* **Description**: Guest customer checkout booking submission. Automatically resolves or registers a Customer User profile, registers an Inquiry Lead, validates options, prevents duplicate active bookings for the same customer/vehicle, generates a unique Booking ID, and initiates the booking.
* **Access Rules**: Public (Anonymous guest access).
* **Payload**:
  ```json
  {
    "name": "Shyamal Mohanty",
    "email": "shyamal@example.com",
    "phone": "9876543210",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "vehicleId": "vehicle-uuid",
    "variantId": "variant-uuid",
    "branchId": "branch-uuid",
    "bookingAmount": 25000,
    "notes": "Interested in attitude black color",
    "campaign": "festive_june",
    "medium": "organic",
    "source": "facebook",
    "referrer": "https://m.facebook.com/",
    "landingPageUrl": "https://laxmitoyota.co.in/book-online"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking request initiated successfully",
    "booking": {
      "id": "booking-uuid",
      "bookingId": "LT-202606-000001",
      "bookingAmount": 25000,
      "bookingStatus": "INITIATED",
      "paymentStatus": "PENDING"
    }
  }
  ```

### PUT `/api/bookings/:id`
* **Description**: Update booking parameters.
* **Access Rules**: 
  * `ADMIN`: Full parameter updates.
  * `SALES_EXECUTIVE`: Can only update `bookingStatus`, `paymentStatus`, `notes`, and `assignedExecutive`. Attempted changes to other parameters are stripped.
  * `CUSTOMER`: Access denied.
* **Payload**:
  ```json
  {
    "bookingAmount": 26000,
    "notes": "Updated color selection notes"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...updatedBooking }
  }
  ```

### PATCH `/api/bookings/:id/status`
* **Description**: Update booking status.
* **Access Rules**: Admin or Assigned Executive.
* **Payload**:
  ```json
  {
    "bookingStatus": "CONFIRMED"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...updatedBooking }
  }
  ```

### PATCH `/api/bookings/:id/payment-status`
* **Description**: Update payment status. Updates booking status to `PAYMENT_SUCCESS` if payment status is `SUCCESS`.
* **Access Rules**: Admin or Assigned Executive.
* **Payload**:
  ```json
  {
    "paymentStatus": "SUCCESS"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...updatedBooking }
  }
  ```

### PATCH `/api/bookings/:id/cancel`
* **Description**: Cancel booking.
* **Access Rules**: Admin or Owner Customer only.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ...updatedBooking }
  }
  ```

### DELETE `/api/bookings/:id`
* **Description**: Permanently delete booking from database.
* **Access Rules**: Admin only.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking record permanently deleted"
  }
  ```

---

## 10. Online Booking Notification & Logging Architecture

The online booking system implements an event-driven notification dispatch pipeline mapping transactional changes and database operations to customer communication alerts.

### 10.1 Channel Interface Abstractions
All communication interfaces are abstracted under `IEmailService`, `ISmsService`, and `IWhatsAppService` definitions. Active stubs (`MockEmailService`, `MockSmsService`, `MockWhatsAppService`) simulate delivery logs to the system console during pre-integration.

### 10.2 Dispatched Event Hooks
Event-driven hooks are bound using Node's `EventEmitter` listener patterns, prepared to connect to Milestone M12 modules:

1. **`booking.created`**: Fired upon booking initiation. Dispatches booking confirmation email, SMS reference receipt, and logs template WhatsApp triggers.
2. **`booking.confirmed`**: Fired when booking status transitions to `CONFIRMED`. Alerts customer regarding showroom validation and allocation coordinator assignments.
3. **`booking.cancelled`**: Fired when booking status transitions to `CANCELLED`. Dispatches cancellation email and SMS instructions.
4. **`booking.payment_success`**: Fired when payment status transitions to `SUCCESS`. Confirms receipt of reservation payment amount.
5. **`booking.payment_failed`**: Fired when payment status transitions to `FAILED`. Dispatches failed payment warnings containing links to retry checkout.

### 10.3 Persistent Notification Logging
Every dispatched channel notification (SMS, Email, WhatsApp) registers audit logs directly inside the PostgreSQL `NotificationLog` table:
```json
{
  "id": "notification-log-uuid",
  "bookingId": "booking-uuid",
  "testDriveId": null,
  "recipient": "shyamal@example.com | 9876543210",
  "channel": "EMAIL | SMS | WHATSAPP",
  "type": "BOOKING_CREATED | BOOKING_CONFIRMED | BOOKING_CANCELLED | PAYMENT_SUCCESSFUL | PAYMENT_FAILED",
  "status": "SENT | FAILED | PENDING",
  "content": "Full notification content message details...",
  "errorMessage": null,
  "createdAt": "2026-06-26T12:00:00.000Z"
}

---

## 11. Razorpay Payment & Webhook Services (`/api/payments` & `/api/public/payments`)

### POST `/api/payments/order`
* **Description**: Create Razorpay payment session order (Protected Admin/Customer route).
* **Payload**:
  ```json
  {
    "bookingId": "booking-uuid"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "razorpay_order_id": "order_XYZ123",
    "amount": 2500000,
    "currency": "INR",
    "key_id": "rzp_test_abc123"
  }
  ```

### POST `/api/public/payments/order`
* **Description**: Create Razorpay payment session order for anonymous checkout (Public route).
* **Payload**: (Same as POST `/api/payments/order`)
* **Response (201 Created)**: (Same as POST `/api/payments/order`)

### POST `/api/payments/verify`
* **Description**: Verify Razorpay payment signature and log status updates (Protected Admin/Customer route).
* **Payload**:
  ```json
  {
    "razorpay_order_id": "order_XYZ123",
    "razorpay_payment_id": "pay_ABC456",
    "razorpay_signature": "cryptographic_signature_hash"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "payment": {
      "id": "payment-uuid",
      "bookingId": "booking-uuid",
      "status": "SUCCESS"
    }
  }
  ```

### POST `/api/public/payments/verify`
* **Description**: Verify Razorpay payment signature for guest checkout (Public route).
* **Payload**: (Same as POST `/api/payments/verify`)
* **Response (200 OK)**: (Same as POST `/api/payments/verify`)

### GET `/api/payments/:id`
* **Description**: Retrieve payment log by ID (Protected Admin/Customer route).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "payment-uuid",
      "bookingId": "booking-uuid",
      "razorpayOrderId": "order_XYZ123",
      "razorpayPaymentId": "pay_ABC456",
      "amount": 25000,
      "status": "SUCCESS",
      "audits": [ ... ]
    }
  }
  ```

### GET `/api/payments/order/:orderId`
* **Description**: Retrieve payment log by Razorpay Order ID (Protected Admin/Customer route).
* **Response (200 OK)**: (Same as GET `/api/payments/:id`)

### POST `/api/payments/:id/refund`
* **Description**: Initiate a refund request for a payment (Protected Admin route).
* **Payload**:
  ```json
  {
    "amount": 10000,
    "reason": "Customer request"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Refund request initiated successfully",
    "payment": {
      "id": "payment-uuid",
      "status": "REFUND_PROCESSING"
    }
  }
  ```

### GET `/api/payments/:id/refunds`
* **Description**: Get audit logs representing refund history (Protected Admin/Executive route).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "refunds": [
      {
        "id": "audit-uuid",
        "paymentId": "payment-uuid",
        "fromStatus": "SUCCESS",
        "toStatus": "REFUND_PROCESSING",
        "action": "ADMIN_INITIATED_REFUND",
        "metadata": {
          "requestedAmount": 10000,
          "reason": "Customer request"
        }
      }
    ]
  }
  ```

### POST `/api/webhooks/razorpay`
* **Description**: Webhook receiver for Razorpay async updates (Public route).
* **Headers**: `x-razorpay-signature: signature_hash`
* **Payload**: Razorpay event JSON payload containing event type (`payment.captured`, `payment.failed`, `refund.processed`, `order.paid`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Webhook processed and recorded successfully"
  }
  ```

---

## 13. Customer Dashboard Services (`/api/dashboard`)

### GET `/api/dashboard/profile`
* **Description**: Fetch the authenticated customer's profile, including their registered email, verified phone, city, state, address, preferred dealership branch, and subscription channels.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "customer-uuid",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "+919876543210",
      "city": "Bhubaneswar",
      "state": "Odisha",
      "address": "123 Street Name",
      "preferredBranchId": "branch-uuid",
      "preferredBranch": {
        "id": "branch-uuid",
        "name": "Bhubaneswar Toyota"
      },
      "communicationPreferences": {
        "email": true,
        "sms": true,
        "whatsapp": false
      }
    }
  }
  ```

### PATCH `/api/dashboard/profile`
* **Description**: Edit custom preferences and profile attributes. Email and Phone updates are strictly blocked.
* **Payload**:
  ```json
  {
    "name": "John Doe Updated",
    "city": "Cuttack",
    "state": "Odisha",
    "address": "456 Main Road",
    "preferredBranchId": "branch-uuid-2",
    "communicationPreferences": {
      "email": true,
      "sms": false,
      "whatsapp": true
    }
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "profile": { ... }
  }
  ```

### GET `/api/dashboard/bookings`
* **Description**: Retrieve list of booking records created by the authenticated customer.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "booking-uuid",
        "bookingId": "LT-202606-000001",
        "bookingAmount": 25000,
        "paymentStatus": "SUCCESS",
        "bookingStatus": "CONFIRMED",
        "vehicle": { "name": "Fortuner" },
        "variant": { "name": "2.8L 4x4 AT" },
        "branch": { "name": "Bhubaneswar Toyota", "city": "Bhubaneswar" }
      }
    ]
  }
  ```

### GET `/api/dashboard/bookings/:id`
* **Description**: Retrieve detailed status tracking information for a specific booking. Restricted to booking owner.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "booking-uuid",
      "bookingId": "LT-202606-000001",
      "bookingAmount": 25000,
      "paymentStatus": "SUCCESS",
      "bookingStatus": "CONFIRMED",
      "assignedExecutive": "Rajesh Kumar",
      "notes": "Please deliver with premium mats.",
      "createdAt": "2026-06-27T12:00:00.000Z",
      "vehicle": { "name": "Fortuner" },
      "variant": { "name": "2.8L 4x4 AT" },
      "branch": {
        "name": "Bhubaneswar Toyota",
        "city": "Bhubaneswar",
        "phone": "+919998887770",
        "email": "bbsr@laxmitoyota.co.in"
      }
    }
  }
  ```

### GET `/api/dashboard/payments`
* **Description**: Fetch transaction receipts history.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "payment-uuid",
        "razorpayOrderId": "order_OkJ232Fdf2",
        "razorpayPaymentId": "pay_OkJ423Fdf4",
        "amount": 25000,
        "currency": "INR",
        "status": "SUCCESS",
        "createdAt": "2026-06-27T12:00:00.000Z",
        "booking": {
          "bookingId": "LT-202606-000001"
        }
      }
    ]
  }
  ```

### GET `/api/dashboard/payments/:id`
* **Description**: Retrieve full transaction record and status audits history.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "payment-uuid",
      "bookingId": "booking-uuid",
      "razorpayOrderId": "order_OkJ232Fdf2",
      "razorpayPaymentId": "pay_OkJ423Fdf4",
      "amount": 25000,
      "currency": "INR",
      "status": "SUCCESS",
      "createdAt": "2026-06-27T12:00:00.000Z",
      "booking": {
        "bookingId": "LT-202606-000001",
        "bookingStatus": "CONFIRMED",
        "vehicle": { "name": "Fortuner" },
        "variant": { "name": "2.8L 4x4 AT" }
      },
      "audits": [
        {
          "id": "audit-uuid",
          "statusBefore": "CREATED",
          "statusAfter": "SUCCESS",
          "notes": "Razorpay webhook verified capture success",
          "createdAt": "2026-06-27T12:05:00.000Z"
        }
      ]
    }
  }
  ```

### GET `/api/dashboard/test-drives`
* **Description**: Retrieve list of test drive schedules booked by the customer.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "appointments": [
      {
        "id": "td-uuid",
        "testDriveId": "TD-202606-000042",
        "preferredDate": "2026-06-28T00:00:00.000Z",
        "preferredTime": "11:00 AM - 12:00 PM",
        "status": "CONFIRMED",
        "assignedExecutive": "Sanjay Panda",
        "notes": "Needs clean diesel variant.",
        "vehicle": { "name": "Innova Hycross" },
        "variant": { "name": "2.0L ZX Hybrid" },
        "branch": { "name": "Cuttack Toyota", "city": "Cuttack" }
      }
    ]
  }
  ```

### GET `/api/dashboard/notifications`
* **Description**: Fetch paginated, filterable, and searchable notifications logs linked to the customer.
* **Query Parameters**:
  - `page`: Page index (default: 1)
  - `limit`: Logs limit (default: 10)
  - `search`: Keyword search term
  - `status`: Filter by status (`read` or `unread`)
  - `type`: Filter by channel type (`BOOKING`, `PAYMENT`, `TEST_DRIVE`, `DELIVERY`, `PROMOTION`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "notif-uuid",
        "title": "Booking Accepted",
        "content": "Your booking LT-202606-000001 has been confirmed by Bhubaneswar Toyota.",
        "type": "BOOKING",
        "isRead": false,
        "createdAt": "2026-06-27T12:10:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### PATCH `/api/dashboard/notifications/:id/read`
* **Description**: Set a notification isRead status flag to true.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "notification": {
      "id": "notif-uuid",
      "isRead": true
    }
  }
  ```
