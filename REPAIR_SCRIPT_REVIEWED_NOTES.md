# REPAIR_SCRIPT_REVIEWED Notes

## Source
`REPAIR_SCRIPT.sql` (1214 lines) → reviewed copy `REPAIR_SCRIPT_REVIEWED.sql` (1214 lines).

## Corrections applied

### 1. `create_store_with_manager` REVOKE/GRANT signature (lines 325-326)
The function declares 7 parameters:
`(p_business_id uuid, p_name text, p_code text, p_address text, p_phone text, p_email text, p_manager_id uuid)`
i.e. SQL signature `(uuid, text, text, text, text, text, uuid)`.

The original REVOKE/GRANT listed 8 parameters `(uuid, text, text, text, text, text, text, uuid)`, which does not match the function and would fail at `REVOKE`/`GRANT execute on function ...`.

Fixed both statements to the 7-parameter signature:
```
revoke execute on function public.create_store_with_manager(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.create_store_with_manager(uuid, text, text, text, text, text, uuid) to authenticated;
```

### 2. `product%rowtype` → `products%rowtype` (2 occurrences)
There is no `product` table; the table is `products`. Both record variable declarations were invalid:

- Step 4 `confirm_sale` (original line 705): `v_product product%rowtype;` → `v_product products%rowtype;`
- Step 5 replacement `confirm_sale` (original line 975): `v_product product%rowtype;` → `v_product products%rowtype;`

All field accesses on `v_product` (`is_service`, `store_id`, `purchase_price`) are valid `products` columns.

### 3. `purchase_items` SELECT policy (lines 648-652)
The `purchase_items` table has no `business_id` column, so the original SELECT policy referenced a non-existent column:
```
exists (select 1 from business_memberships where business_id = purchase_items.business_id and user_id = auth.uid())
```
→ Invalid reference.

Fixed to join through `purchases` and check membership against `purchases.business_id`, consistent with the insert/update/delete purchase_items policies already in the script:
```
exists (select 1 from business_memberships
        join purchases on purchases.id = purchase_items.purchase_id
        where purchases.business_id = business_memberships.business_id
          and business_memberships.user_id = auth.uid())
```

## Additional review findings (require database verification — not fixed)

These were observed during review of the full script. None were changed, because the task scope was the three identified corrections, and each flagged item depends on the actual target database state.

- **FK forward reference ordering (Step 3):** `payments` (created ~line 412) declares `purchase_id uuid references purchases(id)`, but `purchases` is created later (~line 429). With `CREATE TABLE IF NOT EXISTS`, this is safe only if `purchases` already exists in the target DB; if the script must create `purchases`, ordering matters. Verify target state before applying.
- **Function drop in Step 5:** `drop function if exists public.confirm_sale(uuid);` then recreates it. This is a DROP (not a table, so not covered by the script's safety rules), but it removes and replaces an existing function. Verify no dependent objects break and that the recreation is intended.
- **`auth.users(id)` foreign keys:** `expenses.created_by`, `inventory_movements.created_by`, `payments.created_by` reference `auth.users(id)`. Requires `auth.users` to exist in the target schema.
- **RLS/policy parity:** The script only adds missing policies and does not verify existing policy definitions match the migration files (per its own end-note). Existing object definitions are not reconciled.
- **Trigger re-creation:** Step 5 drops/recreates `trigger_update_*_updated_at` on every table with an `updated_at` column via dynamic SQL; Step 6 drops/recreates consistency triggers. Idempotent but disruptive on re-run.

## Safety statement
Syntax corrections do not make this script production-safe. It targets `vyapariai-dev (PRODUCTION)` per its header. Run the read-only diagnostics in `MIGRATION_RECONCILIATION_REPORT.md` and compare definitions against migration files before applying. No SQL was executed, no Supabase connection was made, and no migration files or git history were modified.
