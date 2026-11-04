const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Get all categories (not in the trash)
router.get('/', async (req, res) => {
  const categories = await Category.find({ isDeleted: { $ne: true } });
  res.json(categories);
});

// Add a category
router.post('/', async (req, res) => {
  const name = req.body.name;
  const slug = name.toLowerCase().replaceAll(' ', '-');
  const category = await Category.create({ name, slug });
  res.json(category);
});

// Edit a category
router.put('/:id', async (req, res) => {
  const name = req.body.name;
  const slug = name.toLowerCase().replaceAll(' ', '-');
  const category = await Category.findByIdAndUpdate(req.params.id, { name, slug }, { new: true });
  res.json(category);
});

// Activate / deactivate
router.patch('/:id/toggle', async (req, res) => {
  const category = await Category.findById(req.params.id);
  category.isActive = !category.isActive;
  await category.save();
  res.json(category);
});

// Move a category to the trash
router.delete('/:id', async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  res.json({ message: 'Moved to trash' });
});

module.exports = router;