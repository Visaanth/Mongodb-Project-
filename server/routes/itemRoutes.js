// =============================================
// Item Routes - Full CRUD + Search + Matching
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
  claimItem,
  resolveItem,
  getMatchingItems,
} = require('../controllers/itemController');

// GET /api/items/my/posts - Get logged-in user's posts (must be before /:id)
router.get('/my/posts', protect, getMyItems);

// GET /api/items - Get all items (with search & filter query params)
// POST /api/items - Create a new item (with optional image upload)
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

// GET /api/items/:id - Get single item
// PUT /api/items/:id - Update item
// DELETE /api/items/:id - Delete item
router.route('/:id')
  .get(getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

// POST /api/items/:id/claim - Claim an item
router.post('/:id/claim', protect, claimItem);

// PUT /api/items/:id/resolve - Mark as resolved
router.put('/:id/resolve', protect, resolveItem);

// GET /api/items/:id/matches - Get similar/matching items
router.get('/:id/matches', getMatchingItems);

module.exports = router;
