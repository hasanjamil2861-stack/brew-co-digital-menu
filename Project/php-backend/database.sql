-- =========================================================
-- DIGITAL MENU - MySQL database
-- Import this file once (phpMyAdmin > Import)
-- Warning: importing it again deletes all the old data
-- =========================================================

SET NAMES utf8mb4;

DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS failed_logins;

-- Admin accounts
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- encrypted with password_hash()
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menu categories (Coffee, Starters...)
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,  -- 1 = true, 0 = false
  is_deleted TINYINT(1) NOT NULL DEFAULT 0, -- 1 = in the trash
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menu items
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255) NOT NULL DEFAULT '',
  category_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  -- Each item belongs to a category.
  -- If the category is deleted forever, its items are deleted too (CASCADE)
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Wrong login tries (protection against guessing passwords)
CREATE TABLE failed_logins (
  ip VARCHAR(45) PRIMARY KEY,
  count INT NOT NULL,
  last_try DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- THE STARTING MENU (same data as seed.js)
-- =========================================================

-- Coffee
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (1, 'Coffee', 'coffee', NOW(), NOW());
INSERT INTO items (name, description, price, image, category_id, created_at, updated_at) VALUES
('Latte', 'Smooth espresso with steamed milk.', 3.5, '/assets/Coffee/latte.jpg', 1, NOW(), NOW()),
('Iced Coffee', 'Chilled coffee over ice.', 2.9, '/assets/Coffee/iced-coffee.jpg', 1, NOW(), NOW()),
('Americano', 'Espresso with hot water.', 2.5, '/assets/Coffee/americano.jpg', 1, NOW(), NOW()),
('Filter Coffee', 'Strong South Indian-style brew with a frothy top.', 2.5, '/assets/Coffee/coffee-2.jpg', 1, NOW(), NOW()),
('Dalgona Coffee', 'Whipped instant coffee over cold milk.', 3.8, '/assets/Coffee/coffee-3.jpg', 1, NOW(), NOW()),
('Iced Mocha', 'Chilled espresso and chocolate, topped with cream.', 3.9, '/assets/Coffee/coffee-1.jpg', 1, NOW(), NOW());

-- Non Coffee
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (2, 'Non Coffee', 'non-coffee', NOW(), NOW());
INSERT INTO items (name, description, price, image, category_id, created_at, updated_at) VALUES
('Matcha Latte', 'Smooth matcha with steamed milk.', 3.9, '/assets/Non-Coffee/matcha-latte.jpg', 2, NOW(), NOW()),
('Strawberry Pink Drink', 'Sweet strawberry blend with a creamy top.', 3.9, '/assets/Non-Coffee/Strawberry-Pink.jpg', 2, NOW(), NOW()),
('Vanilla Cream Frappé', 'Blended vanilla cream, topped with whipped cream.', 4.2, '/assets/Non-Coffee/Vanilla-Cream.jpg', 2, NOW(), NOW()),
('Cinnamon Cream Drink', 'Warm cinnamon spice with whipped cream.', 3.9, '/assets/Non-Coffee/Cinnamon-Cream.jpg', 2, NOW(), NOW()),
('Iced Mint Cola', 'Cola over ice with fresh mint.', 2.8, '/assets/Non-Coffee/Iced-Minit.jpg', 2, NOW(), NOW()),
('Peppermint Hot Chocolate', 'Rich cocoa with peppermint and whipped cream.', 3.6, '/assets/Non-Coffee/Peppermint-Hot.jpg', 2, NOW(), NOW());

-- Starters
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (3, 'Starters', 'starters', NOW(), NOW());
INSERT INTO items (name, description, price, image, category_id, created_at, updated_at) VALUES
('Chicken Tenders', 'Crispy chicken strips with fries and two dips.', 7.5, '/assets/Starters/starter-chicken-tenders.jpg', 3, NOW(), NOW()),
('Cheese Bites', 'Cheese canapés with tomato, prosciutto and walnuts.', 8.9, '/assets/Starters/starter-cheese-bites.jpg', 3, NOW(), NOW()),
('Spiced Chicken Bites', 'Crispy seasoned chicken bites with fresh parsley.', 6.9, '/assets/Starters/starter-chicken-bites.jpg', 3, NOW(), NOW()),
('Mozzarella Sticks', 'Golden mozzarella sticks with tomato dip.', 6.5, '', 3, NOW(), NOW()),
('Croquettes', 'Crispy croquettes with garlic aioli and lemon.', 6.9, '/assets/Starters/starter-croquettes.jpg', 3, NOW(), NOW()),
('Caprese Salad', 'Fresh tomato, mozzarella, basil and balsamic.', 7.9, '/assets/Starters/starter-caprese-salad.jpg', 3, NOW(), NOW());

-- Mains
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (4, 'Mains', 'mains', NOW(), NOW());
INSERT INTO items (name, description, price, image, category_id, created_at, updated_at) VALUES
('Grilled Steak', 'Grilled steak with arugula, tomatoes and lemon.', 14.5, '/assets/Mains/main-grilled-steak.jpg', 4, NOW(), NOW()),
('Beef Lasagna', 'Layers of pasta, beef ragù and ricotta.', 11.9, '/assets/Mains/main-beef-lasagna.jpg', 4, NOW(), NOW()),
('Chicken Schnitzel', 'Crispy breaded chicken with rice and green beans.', 12.5, '/assets/Mains/main-chicken-schnitzel.jpg', 4, NOW(), NOW()),
('Beef Tips & Rice', 'Tender beef tips in gravy over white rice.', 13.5, '/assets/Mains/main-beef-tips-rice.jpg', 4, NOW(), NOW()),
('Chicken Enchiladas', 'Rolled tortillas with chicken, red sauce and cheese.', 11.5, '/assets/Mains/main-chicken-enchiladas.jpg', 4, NOW(), NOW()),
('Garlic Butter Salmon', 'Pan-seared salmon with rice and broccoli.', 15.9, '/assets/Mains/main-garlic-salmon.jpg', 4, NOW(), NOW());

-- Pastries
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (5, 'Pastries', 'pastries', NOW(), NOW());
INSERT INTO items (name, description, price, image, category_id, created_at, updated_at) VALUES
('Chocolate Cookie', 'Classic cookie with chocolate chips.', 1.8, '/assets/Pastries/chocolate-cookie.jpg', 5, NOW(), NOW()),
('Vanilla Mille-feuille', 'Layers of crisp pastry and vanilla cream.', 3.2, '/assets/Pastries/Vanilla-Mile.jpg', 5, NOW(), NOW()),
('Chocolate Roll', 'Flaky pastry filled with chocolate.', 2.2, '/assets/Pastries/Chocolate-Roll.jpg', 5, NOW(), NOW()),
('Raspberry Danish', 'Buttery danish with raspberry and glaze.', 2.5, '/assets/Pastries/Raspberry.jpg', 5, NOW(), NOW()),
('Strawberry Heart Puff', 'Puff pastry hearts with fresh strawberries.', 2.6, '/assets/Pastries/Strawberry-Heart.jpg', 5, NOW(), NOW()),
('Strawberry Cream Slice', 'Crisp pastry with cream and strawberries.', 3.8, '/assets/Pastries/Strawberry-Cream.jpg', 5, NOW(), NOW()),
('Chocolate Layer Cake', 'Moist chocolate cake with chocolate ganache.', 4.5, '/assets/Pastries/Chocolate-Layer.jpg', 5, NOW(), NOW()),
('Cake Slices', 'Layered cake with one slice.', 2.8, '/assets/Pastries/Cake-Slices.jpg', 5, NOW(), NOW());
