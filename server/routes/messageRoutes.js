// =============================================
// Message Routes
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getInbox,
  getSentMessages,
  getUnreadCount,
} = require('../controllers/messageController');

// POST /api/messages - Send a message
router.post('/', protect, sendMessage);

// GET /api/messages/inbox - Get received messages
router.get('/inbox', protect, getInbox);

// GET /api/messages/sent - Get sent messages
router.get('/sent', protect, getSentMessages);

// GET /api/messages/unread-count - Get unread count
router.get('/unread-count', protect, getUnreadCount);

module.exports = router;
