// =============================================
// Auth Routes
// =============================================

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// POST /api/auth/register - Create new account
router.post('/register', registerUser);

// POST /api/auth/login - Login with email & password
router.post('/login', loginUser);

module.exports = router;
