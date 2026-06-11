// =============================================
// Auth Routes
// =============================================

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin } = require('../controllers/authController');

// POST /api/auth/register - Create new account
router.post('/register', registerUser);

// POST /api/auth/login - Login with email & password
router.post('/login', loginUser);

// POST /api/auth/google - Login or register with Google
router.post('/google', googleLogin);

module.exports = router;
