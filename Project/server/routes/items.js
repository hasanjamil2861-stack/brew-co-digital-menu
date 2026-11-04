const express = require('express');
const path = require('path');
const multer = require('multer');
const Category = require('../models/Category');
const Item = require('../models/Item');

const router = express.Router();

// Save uploaded images in server/uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replaceAll(' ', '-'));
  },
});
const upload = multer({ storage });

// Get all items (not in the trash) with their category
router.get('/', async (req, res) => {
  const items = await Item.find({ isDeleted: { $ne: true } }).populate('category');
  res.json(items);
});

// Add an item
router.post('/', upload.single('image'), async (req, res) => {
  const data = req.body;
  if (req.file) data.image = '/uploads/' + req.file.filename;
  const item = await Item.create(data);
  res.json(item);
});

// Edit an item
router.put('/:id', upload.single('image'), async (req, res) => {
  const data = req.body;
  if (req.file) data.image = '/uploads/' + req.file.filename;
  const item = await Item.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(item);
});

// Activate / deactivate
router.patch('/:id/toggle', async (req, res) => {
  const item = await Item.findById(req.params.id);
  item.isActive = !item.isActive;
  await item.save();
  res.json(item);
});

// Move an item to the trash
router.delete('/:id', async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  res.json({ message: 'Moved to trash' });
});

module.exports = router;