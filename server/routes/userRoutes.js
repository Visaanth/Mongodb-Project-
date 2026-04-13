// =============================================
// User Routes
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
} = require('../controllers/userController');

// GET /api/users/profile - Get current user's profile
router.get('/profile', protect, getProfile);

// PUT /api/users/profile - Update profile (with optional avatar upload)
router.put('/profile', protect, upload.single('avatar'), updateProfile);

// PUT /api/users/change-password - Change password
router.put('/change-password', protect, changePassword);

// GET /api/users/:id - Get public profile of any user
router.get('/:id', protect, getUserById);

module.exports = router;
