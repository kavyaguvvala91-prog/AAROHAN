# Frontend

Production-ready React frontend built with Vite.

## Features
- Environment-based API configuration
- Graceful API error states and loading states
- Private route protection
- Custom 404 page
- Support for primary and fallback backend APIs

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=/api
VITE_FALLBACK_API_BASE_URL=http://localhost:5001/api
REACT_APP_API_URL=/api
REACT_APP_FALLBACK_API_URL=http://localhost:5001/api
VITE_PROXY_TARGET=http://localhost:5000
```

Notes:
- This project uses Vite, so `VITE_*` variables are the primary env format.
- `REACT_APP_*` aliases are supported in the API client for compatibility with React-style deployment env names.
- Public read endpoints can retry against the fallback API automatically.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

Recommended deployment targets:
- Frontend: Vercel or Netlify
- Backend API: Render or Railway

For production, point `VITE_API_BASE_URL` or `REACT_APP_API_URL` to your deployed backend URL such as:

```env
VITE_API_BASE_URL=https://your-api.onrender.com/api
```

This repo already includes SPA route fallback files for common static hosts:
- `frontend/vercel.json` for Vercel
- `frontend/public/_redirects` for Netlify
