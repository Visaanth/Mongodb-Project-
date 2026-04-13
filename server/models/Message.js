// =============================================
// Message Model - For user-to-user communication
// =============================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // The item this conversation is about
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },

    // User sending the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // User receiving the message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The message text
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // Whether the receiver has read this message
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
