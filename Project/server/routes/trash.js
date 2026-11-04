const express = require('express');
const Category = require('../models/Category');
const Item = require('../models/Item');

const router = express.Router();

// Get everything in the trash (newest first)
router.get('/', async (req, res) => {
  const categories = await Category.find({ isDeleted: true }).sort({ deletedAt: -1 });
  const items = await Item.find({ isDeleted: true }).populate('category').sort({ deletedAt: -1 });
  res.json({ categories, items });
});

// Restore a category
router.patch('/categories/:id/restore', async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null });
  res.json({ message: 'Restored' });
});

// Restore an item
router.patch('/items/:id/restore', async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null });
  res.json({ message: 'Restored' });
});

// Delete a category forever (and all its items)
router.delete('/categories/:id', async (req, res) => {
  await Item.deleteMany({ category: req.params.id });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted forever' });
});

// Delete an item forever
router.delete('/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted forever' });
});

// Empty the trash
router.delete('/', async (req, res) => {
  const categories = await Category.find({ isDeleted: true });
  const ids = categories.map(category => category._id);

  // Deleted items + all items of deleted categories
  await Item.deleteMany({ $or: [{ isDeleted: true }, { category: { $in: ids } }] });
  await Category.deleteMany({ isDeleted: true });

  res.json({ message: 'Trash emptied' });
});

module.exports = router;