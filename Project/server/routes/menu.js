const express = require('express');
const Category = require('../models/Category');
const Item = require('../models/Item');

const router = express.Router();

// Active categories with their active items (for the customer menu)
// Anything in the trash is hidden
router.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true, isDeleted: { $ne: true } });
  const items = await Item.find({ isActive: true, isDeleted: { $ne: true } });

  const menu = categories.map(category => ({
    name: category.name,
    slug: category.slug,
    items: items.filter(item => item.category.toString() === category._id.toString()),
  }));

  res.json(menu);
});

module.exports = router;