-- Backfill start_month and start_year for existing RecurringBill records
-- Uses created_at to populate the new columns.
-- Run this after applying the migration.

UPDATE "RecurringBill"
SET start_month = EXTRACT(MONTH FROM created_at),
    start_year  = EXTRACT(YEAR  FROM created_at)
WHERE start_month = 1 AND start_year = 2025;
