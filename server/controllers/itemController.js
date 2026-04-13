// =============================================
// Item Controller - Full CRUD + Search + Matching
// =============================================

const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

/**
 * @route   POST /api/items
 * @desc    Create a new lost or found item post
 * @access  Protected
 */
const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date, tags, contactInfo } = req.body;

    // Parse tags if sent as a comma-separated string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : tags;
    }

    // Create the item in the database
    const item = await Item.create({
      title,
      description,
      type,
      category,
      location,
      date: new Date(date),
      tags: parsedTags,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      contactInfo: contactInfo || '',
      postedBy: req.user._id, // Set from the authenticated user
    });

    // Populate poster info before returning
    await item.populate('postedBy', 'name email phone department');

    res.status(201).json({
      success: true,
      message: 'Item posted successfully!',
      item,
    });
  } catch (error) {
    console.error('Create Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating item' });
  }
};

/**
 * @route   GET /api/items
 * @desc    Get all items with optional search, filter, and pagination
 * @access  Public
 */
const getItems = async (req, res) => {
  try {
    const { search, type, category, location, status, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    // Build the query filter object
    const filter = {};
    if (status) {
      if (status !== 'all') filter.status = status;
    } else {
      filter.status = { $ne: 'resolved' }; // Exclude resolved items by default
    }

    // Type filter (lost or found)
    if (type && ['lost', 'found'].includes(type)) {
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Full-text search (uses the text index on title, description, tags, location)
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination values
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);

    // Fetch items with pagination
    const items = await Item.find(filter)
      .populate('postedBy', 'name email phone department avatar')
      .populate('claimedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      items,
    });
  } catch (error) {
    console.error('Get Items Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching items' });
  }
};

/**
 * @route   GET /api/items/:id
 * @desc    Get a single item by its ID
 * @access  Public
 */
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email phone department avatar studentId')
      .populate('claimedBy', 'name email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('Get Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/items/:id
 * @desc    Update an item (only by the owner)
 * @access  Protected
 */
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Ensure only the owner can edit
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this item' });
    }

    const { title, description, type, category, location, date, tags, contactInfo, status } = req.body;

    // Update fields if provided
    if (title) item.title = title;
    if (description) item.description = description;
    if (type) item.type = type;
    if (category) item.category = category;
    if (location) item.location = location;
    if (date) item.date = new Date(date);
    if (status) item.status = status;
    if (contactInfo !== undefined) item.contactInfo = contactInfo;

    // Parse tags
    if (tags) {
      item.tags = typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : tags;
    }

    // If a new image is uploaded, delete old image and update
    if (req.file) {
      if (item.image) {
        const oldImagePath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      item.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();
    await updatedItem.populate('postedBy', 'name email phone department avatar');

    res.json({ success: true, message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Update Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an item (only by the owner)
 * @access  Protected
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only the owner can delete
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    // Delete associated image file if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.deleteOne();

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/items/my/posts
 * @desc    Get all items posted by the logged-in user
 * @access  Protected
 */
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .populate('claimedBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Get My Items Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   POST /api/items/:id/claim
 * @desc    Claim an item (set status to pending for owner approval)
 * @access  Protected
 */
const claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Can't claim your own item
    if (item.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available for claiming',
      });
    }

    // Set status to pending and record who claimed it
    item.status = 'pending';
    item.claimedBy = req.user._id;
    await item.save();

    await item.populate('postedBy', 'name email');
    await item.populate('claimedBy', 'name email');

    res.json({ success: true, message: 'Claim submitted! Waiting for owner approval.', item });
  } catch (error) {
    console.error('Claim Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/items/:id/resolve
 * @desc    Mark item as resolved (only by the owner)
 * @access  Protected
 */
const resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only the poster can resolve
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item.status = 'resolved';
    await item.save();

    res.json({ success: true, message: 'Item marked as resolved!', item });
  } catch (error) {
    console.error('Resolve Item Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/items/:id/matches
 * @desc    Find similar items for the matching system
 * @access  Public
 */
const getMatchingItems = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Find the opposite type (if lost, find found; if found, find lost)
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    // Build a regex pattern from the title to find similar titles
    const titleRegex = new RegExp(item.title.split(' ')[0], 'i'); // matches first word of title
    
    // Find items of opposite type
    const matches = await Item.find({
      _id: { $ne: item._id },           // Exclude current item
      type: oppositeType,               // Find the opposite type
      status: 'active',                 // Only active items
      $or: [
        { category: item.category },    // Same category
        { title: { $regex: titleRegex } },// Similar title
        { tags: { $in: item.tags || [] } } // Shared tags
      ],
    })
      .populate('postedBy', 'name email phone avatar')
      .limit(6)
      .sort('-createdAt');

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error('Matching Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
  claimItem,
  resolveItem,
  getMatchingItems,
};
