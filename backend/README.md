# AI-Powered College Discovery & Recommendation Platform (Backend)

This backend project is built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- MVC architecture
- async/await

## Project Structure

```bash
backend/
  config/
    db.js
  controllers/
    collegeController.js
  middleware/
    errorHandler.js
  models/
    College.js
  routes/
    collegeRoutes.js
  seed/
    seedColleges.js
  .env.example
  .gitignore
  package.json
  server.js
  README.md
```

## 1) Installation Steps

1. Open terminal in `AAROHAN/backend`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_discovery
```

4. Make sure MongoDB is running locally.

## 2) Seed Sample Data (10+ colleges)

```bash
npm run seed
```

## 3) Run Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server URL:

```bash
http://localhost:5000
```

## 4) API Endpoints

### A) Get All Colleges
- Method: `GET`
- URL: `http://localhost:5000/api/colleges`

### B) Recommend Colleges
- Method: `POST`
- URL: `http://localhost:5000/api/recommend`
- Body (JSON):

```json
{
  "rank": 2500,
  "budget": 250000,
  "location": "Delhi",
  "course": "Computer Science"
}
```

Scoring logic:
- rank match: 40
- budget match: 30
- location match: 20
- course match: 10

Also returns tag for each college:
- `Safe`
- `Target`
- `Dream`

### C) Filter Colleges
- Method: `GET`
- URL:

```bash
http://localhost:5000/api/colleges/filter?location=Delhi&maxFees=250000&course=Computer%20Science
```

Query params:
- `location`
- `maxFees`
- `course`

### D) Compare Colleges
- Method: `POST`
- URL: `http://localhost:5000/api/compare`
- Body (JSON):

```json
{
  "colleges": ["IIT Delhi", "DTU"]
}
```

## 5) Postman Examples

### 1. GET All Colleges
- Method: GET
- URL: `http://localhost:5000/api/colleges`

### 2. POST Recommend
- Method: POST
- URL: `http://localhost:5000/api/recommend`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "rank": 4500,
  "budget": 200000,
  "location": "Bengaluru",
  "course": "Computer Science"
}
```

### 3. GET Filter
- Method: GET
- URL: `http://localhost:5000/api/colleges/filter?location=Bengaluru&maxFees=300000&course=Computer%20Science`

### 4. POST Compare
- Method: POST
- URL: `http://localhost:5000/api/compare`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "colleges": ["RV College of Engineering", "PES University"]
}
```

## 6) Notes
- Proper error handling is included using middleware.
- All controller methods are asynchronous and use async/await.
- Code is modular and beginner-friendly.