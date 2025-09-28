# Al-Abraar Backend API

A comprehensive NestJS backend for the Al-Abraar Online Modrasah platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Students, Ustaadhs, and Admin roles with approval workflow
- **Booking System**: Flexible lesson scheduling with conflict detection
- **Payment Processing**: Stripe integration for secure payments
- **Messaging**: Real-time communication between users
- **Reviews & Ratings**: Student feedback system for Ustaadhs
- **Payroll Management**: Admin-controlled salary system for Ustaadhs
- **File Uploads**: Cloudinary integration for CV and material uploads
- **Notifications**: Email and in-app notification system
- **Analytics**: Comprehensive reporting and dashboard metrics

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: class-validator & class-transformer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)
- Cloudinary account (for file uploads)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PATCH /api/auth/approve-ustaadh/:id` - Approve Ustaadh (Admin only)
- `PATCH /api/auth/reject-ustaadh/:id` - Reject Ustaadh (Admin only)

#### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/ustaadhss` - Get approved Ustaadhs
- `GET /api/users/pending-ustaadhss` - Get pending Ustaadh approvals (Admin only)
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

#### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/upcoming-lessons` - Get upcoming lessons
- `GET /api/bookings/all` - Get all bookings (Admin only)
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking

#### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/payments/refund` - Process refund

#### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversation/:partnerId` - Get conversation with specific user
- `PATCH /api/messages/:id/read` - Mark message as read

#### Reviews
- `POST /api/reviews` - Create review (Students only)
- `GET /api/reviews/ustaadh/:ustaadhId` - Get Ustaadh reviews
- `GET /api/reviews/ustaadh/:ustaadhId/stats` - Get review statistics

#### Payroll
- `POST /api/payroll/plan` - Create/update compensation plan (Admin only)
- `GET /api/payroll/plan/:ustaadhId` - Get compensation plan
- `PATCH /api/payroll/plan/:ustaadhId/adjustments` - Add salary adjustment
- `PATCH /api/payroll/plan/:ustaadhId/pay` - Mark salary as paid

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics (Admin only)
- `GET /api/analytics/revenue` - Get revenue analytics (Admin only)
- `GET /api/analytics/top-ustaadhs` - Get top performing Ustaadhs (Admin only)

#### Settings
- `GET /api/settings` - Get public settings
- `GET /api/settings/admin` - Get all settings (Admin only)
- `PATCH /api/settings/pricing` - Update pricing (Admin only)

## Database Schema

### Users
- Authentication and profile information
- Role-based access (admin, ustaadh, student)
- Approval workflow for Ustaadhs

### Bookings
- Lesson scheduling and management
- Payment tracking
- Schedule conflict prevention

### Messages
- User-to-user communication
- Booking-related messaging

### Reviews
- Student feedback for Ustaadhs
- Rating aggregation

### Compensation Plans
- Monthly salary management for Ustaadhs
- Adjustment tracking (bonuses/deductions)
- Payment history

## Security Features

- JWT authentication with role-based access
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)
- SQL injection prevention (MongoDB)

## Development

### Running Tests
```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Building for Production
```bash
npm run build
npm run start:prod
```

### Code Quality
```bash
npm run lint
npm run format
```

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Follow the existing code structure and patterns
2. Add proper validation for all DTOs
3. Include error handling and logging
4. Write tests for new features
5. Update documentation

## License

Private - Al-Abraar Online Modrasah Platform