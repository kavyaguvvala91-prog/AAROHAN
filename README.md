# Aarohan

Aarohan is a full-stack college discovery and recommendation platform with:

- A React + Vite frontend in `frontend/`
- An Express + MongoDB backend in `backend/`

## Project Structure

```text
aarohan/
  backend/   # API, authentication, recommendations, favorites, chat
  frontend/  # UI for discovery, filtering, comparison, and college details
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Files

- Keep real secrets only in local `.env` files.
- Commit only `.env.example` files.
- Do not commit `backend/.env`, `backend/.env.backup`, or `frontend/.env`.

## Build

```bash
cd frontend
npm run build
```

## GitHub Push Checklist

- Review `backend/.env.example` and `frontend/.env.example`
- Confirm no real API keys or database credentials are committed
- Commit the repo from the project root
- Push `backend/` and `frontend/` together as one repository

## App Docs

- Backend guide: [backend/README.md](backend/README.md)
- Frontend guide: [frontend/README.md](frontend/README.md)
