# Mfiat Agent API

Agent backend service for the Mfiat platform.
Built with Node.js, TypeScript, Express, Prisma, and Swagger.

## Features

- Agent registration and login
- Email verification via OTP
- Password reset via email code
- JWT authentication with refresh tokens
- KYC document upload and review endpoints
- Notification CRUD and unread count
- Swagger API documentation
- Background email queue support

## Tech stack

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL-compatible database
- Swagger UI for API docs
- AWS SES / SMTP support for email
- Twilio optional SMS support

## Getting started

### Install dependencies

```bash
npm install
```

### Environment

Create a `.env` file in the project root and provide the following values:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE_MB=5

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

> Only the environment variables required by your chosen email/SMS provider need to be set.

### Database setup

Generate Prisma client and apply migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Run locally

```bash
npm run dev
```

The API will start on `http://localhost:3000` by default.

### Production build

```bash
npm run build
npm start
```

### Docker

```bash
npm run docker:build
npm run docker:up
npm run docker:down
```

## API endpoints

Base path: `/api/v1`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### KYC

- `POST /api/v1/kyc/submit`
- `GET /api/v1/kyc/status`
- `GET /api/v1/kyc/pending`
- `PATCH /api/v1/kyc/{kycId}/review`

### Notifications

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `GET /api/v1/notifications/{notificationId}`
- `PATCH /api/v1/notifications/{notificationId}/read`
- `PATCH /api/v1/notifications/mark-all-read`
- `DELETE /api/v1/notifications/{notificationId}`

### Health and docs

- `GET /health`
- `GET /api-docs`
- `GET /api-docs.json`

## Project structure

- `src/app.ts` — Express app and middleware
- `src/server.ts` — server bootstrap
- `src/config/env.ts` — environment variable config
- `src/routes/agent` — auth and KYC routes
- `src/controllers/agent` — request handlers
- `src/services/agent` — business logic
- `src/utils` — helpers for email, JWT, OTP and queues
- `src/docs/swagger.ts` — OpenAPI specification
- `prisma/schema.prisma` — database schema

## Notes

- Email verification uses OTP codes stored in the database.
- Login supports email or phone plus password.
- Protected routes require `Authorization: Bearer <token>`.
- Uploads are handled via multipart form data for KYC document submission.

## Testing

```bash
npm test
```

## Troubleshooting

- Ensure `DATABASE_URL` is valid and the database is reachable.
- Confirm `JWT_SECRET` and `JWT_REFRESH_SECRET` are set.
- If email sending fails, verify SMTP or AWS SES credentials.

---

Created for the Mfiat Agent backend project.
