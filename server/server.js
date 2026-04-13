// =============================================
// Smart Lost & Found System - Main Server File
// =============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();

// =============================================
// MIDDLEWARE SETUP
// =============================================

// Enable CORS - allows React frontend to communicate with this backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images as static files
// Files uploaded will be accessible at /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// DATABASE CONNECTION
// =============================================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully to lostfoundDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit process if DB connection fails
  });

// =============================================
// API ROUTES
// =============================================

// Auth routes: /api/auth/register, /api/auth/login
app.use('/api/auth', require('./routes/authRoutes'));

// User routes: /api/users/profile etc.
app.use('/api/users', require('./routes/userRoutes'));

// Item routes: /api/items (CRUD + search)
app.use('/api/items', require('./routes/itemRoutes'));

// Message routes: /api/messages
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Lost & Found API is running!' });
});

// =============================================
// GLOBAL ERROR HANDLER
// =============================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// =============================================
// START SERVER
// =============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
