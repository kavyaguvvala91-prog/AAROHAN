# CollegeAI Frontend (React + Vite)

Modern dashboard-style frontend for the AI-Powered College Discovery & Recommendation Platform.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM
- Framer Motion
- Lucide React

## Project Structure

```bash
frontend/
  src/
    components/
      Sidebar.jsx
      Navbar.jsx
      SearchBar.jsx
      CollegeCard.jsx
      Badge.jsx
      Loader.jsx
    pages/
      Home.jsx
      Colleges.jsx
      Compare.jsx
      Dashboard.jsx
    services/
      api.js
    App.jsx
    main.jsx
    index.css
  index.html
  tailwind.config.js
  postcss.config.js
  package.json
```

## Tailwind Setup
Already configured with:
- `tailwindcss`
- `postcss`
- `autoprefixer`

Files:
- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## API Base URL
`src/services/api.js`:

```js
baseURL: 'http://localhost:5000/api'
```

## Routes
- `/` -> Home (recommendations)
- `/dashboard` -> Dashboard
- `/colleges` -> Colleges + filters
- `/compare` -> Compare

## Run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build Check

```bash
npm run build
```