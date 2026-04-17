require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'College Discovery API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);
app.use('/api', authMiddleware, collegeRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);

// 404 handler for undefined routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
