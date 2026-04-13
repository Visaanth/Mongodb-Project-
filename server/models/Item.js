// =============================================
// Item Model - MongoDB Schema for Lost & Found Items
// =============================================

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    // Title of the item (e.g., "Blue Water Bottle")
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // Detailed description of the item
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // Whether this is a Lost or Found item
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['lost', 'found'],
    },

    // Category helps with matching (e.g., Electronics, Clothing)
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Clothing',
        'Books & Stationery',
        'Accessories',
        'ID & Documents',
        'Keys',
        'Bags & Wallets',
        'Sports Equipment',
        'Other',
      ],
    },

    // Where the item was lost or found on campus
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // Date when the item was lost or found
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    // Keywords/tags to help with searching and matching
    tags: {
      type: [String],
      default: [],
    },

    // Path to uploaded image (if any)
    image: {
      type: String,
      default: '',
    },

    // Current status of the item
    status: {
      type: String,
      enum: ['active', 'pending', 'resolved'],
      default: 'active',
    },

    // User who posted this item (reference to User collection)
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // User who claimed this item (populated when someone claims)
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Contact info for this specific item (override profile contact)
    contactInfo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// =============================================
// TEXT INDEX: Enables full-text search on these fields
// =============================================
itemSchema.index({ title: 'text', description: 'text', tags: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
