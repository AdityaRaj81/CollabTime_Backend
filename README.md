# CollabTime Backend

JavaScript NestJS backend for Phase 01 authentication and dashboard access.

## Setup

```bash
npm install --legacy-peer-deps
Copy-Item .env.example .env
npm run start:dev
```

Replace the `<db_username>` and `<db_password>` placeholders in `MONGODB_URI` with a MongoDB Atlas database user's credentials. URL-encode any special characters in the username or password. The URI selects the `collabtime` database; update that path if your database has a different name. Ensure your client IP is allowed in the Atlas network access list.

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `FRONTEND_ORIGIN` in `.env`.
The backend listens on port `3000` by default and connects to the database specified by `MONGODB_URI`.

## API

All endpoints are under `/api/v1`.

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/auth/signup` | Public |
| POST | `/auth/verify-email` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Access cookie |
| GET | `/users/me` | Access cookie |
| GET | `/dashboard` | Access cookie |

Signup creates a `CREATOR` account in `PENDING_VERIFICATION`. In development, the response includes
the verification token so the flow can be tested without an email provider. Production responses never
include that token.

Login sets HTTP-only `accessToken` and `refreshToken` cookies. The frontend must send requests with
credentials enabled. Responses use `{ success, message, data }`; errors use `{ success, message, errors }`.

## Validation

```bash
npm run build
npm run lint
```

The frontend is a separate Vite project in `../CollabTime_Frontend`.
