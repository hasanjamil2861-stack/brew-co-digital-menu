-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 08, 2026 at 10:59 PM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digital_menu`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Coffee', 'coffee', 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(2, 'Non Coffee', 'non-coffee', 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(3, 'Starters', 'starters', 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(4, 'Mains', 'mains', 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(5, 'Pastries', 'pastries', 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33');

-- --------------------------------------------------------

--
-- Table structure for table `failed_logins`
--

CREATE TABLE `failed_logins` (
  `ip` varchar(45) NOT NULL,
  `count` int(11) NOT NULL,
  `last_try` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `failed_logins`
--

INSERT INTO `failed_logins` (`ip`, `count`, `last_try`) VALUES
('::1', 5, '2026-11-08 21:54:44');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT '',
  `category_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `price`, `image`, `category_id`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Latte', 'Smooth espresso with steamed milk.', 3.50, '/assets/Coffee/latte.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(2, 'Iced Coffee', 'Chilled coffee over ice.', 2.90, '/assets/Coffee/iced-coffee.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(3, 'Americano', 'Espresso with hot water.', 2.50, '/assets/Coffee/americano.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(4, 'Filter Coffee', 'Strong South Indian-style brew with a frothy top.', 2.50, '/assets/Coffee/coffee-2.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(5, 'Dalgona Coffee', 'Whipped instant coffee over cold milk.', 3.80, '/assets/Coffee/coffee-3.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(6, 'Iced Mocha', 'Chilled espresso and chocolate, topped with cream.', 3.90, '/assets/Coffee/coffee-1.jpg', 1, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(7, 'Matcha Latte', 'Smooth matcha with steamed milk.', 3.90, '/assets/Non-Coffee/matcha-latte.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(8, 'Strawberry Pink Drink', 'Sweet strawberry blend with a creamy top.', 3.90, '/assets/Non-Coffee/Strawberry-Pink.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(9, 'Vanilla Cream Frappé', 'Blended vanilla cream, topped with whipped cream.', 4.20, '/assets/Non-Coffee/Vanilla-Cream.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(10, 'Cinnamon Cream Drink', 'Warm cinnamon spice with whipped cream.', 3.90, '/assets/Non-Coffee/Cinnamon-Cream.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(11, 'Iced Mint Cola', 'Cola over ice with fresh mint.', 2.80, '/assets/Non-Coffee/Iced-Minit.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(12, 'Peppermint Hot Chocolate', 'Rich cocoa with peppermint and whipped cream.', 3.60, '/assets/Non-Coffee/Peppermint-Hot.jpg', 2, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(13, 'Chicken Tenders', 'Crispy chicken strips with fries and two dips.', 7.50, '/assets/Starters/starter-chicken-tenders.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(14, 'Cheese Bites', 'Cheese canapés with tomato, prosciutto and walnuts.', 8.90, '/assets/Starters/starter-cheese-bites.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(15, 'Spiced Chicken Bites', 'Crispy seasoned chicken bites with fresh parsley.', 6.90, '/assets/Starters/starter-chicken-bites.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(16, 'Mozzarella Sticks', 'Golden mozzarella sticks with tomato dip.', 6.50, '/uploads/1794174987892-starter-mozzarella-sticks.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 21:56:27'),
(17, 'Croquettes', 'Crispy croquettes with garlic aioli and lemon.', 6.90, '/assets/Starters/starter-croquettes.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(18, 'Caprese Salad', 'Fresh tomato, mozzarella, basil and balsamic.', 7.90, '/assets/Starters/starter-caprese-salad.jpg', 3, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(19, 'Grilled Steak', 'Grilled steak with arugula, tomatoes and lemon.', 14.50, '/assets/Mains/main-grilled-steak.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(20, 'Beef Lasagna', 'Layers of pasta, beef ragù and ricotta.', 11.90, '/assets/Mains/main-beef-lasagna.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(21, 'Chicken Schnitzel', 'Crispy breaded chicken with rice and green beans.', 12.50, '/assets/Mains/main-chicken-schnitzel.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(22, 'Beef Tips & Rice', 'Tender beef tips in gravy over white rice.', 13.50, '/assets/Mains/main-beef-tips-rice.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(23, 'Chicken Enchiladas', 'Rolled tortillas with chicken, red sauce and cheese.', 11.50, '/assets/Mains/main-chicken-enchiladas.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(24, 'Garlic Butter Salmon', 'Pan-seared salmon with rice and broccoli.', 15.90, '/assets/Mains/main-garlic-salmon.jpg', 4, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(25, 'Chocolate Cookie', 'Classic cookie with chocolate chips.', 1.80, '/assets/Pastries/chocolate-cookie.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(26, 'Vanilla Mille-feuille', 'Layers of crisp pastry and vanilla cream.', 3.20, '/assets/Pastries/Vanilla-Mile.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(27, 'Chocolate Roll', 'Flaky pastry filled with chocolate.', 2.20, '/assets/Pastries/Chocolate-Roll.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(28, 'Raspberry Danish', 'Buttery danish with raspberry and glaze.', 2.50, '/assets/Pastries/Raspberry.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(29, 'Strawberry Heart Puff', 'Puff pastry hearts with fresh strawberries.', 2.60, '/assets/Pastries/Strawberry-Heart.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(30, 'Strawberry Cream Slice', 'Crisp pastry with cream and strawberries.', 3.80, '/assets/Pastries/Strawberry-Cream.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(31, 'Chocolate Layer Cake', 'Moist chocolate cake with chocolate ganache.', 4.50, '/assets/Pastries/Chocolate-Layer.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33'),
(32, 'Cake Slices', 'Layered cake with one slice.', 2.80, '/assets/Pastries/Cake-Slices.jpg', 5, 1, 0, NULL, '2026-11-08 23:53:33', '2026-11-08 23:53:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'hasan', 'hasanjamil2@gmail.com', '$2y$12$weWmvjv9ZNV4V9Rx7P15d.g2MrSsnStcumI1Q3g1o9HC1tnvRLgWy', '2026-11-08 21:55:14', '2026-11-08 21:55:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `failed_logins`
--
ALTER TABLE `failed_logins`
  ADD PRIMARY KEY (`ip`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
