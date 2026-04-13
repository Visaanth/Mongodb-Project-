// =============================================
// Message Controller - User-to-User Communication
// =============================================

const Message = require('../models/Message');
const Item = require('../models/Item');

/**
 * @route   POST /api/messages
 * @desc    Send a message to the item poster
 * @access  Protected
 */
const sendMessage = async (req, res) => {
  try {
    const { itemId, receiverId, content } = req.body;

    if (!itemId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId, receiverId, and content',
      });
    }

    // Verify the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Cannot message yourself
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself' });
    }

    // Create the message
    const message = await Message.create({
      item: itemId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');
    await message.populate('item', 'title type');

    res.status(201).json({ success: true, message: 'Message sent!', data: message });
  } catch (error) {
    console.error('Send Message Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/inbox
 * @desc    Get all messages received by the logged-in user
 * @access  Protected
 */
const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'name avatar email')
      .populate('item', 'title type category')
      .sort('-createdAt');

    // Mark all as read
    await Message.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Get Inbox Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/sent
 * @desc    Get all messages sent by the logged-in user
 * @access  Protected
 */
const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate('receiver', 'name avatar email')
      .populate('item', 'title type category')
      .sort('-createdAt');

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Get Sent Messages Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get count of unread messages
 * @access  Protected
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendMessage, getInbox, getSentMessages, getUnreadCount };
