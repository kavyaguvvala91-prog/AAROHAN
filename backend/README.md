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
- Google Maps lookup with dataset fallback when live data is unavailable
- Groq-powered chatbot for college guidance

## Required Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_discovery
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173,https://your-frontend-domain.vercel.app
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXTERNAL_API_TIMEOUT_MS=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
JSON_BODY_LIMIT=1mb
LOG_LEVEL=info
```

Use MongoDB Atlas in production for `MONGO_URI`.
`FRONTEND_URL` accepts a comma-separated allowlist so you can support local development and deployed frontend domains at the same time.
`GOOGLE_MAPS_API_KEY` is used for server-side geocoding and Places lookups; the campus map iframe uses a public Google Maps embed URL and does not require the Maps Embed API.

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

Suggested Render settings:
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

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
- Responses from `GET /api/college-details` and `GET /api/nearby` include `source: "primary"` or `source: "fallback"` for Google Maps lookups and dataset fallbacks.
- `POST /api/chat` uses the Groq OpenAI-compatible chat endpoint.
- Secrets stay server-side in env files and should never be committed.
