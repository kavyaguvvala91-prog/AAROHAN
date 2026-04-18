# Backend

Production-ready Express + MongoDB API for the Aarohan platform.

## Features
- Centralized env configuration and validation
- Restricted CORS using `FRONTEND_URL`
- `helmet` security headers
- Global rate limiting
- `express-validator` request validation
- Global error handler with safe production responses
- Structured logging in production
- Health check endpoint at `GET /api/health`
- External places API failover with timeout handling

## Required Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_discovery
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PLACES_PRIMARY_API_BASE_URL=https://nominatim.openstreetmap.org
PLACES_FALLBACK_API_BASE_URL=https://photon.komoot.io
EXTERNAL_API_TIMEOUT_MS=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
JSON_BODY_LIMIT=1mb
LOG_LEVEL=info
```

Use MongoDB Atlas in production for `MONGO_URI`.

## Local Development

```bash
npm install
npm run seed
npm run dev
```

Backup API instance:

```bash
npm run dev:backup
```

## Production

```bash
npm start
```

Recommended deployment targets:
- Backend: Render or Railway
- Database: MongoDB Atlas

## Main Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/colleges`
- `GET /api/colleges/filter`
- `POST /api/recommend`
- `POST /api/compare`
- `GET /api/college-details`
- `GET /api/nearby`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:collegeId`
- `POST /api/chat`

## Notes
- Responses from `GET /api/college-details` and `GET /api/nearby` include `source: "primary"` or `source: "fallback"` for external places data.
- Secrets stay server-side in env files and should never be committed.
