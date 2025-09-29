# Al-Abraar API Postman Collection

This directory contains the Postman collection and environment files for testing the Al-Abraar Online Modrasah API.

## Files

- `Al-Abraar-API.postman_collection.json` - Main API collection
- `Al-Abraar-Local.postman_environment.json` - Local development environment
- `Al-Abraar-Production.postman_environment.json` - Production environment

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Al-Abraar-API.postman_collection.json`
4. The collection will be imported with all endpoints

### 2. Import Environment
1. Click the gear icon (Manage Environments)
2. Click "Import"
3. Select the appropriate environment file:
   - `Al-Abraar-Local.postman_environment.json` for local development
   - `Al-Abraar-Production.postman_environment.json` for production

### 3. Set Environment
1. Select the imported environment from the dropdown in top-right
2. Make sure the `base_url` variable is set correctly

## Authentication

### Getting Started
1. Use the "Login" request in the Authentication folder
2. The collection will automatically set the `access_token` variable
3. All subsequent requests will use this token automatically

### Demo Accounts
The system includes demo accounts for testing:

**Admin Account:**
- Email: `admin@al-abraar.com`
- Password: `password123`

**Ustaadh Account:**
- Email: `ahmed.alhafiz@email.com`
- Password: `password123`

**Student Account:**
- Email: `student@al-abraar.com`
- Password: `password123`

## API Endpoints Overview

### Authentication (`/auth`)
- `POST /register` - Register new user (student/ustaadh)
- `POST /login` - User login
- `PATCH /approve-ustaadh/:id` - Approve Ustaadh (Admin)
- `PATCH /reject-ustaadh/:id` - Reject Ustaadh (Admin)

### Users (`/users`)
- `GET /users` - Get all users (Admin)
- `GET /users/ustaadhss` - Get approved Ustaadhs with filters
- `GET /users/pending-ustaadhss` - Get pending approvals (Admin)
- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/:id` - Get user by ID

### Bookings (`/bookings`)
- `POST /bookings` - Create new booking
- `GET /bookings/my-bookings` - Get user's bookings
- `GET /bookings/upcoming-lessons` - Get upcoming lessons
- `GET /bookings/all` - Get all bookings (Admin)
- `PATCH /bookings/:id/status` - Update booking status
- `PATCH /bookings/:id/cancel` - Cancel booking

### Payments (`/payments`)
- `POST /payments/create-intent` - Create Stripe payment intent
- `POST /payments/paypal/create-order` - Create PayPal order
- `POST /payments/paypal/capture/:orderId` - Capture PayPal order
- `POST /payments/webhook` - Payment webhook handler
- `POST /payments/refund` - Process refund

### Availability (`/availability`)
- `POST /availability` - Set Ustaadh availability (Ustaadh)
- `PUT /availability` - Update availability (Ustaadh)
- `GET /availability/ustaadh/:ustaadhId` - Get Ustaadh availability
- `GET /availability/my-availability` - Get own availability (Ustaadh)

### Messages (`/messages`)
- `POST /messages` - Send message
- `GET /messages/conversations` - Get conversations
- `GET /messages/conversation/:partnerId` - Get conversation
- `PATCH /messages/:id/read` - Mark message as read

### Reviews (`/reviews`)
- `POST /reviews` - Create review (Students)
- `GET /reviews/ustaadh/:ustaadhId` - Get Ustaadh reviews
- `GET /reviews/ustaadh/:ustaadhId/stats` - Get review statistics

### Payroll (`/payroll`)
- `POST /payroll/plan` - Create/update compensation plan (Admin)
- `PATCH /payroll/plan/:ustaadhId/adjustments` - Add adjustment (Admin)
- `PATCH /payroll/plan/:ustaadhId/pay` - Mark as paid (Admin)
- `GET /payroll/plan/:ustaadhId` - Get compensation plan
- `GET /payroll/my-plan` - Get own plan (Ustaadh)

### Notifications (`/notifications`)
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/mark-all-read` - Mark all as read

### File Uploads (`/uploads`)
- `POST /uploads` - Upload file to Cloudinary
- `DELETE /uploads/:publicId` - Delete file from Cloudinary

### Analytics (`/analytics`)
- `GET /analytics/dashboard` - Dashboard stats (Admin)
- `GET /analytics/revenue` - Revenue analytics (Admin)
- `GET /analytics/top-ustaadhs` - Top Ustaadhs (Admin)

### Settings (`/settings`)
- `GET /settings` - Get public settings
- `GET /settings/admin` - Get all settings (Admin)
- `PATCH /settings/pricing` - Update pricing (Admin)

## Testing Workflows

### 1. User Registration & Approval
1. Register as Ustaadh using "Register Ustaadh"
2. Login as Admin
3. Get pending approvals using "Get Pending Ustaadhs"
4. Approve the Ustaadh using "Approve Ustaadh"

### 2. Booking Flow
1. Login as Student
2. Browse Ustaadhs using "Get Approved Ustaadhs"
3. Create booking using "Create Booking"
4. Create payment intent using "Create Stripe Payment Intent"
5. Check booking status using "Get My Bookings"

### 3. Lesson Management
1. Login as Ustaadh
2. Set availability using "Set Ustaadh Availability"
3. Check upcoming lessons using "Get Upcoming Lessons"
4. Update lesson status as needed

### 4. Payroll Management
1. Login as Admin
2. Create compensation plan using "Create/Update Compensation Plan"
3. Add adjustments using "Add Salary Adjustment"
4. Mark salary as paid using "Mark Salary as Paid"

## Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/bookings",
  "method": "POST",
  "message": "Validation failed: Invalid time format"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15-minute window per IP
- Headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Support

For API support or questions:
- Email: support@al-abraar.com
- Documentation: Check the README.md in the server directory