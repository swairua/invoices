-- =====================================================
-- REMOTE MIGRATION for fweafrmr_med (live database)
-- Run this in phpMyAdmin (SQL tab) on the LIVE database.
-- Statements 2 and 3 are safe to re-run; statement 1 should be run once
-- (re-running it errors harmlessly if the columns already exist).
-- =====================================================

-- 1) PDF background / watermark image settings on companies
--    Used by Company Settings > Branding > PDF Background Image.
--    NOTE: plain ADD COLUMN (MySQL 8.4 has no IF NOT EXISTS for ADD COLUMN).
--    Run once; re-running only this statement errors harmlessly if columns exist.
ALTER TABLE `companies`
  ADD COLUMN `pdf_background_image` VARCHAR(500) NULL DEFAULT '',
  ADD COLUMN `pdf_background_opacity` VARCHAR(10) NULL DEFAULT '100';

-- 2) Receipt line-item snapshots (INT keys to match the live schema:
--    receipts.id and products.id are INT, so CHAR(36) UUID keys are NOT used here)
CREATE TABLE IF NOT EXISTS `receipt_items` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `receipt_id` INT NOT NULL,
  `product_id` INT DEFAULT NULL,
  `description` TEXT,
  `quantity` DECIMAL(10,3) DEFAULT 1,
  `unit_price` DECIMAL(15,2) DEFAULT 0,
  `tax_percentage` DECIMAL(5,2) DEFAULT 0,
  `tax_amount` DECIMAL(15,2) DEFAULT 0,
  `tax_inclusive` TINYINT(1) DEFAULT 0,
  `tax_setting_id` INT DEFAULT NULL,
  `discount_before_vat` DECIMAL(15,2) DEFAULT 0,
  `line_total` DECIMAL(15,2) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_receipt_items_receipt_id` (`receipt_id`),
  KEY `idx_receipt_items_product_id` (`product_id`),
  CONSTRAINT `fk_receipt_items_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Repair the corrupt `sales` role permissions value
--    (it currently holds a doubly-encoded, character-split JSON array)
UPDATE `roles`
SET `permissions` = '["create_quotation", "view_quotation", "edit_quotation", "export_quotation", "create_invoice", "view_invoice", "edit_invoice", "export_invoice", "create_proforma", "view_proforma", "edit_proforma", "export_proforma", "create_customer", "view_customer", "edit_customer", "view_reports", "export_reports", "view_customer_reports", "view_sales_reports", "view_lpo", "view_payment", "view_delivery_note", "view_remittance"]'
WHERE `id` = 900494 AND `name` = 'sales';
