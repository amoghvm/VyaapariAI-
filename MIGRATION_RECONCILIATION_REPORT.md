# Migration Reconciliation Report — VyapariAI Supabase

## Database State (observed, read-only)

| Item | Observed |
|---|---|
| Core tables (Migration 1) | 9 exist: profiles, businesses, business_memberships, stores, store_memberships, product_categories, products, customers, suppliers |
| RLS | Enabled on all 9 core tables |
| RLS policies | 33 exist on core tables |
| Indexes | 7 exist on core tables |
| CHECK constraints | 12 exist |
| Foreign keys | 16 exist |
| Extension uuid-ossp | Installed |
| Functions create_business_with_owner | NOT FOUND in public |
| Functions create_store_with_manager | NOT FOUND in public |
| Functions confirm_sale | NOT FOUND in public |
| Functions record_payment | NOT FOUND in public |
| Functions fn_validate_business_store | NOT FOUND in public |
| Functions fn_prevent_store_business_change | NOT FOUND in public |
| Triggers trigger_update_*_updated_at | NOT FOUND |
| Triggers trigger_validate_*_bs | NOT FOUND |
| Trigger trigger_prevent_store_business_change | NOT FOUND |
| Unique indexes uq_payments_sale_ref, uq_payments_purchase_ref | NOT FOUND |
| Index idx_inventory_movements_product_store_type | NOT FOUND |
| Migration 3 tables (expense_categories, expenses, inventory_movements, sales, sale_items, payments, purchases, purchase_items) | NOT FOUND |
| supabase_migrations / schema_migrations tracking table | NOT FOUND |
| Environment | PRODUCTION (Supabase dashboard) |

## Per-Migration Object Map

### Migration 1 — 20261015000000_core_schema.sql
Creates/changes:
- Extension: uuid-ossp (IF NOT EXISTS)
- Tables (9): profiles, businesses, business_memberships, stores, store_memberships, product_categories, products, customers, suppliers — each with id uuid PK, created_at/updated_at defaults, CHECK constraints, FKs
- RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY on all 9
- Policies (33): select/insert/update/delete policies on all 9 tables
- Indexes (7): idx_business_memberships_user_id, idx_store_memberships_user_id, idx_stores_business_id, idx_product_categories_business_id, idx_products_business_id, idx_customers_business_id, idx_suppliers_business_id
- No functions, no triggers

### Migration 2 — 20261015010000_secure_business_setup.sql
Creates/changes:
- Extension: uuid-ossp (IF NOT EXISTS)
- Drops 2 policies: "Authenticated users can insert businesses" (on businesses), "Authenticated users can insert stores" (on stores) — guarded by DO blocks checking pg_policies
- Function: create_business_with_owner(text, text, text, text, text, text, uuid) returns businesses, SECURITY DEFINER, SET search_path = public
- Function: create_store_with_manager(uuid, text, text, text, text, text, text, uuid) returns stores, SECURITY DEFINER, SET search_path = public
- Grants: REVOKE EXECUTE FROM public, GRANT EXECUTE TO authenticated on both functions
- No tables, no triggers

### Migration 3 — 20261015020000_transactions_inventory.sql
Creates/changes:
- Tables (8): expense_categories, expenses, inventory_movements, sales, sale_items, payments, purchases, purchase_items — each with id uuid PK, created_at/updated_at defaults, CHECK constraints, FKs referencing Migration 1 tables
- RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY on all 8
- Policies (32): select/insert/update/delete policies on all 8 tables
- Indexes (16): business_id indexes on 8 tables + store_id indexes on 5 + product_id indexes on 3 + sale_items(sale_id) + purchase_items(purchase_id)
- No functions, no triggers

### Migration 4 — 20261015030000_atomic_posting.sql
Creates/changes:
- Extension: uuid-ossp (IF NOT EXISTS)
- Function: confirm_sale(uuid) returns sales, SECURITY DEFINER, SET search_path = public — validates draft sale, checks inventory, creates inventory movements
- Function: record_payment(uuid, numeric, text, text, date, text) returns payments, SECURITY DEFINER, SET search_path = public — records payment, updates sale balance/status
- Grants: REVOKE EXECUTE FROM public, GRANT EXECUTE TO authenticated on both functions
- No tables, no triggers

### Migration 4-fixes — 20261015040000_fixes.sql
Creates/changes:
- Extension: uuid-ossp (IF NOT EXISTS)
- Function: fn_update_updated_at() returns trigger — sets new.updated_at = now()
- Triggers (dynamic): trigger_update_*_updated_at BEFORE UPDATE FOR EACH ROW on all public tables with updated_at column — via DO loop over information_schema.columns
- Unique index: uq_payments_sale_ref ON payments(sale_id, reference) WHERE reference IS NOT NULL (IF NOT EXISTS)
- Unique index: uq_payments_purchase_ref ON payments(purchase_id, reference) WHERE reference IS NOT NULL (IF NOT EXISTS)
- Index: idx_inventory_movements_product_store_type ON inventory_movements(product_id, store_id, type) (IF NOT EXISTS)
- Drops and recreates: confirm_sale(uuid) with pg_advisory_xact_lock on business-store pair
- Grants: REVOKE/GRANT EXECUTE on confirm_sale(uuid)

### Migration 5 — 20261015050000_business_store_consistency.sql
Creates/changes:
- Function: fn_validate_business_store() returns trigger — validates store_id belongs to same business as business_id
- Triggers (11): trigger_validate_product_categories_bs, trigger_validate_products_bs, trigger_validate_customers_bs, trigger_validate_suppliers_bs, trigger_validate_expense_categories_bs, trigger_validate_expenses_bs, trigger_validate_inventory_movements_bs, trigger_validate_sales_bs, trigger_validate_payments_bs, trigger_validate_purchases_bs — BEFORE INSERT OR UPDATE FOR EACH ROW
- Function: fn_prevent_store_business_change() returns trigger — rejects updates changing stores.business_id
- Trigger: trigger_prevent_store_business_change BEFORE UPDATE ON stores FOR EACH ROW

## Rerun Safety Analysis (per statement type)

| Statement type | Safe to rerun? | Risk if rerun on existing DB |
|---|---|---|
| CREATE EXTENSION IF NOT EXISTS | Yes | None (no-op if present) |
| CREATE TABLE (no IF NOT EXISTS) | No | 42P07 relation already exists — aborts migration |
| ALTER TABLE ENABLE ROW LEVEL SECURITY | Yes | Idempotent in PostgreSQL |
| CREATE POLICY (no IF NOT EXISTS) | No | 42P07 policy already exists |
| CREATE INDEX (no IF NOT EXISTS) | No | 42P07 relation already exists |
| CREATE INDEX IF NOT EXISTS | Yes | None (no-op if present) |
| CREATE OR REPLACE FUNCTION | Yes | Redefines function (same signature) |
| DROP FUNCTION IF EXISTS + CREATE OR REPLACE | Yes | Safe if guarded |
| DROP POLICY IF EXISTS | Yes | Removes policy (intended by Migration 2) |
| DO block with DROP TRIGGER IF EXISTS + CREATE TRIGGER | Yes | Safe if guarded |
| CREATE TRIGGER (no check) | No | 42P07 trigger already exists |

## Dependencies and Execution Order

Migration 1 → Migration 2 → Migration 3 → Migration 4 → Migration 4-fixes → Migration 5

Key dependencies:
- Migration 2 functions reference businesses, stores, business_memberships, store_memberships (Migration 1 tables)
- Migration 3 tables reference businesses, stores, products, customers, suppliers (Migration 1 tables); purchases references suppliers
- Migration 4 functions reference sales, sale_items, products, inventory_movements, business_memberships (Migrations 1 & 3)
- Migration 4-fixes references payments, inventory_movements (Migrations 3 & 4); recreates confirm_sale
- Migration 5 triggers reference stores (Migration 1) and all tables with business_id/store_id (Migrations 1 & 3)

Expected functions and triggers (not found in DB):
- create_business_with_owner(text,text,text,text,text,text,uuid) — Migration 2
- create_store_with_manager(uuid,text,text,text,text,text,text,uuid) — Migration 2
- confirm_sale(uuid) — Migration 4 (replaced by Migration 4-fixes version with advisory lock)
- record_payment(uuid,numeric,text,text,date,text) — Migration 4
- fn_update_updated_at() — Migration 4-fixes
- fn_validate_business_store() — Migration 5
- fn_prevent_store_business_change() — Migration 5
- Triggers: trigger_update_*_updated_at (dynamic, all updated_at tables), trigger_validate_*_bs (11 tables), trigger_prevent_store_business_change (stores)

## Migration Status

| Migration | Status | Reason |
|---|---|---|
| 20261015000000_core_schema.sql | PARTIALLY APPLIED | All 9 tables, RLS, 33 policies, 7 indexes, 16 FKs, 12 CHECKs present, but definitions NOT verified against file; no migration tracking row; original 42P07 error confirms partial/previous execution |
| 20261015010000_secure_business_setup.sql | NOT VERIFIED | Neither function found in public; policies may or may not have been dropped |
| 20261015020000_transactions_inventory.sql | NOT VERIFIED | None of the 8 tables found in database |
| 20261015030000_atomic_posting.sql | NOT VERIFIED | Neither function found in public |
| 20261015040000_fixes.sql | NOT VERIFIED | fn_update_updated_at, unique indexes, replacement confirm_sale not found |
| 20261015050000_business_store_consistency.sql | NOT VERIFIED | Neither function nor any trigger found in public |

No migration status should be treated as VERIFIED based solely on local SQL files. Object counts matching do not prove definition equality.

## Additional Read-Only Checks Required Before Any Repair

The available evidence is insufficient to generate definition-certain repair SQL. The following read-only queries must be exported and compared line-by-line against the migration files:

1. `SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position;` — for all 17 tables (9 from Mig 1, 8 from Mig 3)
2. `SELECT conrelid::regclass, conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE contype IN ('f','c','u') AND conrelid::regclass::text LIKE 'public.%' ORDER BY conrelid::regclass;` — FK targets/ON DELETE, CHECK expressions, unique constraints
3. `SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname;` — index column lists
4. `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;` — policy expressions
5. `SELECT proname, pg_get_function_identity_arguments(oid) FROM pg_proc JOIN pg_namespace ON pronamespace=pg_namespace.oid WHERE nspname='public';` — confirm which functions exist and their signatures
6. `SELECT tgname, tgrelid::regclass FROM pg_trigger JOIN pg_class ON tgrelid=pg_class.oid JOIN pg_namespace ON pg_class.relnamespace=pg_namespace.oid WHERE nspname='public' AND NOT tgisinternal;` — confirm which triggers exist
7. `SELECT * FROM supabase.schema_migrations;` or equivalent — check for migration tracking row

Until these results are compared, do not assume any existing object definition matches the migration file. Counts matching is necessary but not sufficient.