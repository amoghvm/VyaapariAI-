# REPAIR_SAFETY_REVIEW — VyapariAI Supabase

**Scope:** `REPAIR_SCRIPT_REVIEWED.sql` (1214 lines) reviewed against local migration files and read-only live-database findings.  
**Database inspected:** `vyapariai-dev` (PRODUCTION).  
**Repair script status:** NOT executed.

---

## 1. Live-database findings (read-only inspection)

| Item | Finding |
|------|---------|
| Core tables | 9 exist: `profiles`, `businesses`, `business_memberships`, `stores`, `store_memberships`, `product_categories`, `products`, `customers`, `suppliers` |
| Migration 3 tables | NOT found: `expense_categories`, `expenses`, `inventory_movements`, `sales`, `sale_items`, `payments`, `purchases`, `purchase_items` |
| RLS | Enabled on all 9 core tables |
| RLS policies | 33 exist on core tables |
| Indexes | 7 exist on core tables |
| Constraints | 16 FKs, 12 CHECKs observed |
| Extension | `uuid-ossp` installed |
| Functions | 6 ABSENT: `create_business_with_owner`, `create_store_with_manager`, `confirm_sale`, `record_payment`, `fn_validate_business_store`, `fn_prevent_store_business_change` |
| Triggers | No user-defined table triggers found |
| Event trigger | `ensure_rls` calls `public.rls_auto_enable()` — **preserve**, do not touch |
| Suspicious policies | Several `business_memberships` policies compare `business_id` to itself (self-referential, likely ineffective) |
| Migration history | No application migration-tracking table found |

**Key uncertainty:** Existing object definitions (columns, constraint expressions, policy bodies) have NOT been compared line-by-line against the migration files. Counts matching does not prove definition equality.

---

## 2. Statement-by-statement mapping of `REPAIR_SCRIPT_REVIEWED.sql`

### Step 0 — Extension (uuid-ossp)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 22 | `create extension if not exists "uuid-ossp";` | All migrations | No (idempotent no-op) |

### Step 1 — Migration 1 (core schema objects already present)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 31–39 | Profiles policies (DO + IF NOT EXISTS) | Mig 1 | No (adds missing only) |
| 42–54 | Businesses policies (DO + IF NOT EXISTS) | Mig 1 | No (adds missing only) |
| 57–79 | Business memberships policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 82–99 | Stores policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 102–124 | Store memberships policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 127–149 | Product categories policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 152–174 | Products policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 177–199 | Customers policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 202–224 | Suppliers policies (DO + IF NOT EXISTS) | Mig 1 | No |
| 227–233 | Migration 1 indexes (`create index if not exists`) | Mig 1 | No |

### Step 2 — Migration 2 (secure business setup)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 240–248 | DO block: `DROP POLICY` on `businesses`/`stores` if named policies exist | Mig 2 | **YES** — drops 2 permissive insert policies (intended by Mig 2) |
| 251–284 | `CREATE OR REPLACE FUNCTION create_business_with_owner(...)` | Mig 2 | **YES** — redefines if exists |
| 283–284 | `REVOKE/GRANT EXECUTE` on `create_business_with_owner` | Mig 2 | **YES** — changes function privileges |
| 287–323 | `CREATE OR REPLACE FUNCTION create_store_with_manager(...)` (7-param, fixed) | Mig 2 | **YES** — redefines if exists |
| 325–326 | `REVOKE/GRANT EXECUTE` on `create_store_with_manager` (fixed 7-param signature) | Mig 2 | **YES** — changes function privileges |

### Step 3 — Migration 3 (transactions/inventory tables)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 332–342 | `CREATE TABLE IF NOT EXISTS expense_categories` | Mig 3 | No if absent; **unreconciled if present** |
| 344–358 | `CREATE TABLE IF NOT EXISTS expenses` | Mig 3 | No if absent; **unreconciled if present** |
| 360–373 | `CREATE TABLE IF NOT EXISTS inventory_movements` | Mig 3 | No if absent; **unreconciled if present** |
| 375–395 | `CREATE TABLE IF NOT EXISTS sales` | Mig 3 | No if absent; **unreconciled if present** |
| 397–410 | `CREATE TABLE IF NOT EXISTS sale_items` | Mig 3 | No if absent; **unreconciled if present** |
| 412–427 | `CREATE TABLE IF NOT EXISTS payments` | Mig 3 | No if absent; **unreconciled if present**; FK forward-ref to `purchases` |
| 429–448 | `CREATE TABLE IF NOT EXISTS purchases` | Mig 3 | No if absent; **unreconciled if present** |
| 450–465 | `CREATE TABLE IF NOT EXISTS purchase_items` | Mig 3 | No if absent; **unreconciled if present** |
| 468–475 | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (8 tables) | Mig 3 | No (idempotent in PG) |
| 478–668 | Migration 3 policies (DO + IF NOT EXISTS) | Mig 3 | No (adds missing only) |
| 671–686 | Migration 3 indexes (`create index if not exists`) | Mig 3 | No |

### Step 4 — Migration 4 (atomic posting functions)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 692–815 | `CREATE OR REPLACE FUNCTION confirm_sale(uuid)` (original, no advisory lock) | Mig 4 | **YES** — redefines if exists |
| 817–818 | `REVOKE/GRANT EXECUTE` on `confirm_sale(uuid)` | Mig 4 | **YES** — changes privileges |
| 820–911 | `CREATE OR REPLACE FUNCTION record_payment(...)` | Mig 4 | **YES** — redefines if exists |
| 910–911 | `REVOKE/GRANT EXECUTE` on `record_payment(...)` | Mig 4 | **YES** — changes privileges |

### Step 5 — Migration 4-fixes (updated_at trigger, indexes, confirm_sale replacement)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 918–926 | `CREATE OR REPLACE FUNCTION fn_update_updated_at()` | Mig 4-fixes | **YES** — redefines if exists |
| 929–945 | DO block: `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER trigger_update_*_updated_at` on ALL tables with `updated_at` | Mig 4-fixes | **YES** — drops and recreates triggers on every table with `updated_at` |
| 948–949 | `CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_sale_ref` | Mig 4-fixes | No |
| 951–952 | `CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_purchase_ref` | Mig 4-fixes | No |
| 955–956 | `CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_store_type` | Mig 4-fixes | No |
| 960 | `DROP FUNCTION IF EXISTS public.confirm_sale(uuid);` | Mig 4-fixes | **DESTRUCTIVE** — drops existing `confirm_sale` |
| 962–1089 | `CREATE OR REPLACE FUNCTION confirm_sale(uuid)` (advisory-lock version) | Mig 4-fixes | **YES** — replaces after drop |
| 1091–1092 | `REVOKE/GRANT EXECUTE` on `confirm_sale(uuid)` | Mig 4-fixes | **YES** — changes privileges |

### Step 6 — Migration 5 (business/store consistency)
| Line(s) | Statement | Maps to | Modifies existing objects? |
|---------|-----------|---------|---------------------------|
| 1098–1124 | `CREATE OR REPLACE FUNCTION fn_validate_business_store()` | Mig 5 | **YES** — redefines if exists |
| 1127–1131 | DO block: drop/create `trigger_validate_product_categories_bs` | Mig 5 | **YES** — replaces trigger |
| 1133–1137 | DO block: drop/create `trigger_validate_products_bs` | Mig 5 | **YES** — replaces trigger |
| 1139–1143 | DO block: drop/create `trigger_validate_customers_bs` | Mig 5 | **YES** — replaces trigger |
| 1145–1149 | DO block: drop/create `trigger_validate_suppliers_bs` | Mig 5 | **YES** — replaces trigger |
| 1151–1155 | DO block: drop/create `trigger_validate_expense_categories_bs` | Mig 5 | **YES** — replaces trigger |
| 1157–1161 | DO block: drop/create `trigger_validate_expenses_bs` | Mig 5 | **YES** — replaces trigger |
| 1163–1167 | DO block: drop/create `trigger_validate_inventory_movements_bs` | Mig 5 | **YES** — replaces trigger |
| 1169–1173 | DO block: drop/create `trigger_validate_sales_bs` | Mig 5 | **YES** — replaces trigger |
| 1175–1179 | DO block: drop/create `trigger_validate_payments_bs` | Mig 5 | **YES** — replaces trigger |
| 1181–1185 | DO block: drop/create `trigger_validate_purchases_bs` | Mig 5 | **YES** — replaces trigger |
| 1188–1199 | `CREATE OR REPLACE FUNCTION fn_prevent_store_business_change()` | Mig 5 | **YES** — redefines if exists |
| 1201–1205 | DO block: drop/create `trigger_prevent_store_business_change` on `stores` | Mig 5 | **YES** — replaces trigger |

---

## 3. Risk identification

### 3.1 Policy risks
- **Add-only, never reconcile:** Step 1 and Step 3 policies are guarded by `IF NOT EXISTS`. Wrong or ineffective existing policies are **never corrected**. Live findings note several `business_memberships` policies with self-referential `business_id = business_id` conditions — these will persist.
- **No policy weakening:** Script header correctly prohibits weakening, but it also prohibits strengthening/fixing existing bad policies.

### 3.2 Function risks
- **`CREATE OR REPLACE` silently redefines:** For `create_business_with_owner`, `create_store_with_manager`, `record_payment`, `fn_update_updated_at`, `fn_validate_business_store`, `fn_prevent_store_business_change` — if a function exists with a different body, it is overwritten without warning. If a function exists with a **different signature**, `CREATE OR REPLACE` fails (PostgreSQL cannot change argument types via `CREATE OR REPLACE`).
- **`confirm_sale` created twice:** Step 4 creates `confirm_sale`, then Step 5 immediately `DROP FUNCTION IF EXISTS` and recreates it with advisory locking. Step 4's definition is dead code that is immediately removed — wasted execution and a window where the old (buggy, `product%rowtype`-fixed but no advisory lock) version exists.
- **Security definer:** All six functions are `SECURITY DEFINER` with `SET search_path = public`. If `search_path` is not properly controlled, function execution could reference unintended objects. All migration files and the repair script set `search_path = public`, which is consistent.

### 3.3 Trigger risks
- **Step 5 updated_at trigger loop:** Iterates `information_schema.columns` for every table with `updated_at` in `public`, drops and recreates `trigger_update_*_updated_at`. This is **broad and disruptive** — it touches tables beyond the VyapariAI schema if any other `public` table has an `updated_at` column.
- **Step 6 consistency triggers:** 11 `trigger_validate_*_bs` triggers dropped and recreated. If any exist with different definitions, they are overwritten.
- **`trigger_prevent_store_business_change` on `stores`:** Replaced unconditionally via `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`.
- **Event trigger `ensure_rls`:** Not touched by the script (correct), but `fn_update_updated_at` uses `now()` instead of `timezone('utc'::text, now())` — minor inconsistency with migration convention.

### 3.4 Foreign-key risks
- **`payments` references `purchases` but `purchases` is created after `payments`** (Step 3, lines 412–427 vs 429–448). If neither table exists, `CREATE TABLE payments ... REFERENCES purchases(id)` fails with "relation purchases does not exist". If both exist, `IF NOT EXISTS` skips both — safe but unreconciled.
- **`auth.users(id)` foreign keys:** `expenses.created_by`, `inventory_movements.created_by`, `payments.created_by` reference `auth.users(id)`. Requires `auth` schema and `auth.users` table to exist in the target.

### 3.5 Ordering risks
- Migration 3 tables are not found in the live DB, so all 8 must be created. The `payments`→`purchases` forward reference will break creation if run against an empty DB (step order within the file: `payments` before `purchases`).
- `inventory_movements.product_id` references `products(id)` (Mig 1 table, exists). `sales.customer_id` references `customers(id)` (exists). `payments.supplier_id` references `suppliers(id)` (exists).
- No explicit transaction wrapping — each statement auto-commits. Partial failure leaves the database in an inconsistent state.

### 3.6 Privilege risks
- **No grants to `PUBLIC`:** All grants are to `authenticated` role only. Revokes are `FROM public`. This is correct — no overly broad privileges added.
- **Function execute:** `REVOKE EXECUTE FROM public; GRANT EXECUTE TO authenticated` on all 6 functions. If functions already exist with different privilege grants, they are changed.

### 3.7 Table unreconciliation (CREATE TABLE IF NOT EXISTS)
If any Migration 3 table already exists with a different schema (wrong columns, types, defaults, constraints), `CREATE TABLE IF NOT EXISTS` silently skips it. The script never verifies that existing table definitions match the migration files. This is the largest silent risk: a partially-applied Migration 3 with wrong column types would be left unreconciled, and subsequent policies/indexes/FKs may fail or behave incorrectly.

---

## 4. Destructive / unsafe statements flagged

| Location | Statement | Risk level | Why |
|----------|-----------|------------|-----|
| REPAIR_SCRIPT_REVIEWED.sql:960 | `DROP FUNCTION IF EXISTS public.confirm_sale(uuid);` | HIGH | Drops an existing function. If any object depends on it, the drop cascades or fails. Immediately recreated, but there is a window where `confirm_sale` does not exist. |
| REPAIR_SCRIPT_REVIEWED.sql:929–945 | DO block dropping all `trigger_update_*_updated_at` | MEDIUM | Touches every `public` table with `updated_at`, not just VyapariAI tables. Overwrites triggers on unrelated tables. |
| REPAIR_SCRIPT_REVIEWED.sql:1127–1205 | 12 DO blocks dropping/recreating consistency triggers | MEDIUM | Overwrites any existing trigger with the same name, even if defined differently. |
| REPAIR_SCRIPT_REVIEWED.sql:240–248 | `DROP POLICY` on 2 permissive insert policies | INTENDED | Explicitly required by Migration 2. Guarded by `IF EXISTS`. Safe but modifies existing objects. |
| REPAIR_SCRIPT_REVIEWED.sql:692–815 then 960–1089 | `confirm_sale` created, then dropped and replaced | MEDIUM | Redundant; Step 4 version is dead code. The drop/replace in Step 5 is the effective definition. |
| Throughout | `CREATE OR REPLACE FUNCTION` | MEDIUM | Silent redefinition; fails if signature differs from existing. |
| Throughout | `REVOKE/GRANT EXECUTE` | LOW-MEDIUM | Changes function privileges; intended but should be verified post-run. |

**Grants to PUBLIC:** None found. All grants target `authenticated` only. Revokes target `public`. This is acceptable.

---

## 5. Smallest safe repair plan (separately reviewable steps)

Given live findings: 9 core tables exist with RLS and 33 policies; Migration 3 tables do NOT exist; none of the 6 functions exist; no triggers exist; no migration tracking table.

### Phase A — Read-only preconditions (run first, review output)

Run `READ_ONLY_DIAGNOSTICS.sql` and verify:

1. Confirm the 9 core tables exist with expected columns/types/constraints (compare against `20261015000000_core_schema.sql`).
2. Confirm `uuid-ossp` extension exists.
3. Confirm `auth.users` exists (required by Mig 3 FKs).
4. Confirm none of the 6 functions exist.
5. Confirm no user-defined table triggers exist.
6. Confirm `ensure_rls` event trigger exists (do not touch).
7. Confirm no Migration 3 tables exist.
8. Record current `pg_policies` for the 9 core tables (baseline to compare after).

**Precondition gate:** If any Migration 3 table or any of the 6 functions already exists, STOP and reconcile manually before proceeding.

### Phase B — Step 1 only (Migration 1 policy gaps)

Apply only Step 1 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 1–234):
- Extension (no-op, already present)
- 9 DO blocks adding missing policies on core tables
- 7 `CREATE INDEX IF NOT EXISTS`

**Post-check B:** Query `pg_policies` for each core table; confirm policy count increased only by additions, no existing policies removed. Compare against the 33 policies reported live.

### Phase C — Step 2 only (Migration 2 functions + policy drops)

Apply only Step 2 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 236–326):
- DO block dropping 2 permissive insert policies (guarded)
- `CREATE OR REPLACE FUNCTION create_business_with_owner` (7 params, matches migration)
- `REVOKE/GRANT` on `create_business_with_owner`
- `CREATE OR REPLACE FUNCTION create_store_with_manager` (7 params, fixed signature)
- `REVOKE/GRANT` on `create_store_with_manager`

**Post-check C:** Query `pg_proc` for both functions; confirm signatures `(text,text,text,text,text,text,uuid)` and `(uuid,text,text,text,text,text,uuid)`. Query `pg_policies` to confirm the 2 permissive insert policies are gone. Test `REVOKE`/`GRANT` succeeded via `information_schema.routine_privileges`.

### Phase D — Step 3 only (Migration 3 tables, RLS, policies, indexes)

Apply only Step 3 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 328–686):

**Critical fix needed before this phase:** Reorder table creation so `purchases` is created **before** `payments` (or drop the forward FK from `payments.purchase_id` and add it after via `ALTER TABLE`). Without this, `CREATE TABLE payments ... REFERENCES purchases(id)` fails when `purchases` does not yet exist.

**Post-check D:** Confirm all 8 Migration 3 tables exist; RLS enabled; 32 policies; indexes present. Query `pg_constraint` for FKs.

### Phase E — Step 4 only (Migration 4: confirm_sale original, record_payment)

Apply Step 4 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 688–911), **but skip** if you intend to go straight to Phase F (which replaces `confirm_sale`). If applying Step 4:
- `CREATE OR REPLACE FUNCTION confirm_sale(uuid)` (fixed `products%rowtype`)
- `CREATE OR REPLACE FUNCTION record_payment(...)`
- REVOKE/GRANT on both

**Post-check E:** Confirm both functions exist with correct signatures.

### Phase F — Step 5 only (Migration 4-fixes: updated_at trigger, indexes, confirm_sale replacement)

Apply Step 5 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 913–1092):
- `CREATE OR REPLACE FUNCTION fn_update_updated_at()`
- DO block: drop/create updated_at triggers on all `public` tables with `updated_at` — **consider scoping to VyapariAI tables only**
- Unique indexes `uq_payments_sale_ref`, `uq_payments_purchase_ref`
- Index `idx_inventory_movements_product_store_type`
- `DROP FUNCTION IF EXISTS confirm_sale(uuid);` + recreate with advisory lock
- REVOKE/GRANT on `confirm_sale`

**Post-check F:** Confirm `confirm_sale` uses advisory lock (`pg_advisory_xact_lock` in definition). Confirm unique indexes exist. Confirm updated_at triggers exist on expected tables only.

### Phase G — Step 6 only (Migration 5: consistency functions + triggers)

Apply Step 6 of `REPAIR_SCRIPT_REVIEWED.sql` (lines 1094–1209):
- `CREATE OR REPLACE FUNCTION fn_validate_business_store()`
- 10 DO blocks: drop/create `trigger_validate_*_bs`
- `CREATE OR REPLACE FUNCTION fn_prevent_store_business_change()`
- DO block: drop/create `trigger_prevent_store_business_change` on `stores`

**Post-check G:** Confirm 11 consistency triggers + 1 store trigger exist. Test inserting a row with mismatched `store_id`/`business_id` to confirm trigger raises exception (in a transaction that rolls back).

---

## 6. Remaining uncertainties (do not assume)

1. **Existing table definitions may not match migration files.** The 9 core tables exist, but column names, types, defaults, and constraint expressions have not been compared line-by-line against `20261015000000_core_schema.sql`.
2. **Existing 33 policies may include ineffective/self-referential conditions.** The repair script never fixes them.
3. **`auth.users` existence** not confirmed via direct catalog query (assumed present based on FK references in Mig 1 and Mig 3).
4. **`payments`→`purchases` FK forward reference** will break Migration 3 table creation if neither table exists — must reorder before running Step 3.
5. **No migration tracking table** exists, so there is no authoritative record of what has been applied. All state must be inferred from catalog inspection.

---

## 7. What was NOT done

- Did not connect to Supabase.
- Did not execute any SQL against the database.
- Did not apply any migration or repair script.
- Did not modify any existing files.
- Did not rewrite `REPAIR_SCRIPT_REVIEWED.sql`.
- Did not commit or push anything.

Save this report as `REPAIR_SAFETY_REVIEW.md`.
