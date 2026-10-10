# Merchant finance tenant identity contract

## Findings
The authenticated merchant identity is `users.merchant_id` (uint). The
`orders`, `stores`, and `payment_merchants` models expose numeric
`merchant_id`. However `transactions`, `refunds`, and `invoices` in
`internal/model/finance.go` expose a string `merchant` only. A string
merchant name is neither a stable ID nor sufficient proof of tenant ownership.

The legacy merchant finance HTTP handlers have been explicitly disabled (503)
until a verified mapping is available. Do **not** substitute
`strconv.Itoa(merchant_id)` or `merchant_name = ?` without confirming the
production schema, values, uniqueness, and ownership linkage.

## Required production read-only validation
1. Inspect `SHOW CREATE TABLE` for users, payment_merchants, transactions,
   refunds, invoices and orders. Do not publish PII or credentials.
2. Compute anonymized counts of null/blank merchant values, ambiguous names,
   duplicate identifiers and orphaned rows.
3. Determine whether `transactions.merchant` refers to a registered
   merchant ID, channel merchant code, account name or other external field.
   Confirm against independent transaction and merchant records.
4. Determine whether refunds and invoices reference transactions or orders.
5. Document any legacy data that cannot be linked unambiguously; quarantine
   it from merchant-accessible APIs pending manual reconciliation.

## Implementation (future gated PR)
1. Introduce nullable indexed `merchant_id` foreign keys on finance tables
   as needed, with a separate backfill migration. Keep legacy columns intact.
2. Create deterministic, audited backfill rules only for verified 1:1 links;
   record unmatched and ambiguous rows without assigning ownership.
3. Scope **every** SELECT, COUNT, lookup by ID, UPDATE and INSERT to the
   authenticated numeric merchant ID at the repository query level.
4. Return 403/404 for any cross-tenant ID lookup. Do not disclose whether
   the foreign record exists.
5. Implement finance-level service methods requiring a merchant ID parameter,
   not optional unrestricted filters. Reject merchant_id=0.
6. Restore disabled routes only when migration verification and two-tenant
   end-to-end tests pass, including concurrent access, pagination, refunds,
   invoices and attempted merchant ID override in request data.
7. Preserve globally scoped finance APIs under admin-only authorization.

## Deployment controls
- Snapshot finance tables and check rollback before running migrations.
- Do not change schema on production through application auto-migrate.
- Deploy migration with explicit audit/checkpoints; then app release.
- Keep old data read-only when ownership is unresolved.
- Maintain fail-closed 503 responses until all gates pass.
