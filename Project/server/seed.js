require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Item = require('./models/Item');

// The old menu data: each category with its items
const menu = [
  {
    name: 'Coffee',
    items: [
      { name: 'Latte', description: 'Smooth espresso with steamed milk.', price: 3.5, image: '/assets/Coffee/latte.jpg' },
      { name: 'Iced Coffee', description: 'Chilled coffee over ice.', price: 2.9, image: '/assets/Coffee/iced-coffee.jpg' },
      { name: 'Americano', description: 'Espresso with hot water.', price: 2.5, image: '/assets/Coffee/americano.jpg' },
      { name: 'Filter Coffee', description: 'Strong South Indian-style brew with a frothy top.', price: 2.5, image: '/assets/Coffee/coffee-2.jpg' },
      { name: 'Dalgona Coffee', description: 'Whipped instant coffee over cold milk.', price: 3.8, image: '/assets/Coffee/coffee-3.jpg' },
      { name: 'Iced Mocha', description: 'Chilled espresso and chocolate, topped with cream.', price: 3.9, image: '/assets/Coffee/coffee-1.jpg' },
    ],
  },
  {
    name: 'Non Coffee',
    items: [
      { name: 'Matcha Latte', description: 'Smooth matcha with steamed milk.', price: 3.9, image: '/assets/Non-Coffee/matcha-latte.jpg' },
      { name: 'Strawberry Pink Drink', description: 'Sweet strawberry blend with a creamy top.', price: 3.9, image: '/assets/Non-Coffee/Strawberry-Pink.jpg' },
      { name: 'Vanilla Cream Frappé', description: 'Blended vanilla cream, topped with whipped cream.', price: 4.2, image: '/assets/Non-Coffee/Vanilla-Cream.jpg' },
      { name: 'Cinnamon Cream Drink', description: 'Warm cinnamon spice with whipped cream.', price: 3.9, image: '/assets/Non-Coffee/Cinnamon-Cream.jpg' },
      { name: 'Iced Mint Cola', description: 'Cola over ice with fresh mint.', price: 2.8, image: '/assets/Non-Coffee/Iced-Minit.jpg' },
      { name: 'Peppermint Hot Chocolate', description: 'Rich cocoa with peppermint and whipped cream.', price: 3.6, image: '/assets/Non-Coffee/Peppermint-Hot.jpg' },
    ],
  },
  {
    name: 'Starters',
    items: [
      { name: 'Chicken Tenders', description: 'Crispy chicken strips with fries and two dips.', price: 7.5, image: '/assets/Starters/starter-chicken-tenders.jpg' },
      { name: 'Cheese Bites', description: 'Cheese canapés with tomato, prosciutto and walnuts.', price: 8.9, image: '/assets/Starters/starter-cheese-bites.jpg' },
      { name: 'Spiced Chicken Bites', description: 'Crispy seasoned chicken bites with fresh parsley.', price: 6.9, image: '/assets/Starters/starter-chicken-bites.jpg' },
      { name: 'Mozzarella Sticks', description: 'Golden mozzarella sticks with tomato dip.', price: 6.5, image: '' },
      { name: 'Croquettes', description: 'Crispy croquettes with garlic aioli and lemon.', price: 6.9, image: '/assets/Starters/starter-croquettes.jpg' },
      { name: 'Caprese Salad', description: 'Fresh tomato, mozzarella, basil and balsamic.', price: 7.9, image: '/assets/Starters/starter-caprese-salad.jpg' },
    ],
  },
  {
    name: 'Mains',
    items: [
      { name: 'Grilled Steak', description: 'Grilled steak with arugula, tomatoes and lemon.', price: 14.5, image: '/assets/Mains/main-grilled-steak.jpg' },
      { name: 'Beef Lasagna', description: 'Layers of pasta, beef ragù and ricotta.', price: 11.9, image: '/assets/Mains/main-beef-lasagna.jpg' },
      { name: 'Chicken Schnitzel', description: 'Crispy breaded chicken with rice and green beans.', price: 12.5, image: '/assets/Mains/main-chicken-schnitzel.jpg' },
      { name: 'Beef Tips & Rice', description: 'Tender beef tips in gravy over white rice.', price: 13.5, image: '/assets/Mains/main-beef-tips-rice.jpg' },
      { name: 'Chicken Enchiladas', description: 'Rolled tortillas with chicken, red sauce and cheese.', price: 11.5, image: '/assets/Mains/main-chicken-enchiladas.jpg' },
      { name: 'Garlic Butter Salmon', description: 'Pan-seared salmon with rice and broccoli.', price: 15.9, image: '/assets/Mains/main-garlic-salmon.jpg' },
    ],
  },
  {
    name: 'Pastries',
    items: [
      { name: 'Chocolate Cookie', description: 'Classic cookie with chocolate chips.', price: 1.8, image: '/assets/Pastries/chocolate-cookie.jpg' },
      { name: 'Vanilla Mille-feuille', description: 'Layers of crisp pastry and vanilla cream.', price: 3.2, image: '/assets/Pastries/Vanilla-Mile.jpg' },
      { name: 'Chocolate Roll', description: 'Flaky pastry filled with chocolate.', price: 2.2, image: '/assets/Pastries/Chocolate-Roll.jpg' },
      { name: 'Raspberry Danish', description: 'Buttery danish with raspberry and glaze.', price: 2.5, image: '/assets/Pastries/Raspberry.jpg' },
      { name: 'Strawberry Heart Puff', description: 'Puff pastry hearts with fresh strawberries.', price: 2.6, image: '/assets/Pastries/Strawberry-Heart.jpg' },
      { name: 'Strawberry Cream Slice', description: 'Crisp pastry with cream and strawberries.', price: 3.8, image: '/assets/Pastries/Strawberry-Cream.jpg' },
      { name: 'Chocolate Layer Cake', description: 'Moist chocolate cake with chocolate ganache.', price: 4.5, image: '/assets/Pastries/Chocolate-Layer.jpg' },
      { name: 'Cake Slices', description: 'Layered cake with one slice.', price: 2.8, image: '/assets/Pastries/Cake-Slices.jpg' },
    ],
  },
];

async function seed() {
  await connectDB();

  // Remove the old data
  await Item.deleteMany();
  await Category.deleteMany();

  // Add each category, then its items
  for (const cat of menu) {
    const slug = cat.name.toLowerCase().replaceAll(' ', '-');
    const category = await Category.create({ name: cat.name, slug: slug });

    for (const item of cat.items) {
      await Item.create({ ...item, category: category._id });
    }

    console.log(`${cat.name}: ${cat.items.length} items added`);
  }

  // Close the database connection
  await mongoose.disconnect();
  console.log('Seed done');
}

seed();