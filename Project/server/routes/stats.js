const express = require('express');
const Category = require('../models/Category');
const Item = require('../models/Item');

const router = express.Router();

// All the numbers for the dashboard
router.get('/', async (req, res) => {
  const notDeleted = { isDeleted: { $ne: true } };

  // Categories and items (not in the trash), newest items first
  const categories = await Category.find(notDeleted);
  const items = await Item.find(notDeleted).populate('category').sort({ createdAt: -1 });

  // How many things are in the trash
  const deletedCategories = await Category.countDocuments({ isDeleted: true });
  const deletedItems = await Item.countDocuments({ isDeleted: true });

  // Items the customer can really see (item active + category active and not in trash)
  const visibleItems = items.filter(item =>
    item.isActive && item.category && item.category.isActive && !item.category.isDeleted
  );

  // Prices
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const byPrice = [...items].sort((a, b) => b.price - a.price);

  // Number of items in each category (biggest first)
  const perCategory = categories
    .map(category => ({
      name: category.name,
      isActive: category.isActive,
      count: items.filter(item => item.category && item.category._id.toString() === category._id.toString()).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Menu growth: how many items were on the menu at the end of each of the last 90 days
  const growth = [];
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const endOfDay = new Date();
    endOfDay.setDate(endOfDay.getDate() - daysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    growth.push({
      date: endOfDay.toISOString().slice(0, 10),
      total: items.filter(item => item.createdAt <= endOfDay).length,
    });
  }

  res.json({
    totalCategories: categories.length,
    activeCategories: categories.filter(category => category.isActive).length,
    inactiveCategories: categories.filter(category => !category.isActive).length,

    totalItems: items.length,
    activeItems: items.filter(item => item.isActive).length,
    inactiveItems: items.filter(item => !item.isActive).length,
    visibleItems: visibleItems.length,
    itemsWithoutImage: items.filter(item => !item.image).length,
    trashCount: deletedCategories + deletedItems,

    averagePrice: items.length ? totalPrice / items.length : 0,
    mostExpensive: byPrice[0] || null,
    cheapest: byPrice[byPrice.length - 1] || null,

    perCategory: perCategory,
    latestItems: items.slice(0, 5),
    growth: growth,
  });
});

module.exports = router;