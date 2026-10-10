-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 07, 2026 at 02:22 PM
-- Server version: 8.4.6
-- PHP Version: 8.4.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fweafrmr_med`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int NOT NULL,
  `company_id` int DEFAULT NULL,
  `actor_user_id` int DEFAULT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `company_id`, `actor_user_id`, `action`, `entity_type`, `record_id`, `created_at`) VALUES
(1, 1, 1, 'DELETE', 'quotation', 2, '2026-09-05 10:16:42'),
(2, 1, 1, 'DELETE', 'quotation', 1, '2026-09-05 10:16:48');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fiscal_year_start` int DEFAULT '1',
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#FF8C42',
  `pdf_template` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pdf_footer_line1` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pdf_footer_line2` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pdf_footer_enabled_docs` json DEFAULT (json_array())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `registration_number`, `tax_number`, `email`, `phone`, `address`, `city`, `state`, `postal_code`, `country`, `fiscal_year_start`, `currency`, `website`, `logo_url`, `primary_color`, `pdf_template`, `status`, `created_at`, `updated_at`, `pdf_footer_line1`, `pdf_footer_line2`, `pdf_footer_enabled_docs`) VALUES
(1, 'Diag Solutions Ltd', NULL, NULL, 'info@diagsolutionsltd.com', 'Tel: +254 180 274401', '', 'Nairobi', 'Nrb', '00200', 'Kenya', 6, 'KES', 'https://diagsolutionsltd.com', 'https://diagsolutionsltd.com/uploads/ChatGPT_Image_Sep_2__2026__09_04_45_PM-1788373437.png', '#FF8C42', 'default', 'active', '2026-01-17 13:08:46', '2026-10-06 22:41:31', 'Account Details Bank: Cooperative Bank Bank name: Diag Solutions Limited Account No: 01103390021001', 'Mpesa PAYBILL NO: 400200 Account No: 01103390021001', '[\"invoice\", \"proforma\", \"statement\", \"receipt\"]');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_notes`
--

CREATE TABLE `credit_notes` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `credit_note_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note_allocations`
--

CREATE TABLE `credit_note_allocations` (
  `id` int NOT NULL,
  `credit_note_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `allocated_amount` decimal(15,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note_items`
--

CREATE TABLE `credit_note_items` (
  `id` int NOT NULL,
  `credit_note_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) DEFAULT '1.000',
  `unit_price` decimal(15,2) DEFAULT '0.00',
  `line_total` decimal(15,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `credit_limit` decimal(15,2) DEFAULT '0.00',
  `is_supplier` tinyint(1) DEFAULT '0',
  `payment_terms` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `company_id`, `name`, `email`, `phone`, `address`, `city`, `state`, `postal_code`, `country`, `tax_id`, `customer_number`, `status`, `credit_limit`, `is_supplier`, `payment_terms`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Umoja Three Medical Centre', '', '+254704373727', 'Umoja three', '', NULL, NULL, 'Kenya', NULL, NULL, 'active', 20000.00, 0, '0', '1', '2026-09-02 08:52:38', '2026-09-02 08:52:38'),
(2, 1, 'Kegogi Medicare Hospital', '', '0703501747', 'Kegogi - Kisii', 'Kisii', NULL, NULL, 'Kenya', NULL, NULL, 'active', 100000.00, 0, '0', '1', '2026-09-05 10:16:22', '2026-09-05 10:16:22');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_notes`
--

CREATE TABLE `delivery_notes` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `delivery_note_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_date` date DEFAULT (curdate()),
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_note_items`
--

CREATE TABLE `delivery_note_items` (
  `id` int NOT NULL,
  `delivery_note_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discovery_leads`
--

CREATE TABLE `discovery_leads` (
  `id` int NOT NULL,
  `business_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_sequences`
--

CREATE TABLE `document_sequences` (
  `id` int NOT NULL,
  `document_type` char(3) NOT NULL,
  `year` int NOT NULL,
  `sequence_number` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `document_sequences`
--

INSERT INTO `document_sequences` (`id`, `document_type`, `year`, `sequence_number`, `created_at`, `updated_at`) VALUES
(1, 'PRO', 2026, 5, '2026-01-26 12:09:03', '2026-07-10 09:36:17'),
(4, 'INV', 2026, 16, '2026-01-26 12:24:59', '2026-10-07 03:23:40'),
(5, 'QT', 2026, 13, '2026-01-26 12:24:59', '2026-10-07 03:20:41'),
(6, 'PO', 2026, 0, '2026-01-26 12:24:59', '2026-01-26 12:24:59'),
(7, 'LPO', 2026, 0, '2026-01-26 12:25:00', '2026-01-26 12:25:00'),
(8, 'DN', 2026, 1, '2026-01-26 12:25:00', '2026-02-05 11:40:55'),
(9, 'CN', 2026, 0, '2026-01-26 12:25:00', '2026-01-26 12:25:00'),
(10, 'PAY', 2026, 5, '2026-01-26 12:25:00', '2026-07-13 07:48:47'),
(11, 'REC', 2026, 6, '2026-01-26 12:25:00', '2026-01-27 08:33:52');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `quotation_id` int DEFAULT NULL,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date DEFAULT (curdate()),
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `paid_amount` decimal(15,2) DEFAULT '0.00',
  `balance_due` decimal(15,2) DEFAULT '0.00',
  `lpo_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `terms_and_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `company_id`, `customer_id`, `quotation_id`, `invoice_number`, `invoice_date`, `due_date`, `subtotal`, `tax_amount`, `total_amount`, `paid_amount`, `balance_due`, `lpo_number`, `status`, `created_by`, `created_at`, `updated_at`, `notes`, `terms_and_conditions`) VALUES
(1, 1, 1, NULL, 'INV-02092026-15', '2026-09-02', '2026-10-02', 6000.00, 0.00, 6000.00, 0.00, 6000.00, '', 'draft', 1, '2026-09-02 16:35:15', '2026-10-06 22:44:50', '', 'Quotation Valid for 30 days. All deliveries to incur freight charges.\n'),
(2, 1, 1, NULL, 'INV-07102026-16', '2026-10-07', '2026-11-06', 6500.00, 0.00, 6500.00, 0.00, 6500.00, NULL, 'draft', 1, '2026-10-07 03:23:40', '2026-10-07 03:23:40', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `tax_inclusive` tinyint(1) DEFAULT '0',
  `tax_setting_id` int DEFAULT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `description`, `quantity`, `unit_price`, `tax_percentage`, `tax_amount`, `tax_inclusive`, `tax_setting_id`, `line_total`, `sort_order`) VALUES
(2, 1, 1, 'Diluent', 1.000, 6000.00, 0.00, 0.00, 1, NULL, 6000.00, 1),
(3, 2, 1, 'Diluent', 1.000, 6500.00, 0.00, 0.00, 0, NULL, 6500.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int NOT NULL,
  `business_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lpos`
--

CREATE TABLE `lpos` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `lpo_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lpo_items`
--

CREATE TABLE `lpo_items` (
  `id` int NOT NULL,
  `lpo_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `unit` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migration_logs`
--

CREATE TABLE `migration_logs` (
  `id` int NOT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `newsletter`
--

CREATE TABLE `newsletter` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int NOT NULL,
  `source` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snippet` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `payment_date` date DEFAULT (curdate()),
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_allocations`
--

CREATE TABLE `payment_allocations` (
  `id` int NOT NULL,
  `payment_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_audit_log`
--

CREATE TABLE `payment_audit_log` (
  `id` int NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `payment_amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `company_id`, `name`, `code`, `is_active`, `created_at`) VALUES
(1, 1, 'Mpesa', 'MPESA', 1, '2026-01-18 07:14:39'),
(4, 1, 'Bank', 'BANK', 1, '2026-05-11 07:55:09');

-- --------------------------------------------------------

--
-- Table structure for table `portfolios`
--

CREATE TABLE `portfolios` (
  `id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_of_measure` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_quantity` decimal(10,3) DEFAULT '0.000',
  `reorder_level` decimal(10,3) DEFAULT '0.000',
  `unit_price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) DEFAULT '0.00',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `company_id`, `category_id`, `name`, `description`, `sku`, `unit_of_measure`, `stock_quantity`, `reorder_level`, `unit_price`, `cost_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Diluent', NULL, NULL, NULL, 0.000, 0.000, 6500.00, 0.00, 'active', '2026-09-02 08:56:27', '2026-09-02 08:56:27'),
(2, 1, NULL, 'Diluent', 'Hti', NULL, NULL, 0.000, 0.000, 6000.00, 0.00, 'active', '2026-09-03 15:26:31', '2026-09-03 15:26:31'),
(3, 1, NULL, 'Hydralic Operating Table', NULL, NULL, NULL, 0.000, 0.000, 250000.00, 0.00, 'active', '2026-09-05 10:20:12', '2026-09-05 10:20:12'),
(4, 1, NULL, 'Patient Monitor (5 Parameters)', NULL, NULL, NULL, 0.000, 0.000, 60000.00, 0.00, 'active', '2026-09-05 10:21:57', '2026-09-05 10:21:57'),
(5, 1, NULL, 'Oxygen Concentrator (10L)', NULL, NULL, NULL, 0.000, 0.000, 100000.00, 0.00, 'active', '2026-09-05 10:23:04', '2026-09-05 10:23:04'),
(6, 1, NULL, 'Patient Stretcher', NULL, NULL, NULL, 0.000, 0.000, 35000.00, 0.00, 'active', '2026-09-05 10:23:47', '2026-09-05 10:23:47'),
(7, 1, NULL, 'Autoclave (50Litres)', NULL, NULL, NULL, 0.000, 0.000, 180000.00, 0.00, 'active', '2026-09-05 17:22:58', '2026-09-05 17:22:58'),
(8, 1, NULL, 'Single Arm Operating Theatre Light', NULL, NULL, NULL, 0.000, 0.000, 210000.00, 0.00, 'active', '2026-09-05 17:24:56', '2026-09-05 17:24:56'),
(9, 1, NULL, 'Mayo Trolley', NULL, NULL, NULL, 0.000, 0.000, 9000.00, 0.00, 'active', '2026-09-05 17:25:59', '2026-09-05 17:25:59'),
(10, 1, NULL, 'Suction machine (Two bottle)', NULL, NULL, NULL, 0.000, 0.000, 20500.00, 0.00, 'active', '2026-09-05 17:30:35', '2026-09-05 17:30:35'),
(11, 1, NULL, 'Standard Wheelchair', NULL, NULL, NULL, 0.000, 0.000, 10000.00, 0.00, 'active', '2026-09-05 17:31:25', '2026-09-05 17:31:25'),
(12, 1, NULL, 'Drip Stand', NULL, NULL, NULL, 0.000, 0.000, 3500.00, 0.00, 'active', '2026-09-05 17:32:18', '2026-09-05 17:32:18'),
(13, 1, NULL, 'Ambubag', NULL, NULL, NULL, 0.000, 0.000, 3000.00, 0.00, 'active', '2026-09-05 17:32:50', '2026-09-05 17:32:50'),
(14, 1, NULL, 'Fetal Doppler', NULL, NULL, NULL, 0.000, 0.000, 8500.00, 0.00, 'active', '2026-09-05 17:33:31', '2026-09-05 17:33:31'),
(15, 1, NULL, 'Digital Scale Baby', NULL, NULL, NULL, 0.000, 0.000, 6000.00, 0.00, 'active', '2026-09-05 17:34:35', '2026-09-05 17:34:35'),
(16, 1, NULL, 'Diathermy Machine', NULL, NULL, NULL, 0.000, 0.000, 180000.00, 0.00, 'active', '2026-09-05 17:35:28', '2026-09-05 17:35:28'),
(17, 1, NULL, 'Complete Dental Unit', NULL, NULL, NULL, 0.000, 0.000, 350000.00, 0.00, 'active', '2026-09-05 17:36:13', '2026-09-05 17:36:13'),
(18, 1, NULL, 'Radiant Baby Warmer', NULL, NULL, NULL, 0.000, 0.000, 210000.00, 0.00, 'active', '2026-09-08 04:50:28', '2026-09-08 04:50:28'),
(19, 1, NULL, 'Laryngoscope', NULL, NULL, NULL, 0.000, 0.000, 195000.00, 0.00, 'active', '2026-09-08 04:52:37', '2026-09-08 04:52:37'),
(20, 1, NULL, 'Laryngoscope Blades', NULL, NULL, NULL, 0.000, 0.000, 16000.00, 0.00, 'active', '2026-09-08 04:53:17', '2026-09-08 04:53:17'),
(21, 1, NULL, 'Oxygen Concentrator (10L)', NULL, NULL, NULL, 0.000, 0.000, 100000.00, 0.00, 'active', '2026-09-08 06:33:28', '2026-09-08 06:33:28'),
(22, 1, NULL, 'Oxygen Concentrator (10L)', NULL, NULL, NULL, 0.000, 0.000, 100000.00, 0.00, 'active', '2026-09-08 06:35:14', '2026-09-08 06:35:14'),
(23, 1, NULL, 'Drip Stand', NULL, NULL, NULL, 0.000, 0.000, 3250.00, 0.00, 'active', '2026-09-08 06:45:24', '2026-09-08 06:45:24'),
(24, 1, NULL, 'Diathermy Machine (400W)', NULL, NULL, NULL, 0.000, 0.000, 185000.00, 0.00, 'active', '2026-09-08 06:47:28', '2026-09-08 06:47:28'),
(25, 1, NULL, 'Autoclave (50Litres)', NULL, NULL, NULL, 0.000, 0.000, 185000.00, 0.00, 'active', '2026-09-08 06:49:01', '2026-09-08 06:49:01'),
(26, 1, NULL, 'Laryngoscope Blades (4 Blades)', NULL, NULL, NULL, 0.000, 0.000, 8000.00, 0.00, 'active', '2026-09-08 06:50:12', '2026-09-08 06:50:12'),
(27, 1, NULL, 'Drip Stand', NULL, NULL, NULL, 0.000, 0.000, 2000.00, 0.00, 'active', '2026-10-07 03:20:23', '2026-10-07 03:20:23');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `product_code` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invited_by` int DEFAULT NULL,
  `invited_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `email`, `full_name`, `avatar_url`, `role`, `status`, `phone`, `company_id`, `department`, `position`, `invited_by`, `invited_at`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'info@diagsolutionsltd.com', 'Admin User', NULL, 'admin', 'active', '', 1, '', '', NULL, NULL, '2026-10-07 06:35:43', '2026-01-17 14:26:22', '2026-10-07 09:35:43'),
(2, 'user@example.com', 'Regular User', NULL, 'accountant', 'active', '', 1, '', '', NULL, NULL, '2026-02-03 11:59:36', '2026-01-17 14:26:22', '2026-02-04 16:00:13');

-- --------------------------------------------------------

--
-- Table structure for table `proforma_invoices`
--

CREATE TABLE `proforma_invoices` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `proforma_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `proforma_date` date DEFAULT (curdate()),
  `subtotal` decimal(15,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `valid_until` date DEFAULT NULL,
  `terms_and_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proforma_items`
--

CREATE TABLE `proforma_items` (
  `id` int NOT NULL,
  `proforma_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int NOT NULL,
  `company_id` int NOT NULL DEFAULT '0',
  `customer_id` int DEFAULT NULL,
  `portfolio_id` int DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `quotation_number` varchar(255) DEFAULT NULL,
  `quotation_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `project_description` text,
  `budget_range` varchar(100) DEFAULT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'draft',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `notes` text,
  `terms_and_conditions` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `company_id`, `customer_id`, `portfolio_id`, `customer_name`, `customer_email`, `customer_phone`, `quotation_number`, `quotation_date`, `valid_until`, `project_description`, `budget_range`, `timeline`, `status`, `subtotal`, `tax_amount`, `total_amount`, `notes`, `terms_and_conditions`, `created_by`, `created_at`, `updated_at`) VALUES
(3, 1, 2, NULL, NULL, NULL, NULL, 'QT-05092026-12', '2026-09-05', '2026-10-05', NULL, NULL, NULL, 'draft', 2011500.00, 0.00, 2011500.00, '', '', 1, '2026-09-05 10:21:06', '2026-09-08 06:59:30'),
(4, 1, 1, NULL, NULL, NULL, NULL, 'QT-07102026-13', '2026-10-07', '2026-11-06', NULL, NULL, NULL, 'draft', 6000.00, 0.00, 6000.00, '', '', 1, '2026-10-07 03:20:41', '2026-10-07 03:20:41');

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` int NOT NULL,
  `quotation_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `tax_inclusive` tinyint(1) DEFAULT '0',
  `tax_setting_id` int DEFAULT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quotation_items`
--

INSERT INTO `quotation_items` (`id`, `quotation_id`, `product_id`, `description`, `quantity`, `unit_price`, `tax_percentage`, `tax_amount`, `tax_inclusive`, `tax_setting_id`, `line_total`, `sort_order`) VALUES
(273, 3, 3, 'Hydralic Operating Table', 1.000, 250000.00, 0.00, 0.00, 0, NULL, 250000.00, 1),
(274, 3, 4, 'Patient Monitor (5 Parameters)', 1.000, 60000.00, 0.00, 0.00, 0, NULL, 60000.00, 2),
(275, 3, 6, 'Patient Stretcher', 1.000, 35000.00, 0.00, 0.00, 0, NULL, 35000.00, 3),
(276, 3, 8, 'Single Arm Operating Theatre Light', 1.000, 210000.00, 0.00, 0.00, 0, NULL, 210000.00, 4),
(277, 3, 9, 'Mayo Trolley', 2.000, 9000.00, 0.00, 0.00, 0, NULL, 18000.00, 5),
(278, 3, 10, 'Suction machine (Two bottle)', 2.000, 20000.00, 0.00, 0.00, 0, NULL, 40000.00, 6),
(279, 3, 11, 'Standard Wheelchair', 1.000, 11000.00, 0.00, 0.00, 0, NULL, 11000.00, 7),
(280, 3, 13, 'Ambubag', 1.000, 3000.00, 0.00, 0.00, 0, NULL, 3000.00, 8),
(281, 3, 14, 'Fetal Doppler', 1.000, 8000.00, 0.00, 0.00, 0, NULL, 8000.00, 9),
(282, 3, 15, 'Digital Scale Baby', 1.000, 6500.00, 0.00, 0.00, 0, NULL, 6500.00, 10),
(283, 3, 17, 'Complete Dental Unit', 1.000, 350000.00, 0.00, 0.00, 0, NULL, 350000.00, 11),
(284, 3, 18, 'Radiant Baby Warmer', 1.000, 210000.00, 0.00, 0.00, 0, NULL, 210000.00, 12),
(285, 3, 19, 'Laryngoscope', 1.000, 190000.00, 0.00, 0.00, 0, NULL, 190000.00, 13),
(286, 3, 22, 'Oxygen Concentrator (10L)', 2.000, 110000.00, 0.00, 0.00, 0, NULL, 220000.00, 14),
(287, 3, 23, 'Drip Stand', 2.000, 3500.00, 0.00, 0.00, 0, NULL, 7000.00, 15),
(288, 3, 24, 'Diathermy Machine (400W)', 1.000, 200000.00, 0.00, 0.00, 0, NULL, 200000.00, 16),
(289, 3, 25, 'Autoclave (50Litres)', 1.000, 185000.00, 0.00, 0.00, 0, NULL, 185000.00, 17),
(290, 3, 26, 'Laryngoscope Blades (4 Blades)', 1.000, 8000.00, 0.00, 0.00, 0, NULL, 8000.00, 18),
(291, 4, 27, 'Drip Stand', 1.000, 6000.00, 0.00, 0.00, 0, NULL, 6000.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` int NOT NULL COMMENT 'Primary key',
  `company_id` int NOT NULL COMMENT 'Foreign key to companies',
  `payment_id` int NOT NULL COMMENT 'Foreign key to payments',
  `invoice_id` int NOT NULL COMMENT 'Foreign key to invoices',
  `receipt_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Independent receipt numbering (REC-XXXX format)',
  `receipt_date` date NOT NULL COMMENT 'When receipt was issued',
  `receipt_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'payment_against_invoice' COMMENT 'direct_receipt, payment_against_invoice',
  `total_amount` decimal(15,2) NOT NULL COMMENT 'Total received',
  `excess_amount` decimal(15,2) DEFAULT '0.00' COMMENT 'Amount over invoice total (if any)',
  `excess_handling` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'credit_balance, change_note, pending',
  `change_note_id` int DEFAULT NULL COMMENT 'If excess_handling = change_note',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes',
  `created_by` int DEFAULT NULL COMMENT 'User who created the receipt',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `remittance_advice`
--

CREATE TABLE `remittance_advice` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `remittance_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `remittance_advice_items`
--

CREATE TABLE `remittance_advice_items` (
  `id` int NOT NULL,
  `remittance_id` int NOT NULL,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'custom',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `company_id`, `name`, `role_type`, `description`, `permissions`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(8, 1, 'admin', 'admin', 'Full system access', '[\"create_quotation\", \"view_quotation\", \"edit_quotation\", \"delete_quotation\", \"export_quotation\", \"create_invoice\", \"view_invoice\", \"edit_invoice\", \"delete_invoice\", \"export_invoice\", \"create_credit_note\", \"view_credit_note\", \"edit_credit_note\", \"delete_credit_note\", \"export_credit_note\", \"create_proforma\", \"view_proforma\", \"edit_proforma\", \"delete_proforma\", \"export_proforma\", \"create_payment\", \"view_payment\", \"edit_payment\", \"delete_payment\", \"create_inventory\", \"view_inventory\", \"edit_inventory\", \"delete_inventory\", \"manage_inventory\", \"view_reports\", \"export_reports\", \"view_customer_reports\", \"view_inventory_reports\", \"view_sales_reports\", \"create_customer\", \"view_customer\", \"edit_customer\", \"delete_customer\", \"create_delivery_note\", \"view_delivery_note\", \"edit_delivery_note\", \"delete_delivery_note\", \"create_lpo\", \"view_lpo\", \"edit_lpo\", \"delete_lpo\", \"create_remittance\", \"view_remittance\", \"edit_remittance\", \"delete_remittance\", \"create_user\", \"edit_user\", \"delete_user\", \"manage_users\", \"approve_users\", \"invite_users\", \"view_audit_logs\", \"manage_roles\", \"manage_permissions\", \"access_settings\"]', 1, 1, '2026-01-17 15:31:15', '2026-02-04 17:18:31'),
(900493, 1, 'stock_manager', 'stock_manager', 'Inventory access', '[\"view_inventory\", \"manage_inventory\"]', 1, 1, '2026-01-17 15:31:15', '2026-02-04 17:18:55'),
(900494, 1, 'sales', 'sales', 'Sales team member with limited access - can create and view quotations, invoices, and proforma without delete permissions', '[\"[\", \"\\\"\", \"c\", \"r\", \"e\", \"a\", \"t\", \"e\", \"_\", \"q\", \"u\", \"o\", \"t\", \"a\", \"t\", \"i\", \"o\", \"n\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"q\", \"u\", \"o\", \"t\", \"a\", \"t\", \"i\", \"o\", \"n\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"d\", \"i\", \"t\", \"_\", \"q\", \"u\", \"o\", \"t\", \"a\", \"t\", \"i\", \"o\", \"n\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"x\", \"p\", \"o\", \"r\", \"t\", \"_\", \"q\", \"u\", \"o\", \"t\", \"a\", \"t\", \"i\", \"o\", \"n\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"i\", \"n\", \"v\", \"o\", \"i\", \"c\", \"e\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"x\", \"p\", \"o\", \"r\", \"t\", \"_\", \"i\", \"n\", \"v\", \"o\", \"i\", \"c\", \"e\", \"\\\"\", \",\", \" \", \"\\\"\", \"c\", \"r\", \"e\", \"a\", \"t\", \"e\", \"_\", \"p\", \"r\", \"o\", \"f\", \"o\", \"r\", \"m\", \"a\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"p\", \"r\", \"o\", \"f\", \"o\", \"r\", \"m\", \"a\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"d\", \"i\", \"t\", \"_\", \"p\", \"r\", \"o\", \"f\", \"o\", \"r\", \"m\", \"a\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"x\", \"p\", \"o\", \"r\", \"t\", \"_\", \"p\", \"r\", \"o\", \"f\", \"o\", \"r\", \"m\", \"a\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"c\", \"r\", \"e\", \"d\", \"i\", \"t\", \"_\", \"n\", \"o\", \"t\", \"e\", \"\\\"\", \",\", \" \", \"\\\"\", \"c\", \"r\", \"e\", \"a\", \"t\", \"e\", \"_\", \"c\", \"u\", \"s\", \"t\", \"o\", \"m\", \"e\", \"r\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"c\", \"u\", \"s\", \"t\", \"o\", \"m\", \"e\", \"r\", \"\\\"\", \",\", \" \", \"\\\"\", \"e\", \"d\", \"i\", \"t\", \"_\", \"c\", \"u\", \"s\", \"t\", \"o\", \"m\", \"e\", \"r\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"d\", \"e\", \"l\", \"i\", \"v\", \"e\", \"r\", \"y\", \"_\", \"n\", \"o\", \"t\", \"e\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"r\", \"e\", \"p\", \"o\", \"r\", \"t\", \"s\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"c\", \"u\", \"s\", \"t\", \"o\", \"m\", \"e\", \"r\", \"_\", \"r\", \"e\", \"p\", \"o\", \"r\", \"t\", \"s\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"s\", \"a\", \"l\", \"e\", \"s\", \"_\", \"r\", \"e\", \"p\", \"o\", \"r\", \"t\", \"s\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"l\", \"p\", \"o\", \"\\\"\", \",\", \" \", \"\\\"\", \"v\", \"i\", \"e\", \"w\", \"_\", \"p\", \"a\", \"y\", \"m\", \"e\", \"n\", \"t\", \"\\\"\", \"]\", \"delete_quotation\", \"create_quotation\", \"view_quotation\", \"edit_quotation\", \"export_quotation\"]', 0, 1, '2026-01-26 05:58:10', '2026-02-04 17:19:01'),
(900495, 1, 'accountant', 'accountant', 'Accounts team member with limited access - can manage payments, invoices, and credit notes without delete permissions', '[\"create_invoice\", \"view_invoice\", \"edit_invoice\", \"export_invoice\", \"create_payment\", \"view_payment\", \"edit_payment\", \"create_credit_note\", \"view_credit_note\", \"edit_credit_note\", \"export_credit_note\", \"view_proforma\", \"export_proforma\", \"view_quotation\", \"export_quotation\", \"view_customer\", \"create_remittance\", \"view_remittance\", \"edit_remittance\", \"view_lpo\", \"view_reports\", \"export_reports\", \"view_customer_reports\", \"view_sales_reports\", \"view_delivery_note\", \"view_audit_logs\"]', 0, 1, '2026-01-26 05:58:11', '2026-02-04 17:19:12');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `product_id` int NOT NULL,
  `movement_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `cost_per_unit` decimal(15,2) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `movement_date` date DEFAULT (curdate()),
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `company_id`, `product_id`, `movement_type`, `reference_type`, `reference_id`, `quantity`, `cost_per_unit`, `notes`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'OUT', 'INVOICE', 1, 1.000, 6000.00, 'Stock reduction for invoice INV-02092026-15 (converted from quotation QT-02092026-10)', '2026-09-02', NULL, '2026-09-02 16:35:17', '2026-09-02 16:35:17'),
(2, 1, 1, 'IN', 'ADJUSTMENT', 1, -1.000, NULL, 'Reversal for updated invoice undefined', '2026-10-07', NULL, '2026-10-06 22:44:50', '2026-10-06 22:44:50'),
(3, 0, 1, 'OUT', 'INVOICE', 1, 1.000, 6000.00, 'Stock reduction for updated invoice undefined', '2026-10-07', NULL, '2026-10-06 22:44:51', '2026-10-06 22:44:51'),
(4, 1, 1, 'OUT', 'INVOICE', 2, 1.000, 6500.00, 'Stock reduction for invoice INV-07102026-16', '2026-10-07', NULL, '2026-10-07 03:23:41', '2026-10-07 03:23:41');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `contact_person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tax_settings`
--

CREATE TABLE `tax_settings` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(6,3) DEFAULT '0.000',
  `is_active` tinyint(1) DEFAULT '1',
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_finance`
--

CREATE TABLE `transport_finance` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `material_id` int NOT NULL,
  `buying_price` decimal(12,2) DEFAULT '0.00',
  `fuel_cost` decimal(12,2) DEFAULT '0.00',
  `driver_fees` decimal(12,2) DEFAULT '0.00',
  `other_expenses` decimal(12,2) DEFAULT '0.00',
  `selling_price` decimal(12,2) DEFAULT '0.00',
  `profit_loss` decimal(12,2) DEFAULT '0.00',
  `payment_status` enum('unpaid','paid','pending') DEFAULT 'unpaid',
  `customer_name` varchar(150) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Triggers `transport_finance`
--
DELIMITER $$
CREATE TRIGGER `trg_transport_finance_insert` BEFORE INSERT ON `transport_finance` FOR EACH ROW BEGIN
    SET NEW.profit_loss =
        NEW.selling_price -
        (NEW.buying_price + NEW.fuel_cost + NEW.driver_fees + NEW.other_expenses);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_transport_finance_update` BEFORE UPDATE ON `transport_finance` FOR EACH ROW BEGIN
    SET NEW.profit_loss =
        NEW.selling_price -
        (NEW.buying_price + NEW.fuel_cost + NEW.driver_fees + NEW.other_expenses);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `transport_finance_summary`
--

CREATE TABLE `transport_finance_summary` (
  `id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `material_name` varchar(150) DEFAULT NULL,
  `selling_price` decimal(12,2) DEFAULT NULL,
  `profit_loss` decimal(12,2) DEFAULT NULL,
  `payment_status` enum('unpaid','paid','pending') DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_payments`
--

CREATE TABLE `transport_payments` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `trip_id` int NOT NULL,
  `payment_amount` decimal(15,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cash',
  `reference_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recorded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'info@diagsolutionsltd.com', '$2y$10$eYFzTQxfxCX1Xh5WCAabwevEA1x5rpxY3HtOaoujKAmRybK1gnc3G', 'admin', '2026-01-04 12:59:22'),
(2, 'test@example.com', '$2y$10$eYFzTQxfxCX1Xh5WCAabwevEA1x5rpxY3HtOaoujKAmRybK1gnc3G', 'accountant', '2026-01-05 12:22:24');

-- --------------------------------------------------------

--
-- Table structure for table `user_invitations`
--

CREATE TABLE `user_invitations` (
  `id` int NOT NULL,
  `email` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `company_id` int NOT NULL,
  `invited_by` int DEFAULT NULL,
  `invited_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `invitation_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `permission_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `granted` tinyint(1) DEFAULT '1',
  `granted_by` int DEFAULT NULL,
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `vehicle_number` varchar(50) NOT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `capacity` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','maintenance') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_app_leads`
--

CREATE TABLE `web_app_leads` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_categories`
--

CREATE TABLE `web_categories` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_variants`
--

CREATE TABLE `web_variants` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_notes`
--
ALTER TABLE `credit_notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_note_allocations`
--
ALTER TABLE `credit_note_allocations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customers_company` (`company_id`);

--
-- Indexes for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `delivery_note_number` (`delivery_note_number`);

--
-- Indexes for table `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discovery_leads`
--
ALTER TABLE `discovery_leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_sequences`
--
ALTER TABLE `document_sequences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_type_year` (`document_type`,`year`),
  ADD KEY `idx_document_sequences_type` (`document_type`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_drivers_company` (`company_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `fk_invoices_customer` (`customer_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_items_invoice` (`invoice_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lpos`
--
ALTER TABLE `lpos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lpo_number` (`lpo_number`);

--
-- Indexes for table `lpo_items`
--
ALTER TABLE `lpo_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_material_per_company` (`company_id`,`name`),
  ADD KEY `idx_materials_company` (`company_id`);

--
-- Indexes for table `migration_logs`
--
ALTER TABLE `migration_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter`
--
ALTER TABLE `newsletter`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_number` (`payment_number`);

--
-- Indexes for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_audit_log`
--
ALTER TABLE `payment_audit_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `website_url` (`website_url`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_products_company` (`company_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profiles_company` (`company_id`);

--
-- Indexes for table `proforma_invoices`
--
ALTER TABLE `proforma_invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `proforma_number` (`proforma_number`);

--
-- Indexes for table `proforma_items`
--
ALTER TABLE `proforma_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_receipt_number` (`company_id`,`receipt_number`),
  ADD KEY `change_note_id` (`change_note_id`),
  ADD KEY `idx_receipts_company_id` (`company_id`),
  ADD KEY `idx_receipts_payment_id` (`payment_id`),
  ADD KEY `idx_receipts_invoice_id` (`invoice_id`),
  ADD KEY `idx_receipts_receipt_number` (`receipt_number`),
  ADD KEY `idx_receipts_receipt_date` (`receipt_date`),
  ADD KEY `idx_receipts_receipt_type` (`receipt_type`),
  ADD KEY `idx_receipts_excess_handling` (`excess_handling`),
  ADD KEY `idx_receipts_created_at` (`created_at` DESC);

--
-- Indexes for table `remittance_advice`
--
ALTER TABLE `remittance_advice`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `remittance_number` (`remittance_number`);

--
-- Indexes for table `remittance_advice_items`
--
ALTER TABLE `remittance_advice_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_roles_company` (`company_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tax_settings`
--
ALTER TABLE `tax_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transport_finance`
--
ALTER TABLE `transport_finance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_finance_company` (`company_id`),
  ADD KEY `idx_finance_vehicle` (`vehicle_id`),
  ADD KEY `idx_finance_material` (`material_id`);

--
-- Indexes for table `transport_payments`
--
ALTER TABLE `transport_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_trip_id` (`trip_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_vehicle_per_company` (`company_id`,`vehicle_number`),
  ADD KEY `idx_vehicles_company` (`company_id`);

--
-- Indexes for table `web_app_leads`
--
ALTER TABLE `web_app_leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_categories`
--
ALTER TABLE `web_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `web_variants`
--
ALTER TABLE `web_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_notes`
--
ALTER TABLE `credit_notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_note_allocations`
--
ALTER TABLE `credit_note_allocations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discovery_leads`
--
ALTER TABLE `discovery_leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_sequences`
--
ALTER TABLE `document_sequences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lpos`
--
ALTER TABLE `lpos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lpo_items`
--
ALTER TABLE `lpo_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migration_logs`
--
ALTER TABLE `migration_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `newsletter`
--
ALTER TABLE `newsletter`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_audit_log`
--
ALTER TABLE `payment_audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `portfolios`
--
ALTER TABLE `portfolios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `proforma_invoices`
--
ALTER TABLE `proforma_invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proforma_items`
--
ALTER TABLE `proforma_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=292;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `remittance_advice`
--
ALTER TABLE `remittance_advice`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `remittance_advice_items`
--
ALTER TABLE `remittance_advice_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=900496;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_settings`
--
ALTER TABLE `tax_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_finance`
--
ALTER TABLE `transport_finance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_payments`
--
ALTER TABLE `transport_payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_invitations`
--
ALTER TABLE `user_invitations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_app_leads`
--
ALTER TABLE `web_app_leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_categories`
--
ALTER TABLE `web_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_variants`
--
ALTER TABLE `web_variants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
