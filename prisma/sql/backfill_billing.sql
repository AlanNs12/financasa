UPDATE "Transaction"
SET
  billing_month = EXTRACT(MONTH FROM date)::int,
  billing_year  = EXTRACT(YEAR  FROM date)::int
WHERE payment_method = 'CREDIT_CARD'
  AND billing_month IS NULL;
