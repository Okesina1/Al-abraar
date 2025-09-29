# Al-Abraar Online Modrasah API Documentation

## Overview

The Al-Abraar API is a comprehensive RESTful API built with NestJS that powers the Al-Abraar Online Modrasah platform. It provides endpoints for user management, booking system, payments, messaging, reviews, and administrative functions.

## Base URL

- **Local Development:** `http://localhost:3001/api`
- **Production:** `https://api.al-abraar.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

Send a POST request to `/auth/login` with email and password:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1234567890abcdef12345",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "student"
  }
}
```

## User Roles

- **Admin:** Full system access, user management, approvals
- **Ustaadh:** Teacher role, manage availability, view students
- **Student:** Book lessons, view progress, make payments

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student", // or "ustaadh"
  "phoneNumber": "+1234567890",
  "country": "USA",
  "city": "New York",
  "age": 25,
  "bio": "Optional bio for Ustaadhs",
  "experience": "Optional experience for Ustaadhs",
  "specialties": ["Quran", "Tajweed"] // Optional for Ustaadhs
}
```

**Response (Student):**
```json
{
  "access_token": "jwt_token_here",
  "user": { /* user object */ }
}
```

**Response (Ustaadh):**
```json
{
  "message": "Registration submitted! Your application is under review.",
  "requiresApproval": true
}
```

#### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management Endpoints

#### GET /users/ustaadhss
Get approved Ustaadhs with optional filters.

**Query Parameters:**
- `country` (optional): Filter by country
- `specialties` (optional): Comma-separated specialties
- `search` (optional): Search by name or bio
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "ustaadhs": [
    {
      "id": "64f1234567890abcdef12346",
      "fullName": "Ahmed Al-Hafiz",
      "email": "ahmed@example.com",
      "country": "Saudi Arabia",
      "city": "Riyadh",
      "bio": "Certified Quran teacher...",
      "experience": "15 years",
      "specialties": ["Quran", "Tajweed"],
      "rating": 4.9,
      "reviewCount": 127,
      "isVerified": true
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### Booking Endpoints

#### POST /bookings
Create a new booking.

**Request Body:**
```json
{
  "studentId": "64f1234567890abcdef12345",
  "ustaadhId": "64f1234567890abcdef12346",
  "packageType": "complete", // "basic" or "complete"
  "hoursPerDay": 1.5,
  "daysPerWeek": 3,
  "subscriptionMonths": 1,
  "totalAmount": 126,
  "startDate": "2024-02-01",
  "endDate": "2024-03-01",
  "schedule": [
    {
      "dayOfWeek": 1, // 0=Sunday, 1=Monday, etc.
      "startTime": "14:00",
      "endTime": "15:30",
      "date": "2024-02-05"
    }
  ]
}
```

#### GET /bookings/my-bookings
Get current user's bookings (works for both students and Ustaadhs).

### Payment Endpoints

#### POST /payments/create-intent
Create Stripe payment intent.

**Request Body:**
```json
{
  "bookingId": "64f1234567890abcdef12347",
  "amount": 126,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "paymentIntentId": "pi_1234567890"
}
```

#### POST /payments/paypal/create-order
Create PayPal order.

**Request Body:**
```json
{
  "bookingId": "64f1234567890abcdef12347",
  "amount": 126,
  "currency": "USD"
}
```

### File Upload Endpoints

#### POST /uploads
Upload file to Cloudinary.

**Request:** Multipart form data
- `file`: File to upload
- `folder` (optional): Cloudinary folder
- `resourceType` (optional): "image", "video", or "auto"
- `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "public_id": "cvs/sample_cv",
  "url": "https://res.cloudinary.com/...",
  "resource_type": "image",
  "bytes": 1024000,
  "width": 800,
  "height": 600,
  "format": "jpg"
}
```

### Availability Endpoints

#### POST /availability
Set Ustaadh availability schedule.

**Request Body:**
```json
[
  {
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true
  },
  {
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "18:00",
    "isAvailable": true
  }
]
```

### Messaging Endpoints

#### POST /messages
Send a message.

**Request Body:**
```json
{
  "receiverId": "64f1234567890abcdef12346",
  "content": "Assalamu Alaikum! Looking forward to our lesson.",
  "bookingId": "64f1234567890abcdef12347" // optional
}
```

### Review Endpoints

#### POST /reviews
Create a review (Students only).

**Request Body:**
```json
{
  "ustaadhId": "64f1234567890abcdef12346",
  "rating": 5,
  "comment": "Excellent teacher! Very patient and knowledgeable.",
  "bookingId": "64f1234567890abcdef12347" // optional
}
```

### Payroll Endpoints (Admin Only)

#### POST /payroll/plan
Create or update compensation plan.

**Request Body:**
```json
{
  "ustaadhId": "64f1234567890abcdef12346",
  "monthlySalary": 1000,
  "currency": "USD",
  "paymentDayOfMonth": 5,
  "effectiveFrom": "2024-01-01",
  "nextReviewDate": "2024-07-01"
}
```

#### PATCH /payroll/plan/:ustaadhId/adjustments
Add salary adjustment.

**Request Body:**
```json
{
  "month": "2024-01",
  "type": "bonus", // or "deduction"
  "label": "Performance bonus",
  "amount": 100,
  "note": "Excellent student feedback"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/bookings",
  "method": "POST",
  "message": "Validation failed: Invalid time format"
}
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Rate Limiting

- **Limit:** 100 requests per 15-minute window per IP
- **Headers:** 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks

### Stripe Webhook
**Endpoint:** `POST /payments/webhook`
**Headers:** `stripe-signature`

Handles payment events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## File Upload Guidelines

### Supported File Types
- **Images:** JPEG, PNG, WebP
- **Documents:** PDF, DOC, DOCX

### File Size Limits
- **Maximum:** 10MB per file

### Cloudinary Integration
Files are uploaded to Cloudinary with automatic optimization and CDN delivery.

## Testing with Postman

1. Import the collection and environment files
2. Set the environment (Local/Production)
3. Login to get authentication token
4. Test endpoints in logical order (register → login → create booking → payment)

## Environment Variables

Required environment variables for local development:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/al-abraar

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Support

For technical support or API questions:
- **Email:** support@al-abraar.com
- **Documentation:** [API Docs](http://localhost:3001/api/docs)
- **Health Check:** [Health Status](http://localhost:3001/api/health)