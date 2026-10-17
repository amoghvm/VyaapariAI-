-- ============================================================================
-- VyapariAI — Phased Repair Plan (REPAIR_PLAN_STAGED.sql)
-- ============================================================================
-- Purpose: Repair the live Supabase database `vyapariai-dev` to match the
--          migration files, in independently executable, reviewable phases.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor.
--   2. Run Phase 0 (preconditions) and review its output.
--   3. Run one phase at a time: highlight that phase block and click "Run".
--   4. After each phase, run its post-check query and share the output for
--      review before proceeding to the next phase.
--   5. If any STOP CONDITION is met, do NOT proceed; share the output.
--
-- Safety:
--   - Every phase is independently executable.
--   - Existing tables are NEVER recreated (CREATE TABLE IF NOT EXISTS only on
--     confirmed-missing Migration 3 tables).
--   - Existing policies/functions/triggers are replaced ONLY when the plan
--     explicitly calls for it (faulty business_memberships policies, missing
--     functions, missing triggers).
--   - No secrets exposed. No DROP TABLE / TRUNCATE / data modification.
--   - Do NOT run the entire file as one batch.
-- ============================================================================

-- ============================================================================
-- PHASE 0 — Read-only preconditions (run first, review output)
-- ============================================================================
-- STOP CONDITION: If any of these queries return an unexpected result, do not
-- proceed to Phase 1. Share the output for review.

-- 0a. Confirm the 9 core tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles','businesses','business_memberships','stores','store_memberships',
    'product_categories','products','customers','suppliers'
  )
ORDER BY table_name;

-- 0b. Confirm the 8 Migration 3 tables do NOT exist (they must be created)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'expense_categories','expenses','inventory_movements','sales','sale_items',
    'payments','purchases','purchase_items'
  )
ORDER BY table_name;

-- 0c. Confirm the 6 expected functions do NOT exist
SELECT proname, pg_get_function_identity_arguments(oid) AS signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'create_business_with_owner','create_store_with_manager','confirm_sale',
    'record_payment','fn_validate_business_store','fn_prevent_store_business_change'
  )
ORDER BY proname;

-- 0d. Confirm no user-defined table triggers exist
SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
ORDER BY tgrelid::regclass, tgname;

-- 0e. Confirm auth.users exists (required by Migration 3 FKs)
SELECT to_regclass('auth.users') AS auth_users_oid;

-- 0f. Confirm uuid-ossp extension exists
SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';

-- 0g. Baseline: current business_memberships policies (before fix)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'business_memberships'
ORDER BY policyname;

-- ============================================================================
-- PHASE 1 — Fix faulty business_memberships policies (Migration 1 correction)
-- ============================================================================
-- PROBLEM: Existing INSERT, UPDATE, DELETE policies on business_memberships
--          contain self-referential conditions comparing business_id to itself,
--          making them ineffective. The SELECT policy is correct and is left
--          untouched.
-- FIX: Drop and recreate the 3 faulty policies with proper aliasing so that
--      only an owner/admin of the target business can insert/update/delete
--      memberships for that business. Authorization is NOT weakened.
-- RISK: Policy replacement. Guarded by DROP POLICY IF EXISTS + CREATE POLICY.
-- ============================================================================

-- STOP CONDITION: Run Phase 0 first. Proceed only if 9 core tables exist and
--                 the 3 faulty policies are present (see 0g output).

-- 1a. Drop faulty INSERT policy if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='business_memberships'
          AND policyname='Admins can insert business memberships'
    ) THEN
        EXECUTE 'DROP POLICY "Admins can insert business memberships" ON business_memberships';
    END IF;
END $$;

-- 1b. Create corrected INSERT policy
CREATE POLICY "Admins can insert business memberships" ON business_memberships
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM business_memberships bm
        WHERE bm.business_id = business_id        -- unqualified = NEW row's business_id
          AND bm.user_id = auth.uid()
          AND bm.role IN ('owner','admin')
    )
);

-- 1c. Drop faulty UPDATE policy if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='business_memberships'
          AND policyname='Admins can update business memberships'
    ) THEN
        EXECUTE 'DROP POLICY "Admins can update business memberships" ON business_memberships';
    END IF;
END $$;

-- 1d. Create corrected UPDATE policy
CREATE POLICY "Admins can update business memberships" ON business_memberships
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM business_memberships bm
        WHERE bm.business_id = business_id        -- unqualified = OLD row's business_id
          AND bm.user_id = auth.uid()
          AND bm.role IN ('owner','admin')
    )
);

-- 1e. Drop faulty DELETE policy if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename='business_memberships'
          AND policyname='Admins can delete business memberships'
    ) THEN
        EXECUTE 'DROP POLICY "Admins can delete business memberships" ON business_memberships';
    END IF;
END $$;

-- 1f. Create corrected DELETE policy
CREATE POLICY "Admins can delete business memberships" ON business_memberships
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM business_memberships bm
        WHERE bm.business_id = business_id        -- unqualified = OLD row's business_id
          AND bm.user_id = auth.uid()
          AND bm.role IN ('owner','admin')
    )
);

-- 1g. POST-CHECK Phase 1: verify corrected policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'business_memberships'
ORDER BY policyname;

-- ============================================================================
-- PHASE 2 — Create Migration 3 tables in valid dependency order
-- ============================================================================
-- PROBLEM: 8 Migration 3 tables are missing. The original migration file
--          creates `payments` before `purchases`, but `payments.purchase_id`
--          references `purchases(id)`. That forward reference fails when
--          neither table exists.
-- FIX: Create tables in dependency order: purchases BEFORE payments.
--      All tables use CREATE TABLE IF NOT EXISTS (safe if pre-checked empty).
-- RISK: None if Phase 0 confirmed tables are missing. Do NOT run if any table
--       already exists (unreconciled schema risk).
-- ============================================================================

-- STOP CONDITION: Proceed only if Phase 0 (0b) returned ZERO rows for the
--                 8 Migration 3 tables. If any table exists, STOP and share
--                 the output; do not proceed.

-- 2a. expense_categories (depends on businesses, stores — both exist)
CREATE TABLE IF NOT EXISTS expense_categories (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    name text not null,
    description text,
    is_active boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2b. expenses (depends on businesses, stores, expense_categories, auth.users)
CREATE TABLE IF NOT EXISTS expenses (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    category_id uuid references expense_categories(id) on delete set null,
    amount numeric(10,2) not null check (amount >= 0),
    description text not null,
    expense_date date not null,
    payment_method text check (payment_method in ('cash','card','upi','bank_transfer','credit','other')),
    reference text,
    notes text,
    created_by uuid not null references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2c. inventory_movements (depends on businesses, stores, products, auth.users)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    product_id uuid not null references products(id) on delete cascade,
    type text not null check (type in ('sale','purchase_receipt','adjustment_in','adjustment_out','transfer_in','transfer_out','return_in','return_out','opening_stock')),
    reference_type text not null check (reference_type in ('sale','purchase','adjustment','transfer','manual')),
    reference_id uuid null,
    quantity numeric(10,3) not null,
    unit_cost numeric(10,2) null,
    notes text,
    created_by uuid not null references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2d. sales (depends on businesses, stores, customers, auth.users)
CREATE TABLE IF NOT EXISTS sales (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    customer_id uuid references customers(id) on delete set null,
    invoice_number text not null,
    invoice_date date not null,
    subtotal numeric(10,2) not null check (subtotal >= 0),
    tax_amount numeric(10,2) not null check (tax_amount >= 0),
    discount_amount numeric(10,2) not null check (discount_amount >= 0),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    paid_amount numeric(10,2) not null default 0 check (paid_amount >= 0),
    balance_amount numeric(10,2) not null check (balance_amount >= 0),
    payment_status text not null check (payment_status in ('paid','partial','unpaid','overdue')),
    payment_method text check (payment_method in ('cash','card','upi','bank_transfer','credit','other')),
    notes text,
    status text not null check (status in ('draft','confirmed','cancelled','returned')),
    created_by uuid not null references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2e. sale_items (depends on sales, products)
CREATE TABLE IF NOT EXISTS sale_items (
    id uuid primary key default uuid_generate_v4(),
    sale_id uuid not null references sales(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    name text not null,
    description text,
    quantity numeric(10,3) not null check (quantity > 0),
    unit text not null check (unit in ('piece','packet','kg','gram','litre','ml','meter','box','dozen','custom')),
    unit_price numeric(10,2) not null check (unit_price >= 0),
    tax_rate numeric(5,4) not null check (tax_rate >= 0 and tax_rate <= 1),
    discount_amount numeric(10,2) not null check (discount_amount >= 0),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2f. purchases (depends on businesses, stores, suppliers, auth.users)
--     NOTE: Created BEFORE payments to satisfy payments.purchase_id FK.
CREATE TABLE IF NOT EXISTS purchases (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    supplier_id uuid not null references suppliers(id) on delete cascade,
    invoice_number text not null,
    invoice_date date not null,
    subtotal numeric(10,2) not null check (subtotal >= 0),
    tax_amount numeric(10,2) not null check (tax_amount >= 0),
    discount_amount numeric(10,2) not null check (discount_amount >= 0),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    paid_amount numeric(10,2) not null default 0 check (paid_amount >= 0),
    balance_amount numeric(10,2) not null check (balance_amount >= 0),
    payment_status text not null check (payment_status in ('paid','partial','unpaid','overdue')),
    status text not null check (status in ('ordered','received','confirmed','cancelled')),
    notes text,
    created_by uuid not null references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2g. payments (depends on businesses, stores, customers, suppliers, sales, purchases, auth.users)
CREATE TABLE IF NOT EXISTS payments (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    customer_id uuid references customers(id) on delete set null,
    supplier_id uuid references suppliers(id) on delete set null,
    sale_id uuid references sales(id) on delete set null,
    purchase_id uuid references purchases(id) on delete set null,
    amount numeric(10,2) not null check (amount > 0),
    method text not null check (method in ('cash','card','upi','bank_transfer','credit','other')),
    reference text,
    payment_date date not null,
    notes text,
    created_by uuid not null references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2h. purchase_items (depends on purchases, products)
CREATE TABLE IF NOT EXISTS purchase_items (
    id uuid primary key default uuid_generate_v4(),
    purchase_id uuid not null references purchases(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    supplier_product_name text,
    name text not null,
    description text,
    quantity numeric(10,3) not null check (quantity > 0),
    unit text not null check (unit in ('piece','packet','kg','gram','litre','ml','meter','box','dozen','custom')),
    unit_price numeric(10,2) not null check (unit_price >= 0),
    tax_rate numeric(5,4) not null check (tax_rate >= 0 and tax_rate <= 1),
    discount_amount numeric(10,2) not null check (discount_amount >= 0),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    received_quantity numeric(10,3) not null default 0 check (received_quantity >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2i. POST-CHECK Phase 2: confirm all 8 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'expense_categories','expenses','inventory_movements','sales','sale_items',
    'payments','purchases','purchase_items'
  )
ORDER BY table_name;

-- ============================================================================
-- PHASE 3 — Enable RLS + create policies + indexes on Migration 3 tables
-- ============================================================================
-- RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY (idempotent in PostgreSQL).
-- Policies: Add-only (DO ... IF NOT EXISTS). No existing policies replaced.
-- Indexes: CREATE INDEX / CREATE UNIQUE INDEX IF NOT EXISTS.
-- ============================================================================

-- STOP CONDITION: Proceed only if Phase 2 post-check returned all 8 tables.

-- 3a. Enable RLS on all 8 Migration 3 tables
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- 3b. expense_categories policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expense_categories' AND policyname='Members can view expense categories') THEN
        CREATE POLICY "Members can view expense categories" ON expense_categories FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expense_categories.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expense_categories' AND policyname='Business admins can insert expense categories') THEN
        CREATE POLICY "Business admins can insert expense categories" ON expense_categories FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expense_categories.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expense_categories' AND policyname='Business admins can update expense categories') THEN
        CREATE POLICY "Business admins can update expense categories" ON expense_categories FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expense_categories.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expense_categories' AND policyname='Business admins can delete expense categories') THEN
        CREATE POLICY "Business admins can delete expense categories" ON expense_categories FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expense_categories.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3c. expenses policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expenses' AND policyname='Members can view expenses') THEN
        CREATE POLICY "Members can view expenses" ON expenses FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expenses.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expenses' AND policyname='Business admins can insert expenses') THEN
        CREATE POLICY "Business admins can insert expenses" ON expenses FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expenses.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expenses' AND policyname='Business admins can update expenses') THEN
        CREATE POLICY "Business admins can update expenses" ON expenses FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expenses.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expenses' AND policyname='Business admins can delete expenses') THEN
        CREATE POLICY "Business admins can delete expenses" ON expenses FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = expenses.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3d. inventory_movements policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_movements' AND policyname='Members can view inventory movements') THEN
        CREATE POLICY "Members can view inventory movements" ON inventory_movements FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = inventory_movements.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_movements' AND policyname='Business admins can insert inventory movements') THEN
        CREATE POLICY "Business admins can insert inventory movements" ON inventory_movements FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = inventory_movements.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_movements' AND policyname='Business admins can update inventory movements') THEN
        CREATE POLICY "Business admins can update inventory movements" ON inventory_movements FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = inventory_movements.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_movements' AND policyname='Business admins can delete inventory movements') THEN
        CREATE POLICY "Business admins can delete inventory movements" ON inventory_movements FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = inventory_movements.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3e. sales policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sales' AND policyname='Members can view sales') THEN
        CREATE POLICY "Members can view sales" ON sales FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = sales.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sales' AND policyname='Business admins can insert sales') THEN
        CREATE POLICY "Business admins can insert sales" ON sales FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = sales.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sales' AND policyname='Business admins can update sales') THEN
        CREATE POLICY "Business admins can update sales" ON sales FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = sales.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sales' AND policyname='Business admins can delete sales') THEN
        CREATE POLICY "Business admins can delete sales" ON sales FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = sales.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3f. sale_items policies (join through sales for business isolation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sale_items' AND policyname='Members can view sale items') THEN
        CREATE POLICY "Members can view sale items" ON sale_items FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships JOIN sales ON sales.id = sale_items.sale_id WHERE sales.business_id = business_memberships.business_id AND business_memberships.user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sale_items' AND policyname='Business admins can insert sale items') THEN
        CREATE POLICY "Business admins can insert sale items" ON sale_items FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships JOIN sales ON sales.id = sale_items.sale_id WHERE sales.business_id = business_memberships.business_id AND business_memberships.user_id = auth.uid() AND business_memberships.role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sale_items' AND policyname='Business admins can update sale items') THEN
        CREATE POLICY "Business admins can update sale items" ON sale_items FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships JOIN sales ON sales.id = sale_items.sale_id WHERE sales.business_id = business_memberships.business_id AND business_memberships.user_id = auth.uid() AND business_memberships.role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sale_items' AND policyname='Business admins can delete sale items') THEN
        CREATE POLICY "Business admins can delete sale items" ON sale_items FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships JOIN sales ON sales.id = sale_items.sale_id WHERE sales.business_id = business_memberships.business_id AND business_memberships.user_id = auth.uid() AND business_memberships.role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3g. payments policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Members can view payments') THEN
        CREATE POLICY "Members can view payments" ON payments FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = payments.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Business admins can insert payments') THEN
        CREATE POLICY "Business admins can insert payments" ON payments FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = payments.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Business admins can update payments') THEN
        CREATE POLICY "Business admins can update payments" ON payments FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = payments.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Business admins can delete payments') THEN
        CREATE POLICY "Business admins can delete payments" ON payments FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = payments.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3h. purchases policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchases' AND policyname='Members can view purchases') THEN
        CREATE POLICY "Members can view purchases" ON purchases FOR SELECT USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = purchases.business_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchases' AND policyname='Business admins can insert purchases') THEN
        CREATE POLICY "Business admins can insert purchases" ON purchases FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = purchases.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchases' AND policyname='Business admins can update purchases') THEN
        CREATE POLICY "Business admins can update purchases" ON purchases FOR UPDATE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = purchases.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchases' AND policyname='Business admins can delete purchases') THEN
        CREATE POLICY "Business admins can delete purchases" ON purchases FOR DELETE USING (
            EXISTS (SELECT 1 FROM business_memberships WHERE business_id = purchases.business_id AND user_id = auth.uid() AND role IN ('owner','admin'))
        );
    END IF;
END $$;

-- 3i. purchase_items policies (join through purchases for business isolation; SELECT fixed to not reference non-existent purchase_items.business_id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_items' AND policyname='Members can view purchase items') THEN
        CREATE POLICY "Members can view purchase items" ON purchase_items FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM business_memberships
                JOIN purchases ON purchases.id = purchase_items.purchase_id
                WHERE purchases.business_id = business_memberships.business_id
                  AND business_memberships.user_id = auth.uid()
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_items' AND policyname='Business admins can insert purchase items') THEN
        CREATE POLICY "Business admins can insert purchase items" ON purchase_items FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM business_memberships
                JOIN purchases ON purchases.id = purchase_items.purchase_id
                WHERE purchases.business_id = business_memberships.business_id
                  AND business_memberships.user_id = auth.uid()
                  AND business_memberships.role IN ('owner','admin')
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_items' AND policyname='Business admins can update purchase items') THEN
        CREATE POLICY "Business admins can update purchase items" ON purchase_items FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM business_memberships
                JOIN purchases ON purchases.id = purchase_items.purchase_id
                WHERE purchases.business_id = business_memberships.business_id
                  AND business_memberships.user_id = auth.uid()
                  AND business_memberships.role IN ('owner','admin')
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_items' AND policyname='Business admins can delete purchase items') THEN
        CREATE POLICY "Business admins can delete purchase items" ON purchase_items FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM business_memberships
                JOIN purchases ON purchases.id = purchase_items.purchase_id
                WHERE purchases.business_id = business_memberships.business_id
                  AND business_memberships.user_id = auth.uid()
                  AND business_memberships.role IN ('owner','admin')
            )
        );
    END IF;
END $$;

-- 3j. Migration 3 indexes
CREATE INDEX IF NOT EXISTS idx_expense_categories_business_id ON expense_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_business_id ON inventory_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_expenses_store_id ON expenses(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_payments_store_id ON payments(store_id);
CREATE INDEX IF NOT EXISTS idx_purchases_store_id ON purchases(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);

-- 3k. POST-CHECK Phase 3: verify RLS, policies, indexes on Migration 3 tables
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND c.relname IN ('expense_categories','expenses','inventory_movements','sales','sale_items','payments','purchases','purchase_items')
ORDER BY c.relname;

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('expense_categories','expenses','inventory_movements','sales','sale_items','payments','purchases','purchase_items')
ORDER BY tablename, policyname;

SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('expense_categories','expenses','inventory_movements','sales','sale_items','payments','purchases','purchase_items')
ORDER BY tablename, indexname;

-- ============================================================================
-- PHASE 4 — Migration 2 functions: create_business_with_owner, create_store_with_manager
-- ============================================================================
-- Both functions are missing. Created with CREATE OR REPLACE (idempotent).
-- Security: SECURITY DEFINER, SET search_path = public.
-- Grants: REVOKE FROM public, GRANT TO authenticated.
-- ============================================================================

-- STOP CONDITION: Proceed only if Phase 0 (0c) confirmed these functions do
--                 not already exist.

-- 4a. create_business_with_owner (7 parameters, matches migration)
CREATE OR REPLACE FUNCTION public.create_business_with_owner(
    p_name text,
    p_type text,
    p_gst_number text,
    p_address text,
    p_phone text,
    p_email text,
    p_owner_id uuid
)
RETURNS businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business businesses;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF auth.uid() <> p_owner_id THEN
        RAISE EXCEPTION 'Unauthorized: owner_id must match the authenticated user';
    END IF;
    INSERT INTO public.businesses (name, type, gst_number, address, phone, email, settings, is_active)
    VALUES (p_name, p_type, p_gst_number, p_address, p_phone, p_email, '{}'::jsonb, true)
    RETURNING * INTO v_business;
    INSERT INTO public.business_memberships (business_id, user_id, role, joined_at)
    VALUES (v_business.id, p_owner_id, 'owner', timezone('utc'::text, now()));
    RETURN v_business;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_business_with_owner(text, text, text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_business_with_owner(text, text, text, text, text, text, uuid) TO authenticated;

-- 4b. create_store_with_manager (7 parameters — FIXED from original 8-parameter grant)
CREATE OR REPLACE FUNCTION public.create_store_with_manager(
    p_business_id uuid,
    p_name text,
    p_code text,
    p_address text,
    p_phone text,
    p_email text,
    p_manager_id uuid
)
RETURNS stores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_store stores;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF auth.uid() <> p_manager_id THEN
        RAISE EXCEPTION 'Unauthorized: manager_id must match the authenticated user';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM business_memberships
        WHERE business_id = p_business_id AND user_id = auth.uid() AND role IN ('owner','admin')
    ) THEN
        RAISE EXCEPTION 'Unauthorized: user must be an owner or admin of the business to create a store';
    END IF;
    INSERT INTO public.stores (business_id, name, code, address, phone, email, settings, is_active)
    VALUES (p_business_id, p_name, p_code, p_address, p_phone, p_email, '{}'::jsonb, true)
    RETURNING * INTO v_store;
    INSERT INTO public.store_memberships (store_id, user_id, role, joined_at)
    VALUES (v_store.id, p_manager_id, 'manager', timezone('utc'::text, now()));
    RETURN v_store;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_store_with_manager(uuid, text, text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_store_with_manager(uuid, text, text, text, text, text, uuid) TO authenticated;

-- 4c. POST-CHECK Phase 4: verify function signatures and privileges
SELECT proname, pg_get_function_identity_arguments(oid) AS signature, prosecdef AS security_definer
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_business_with_owner','create_store_with_manager')
ORDER BY proname;

SELECT routine_name, privilege_type, grantee
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('create_business_with_owner','create_store_with_manager')
ORDER BY routine_name, grantee;

-- ============================================================================
-- PHASE 5 — Migration 4 functions: confirm_sale, record_payment
-- ============================================================================
-- Both functions are missing. confirm_sale uses products%rowtype (fixed from
-- original product%rowtype). Security: SECURITY DEFINER, SET search_path = public.
-- ============================================================================

-- STOP CONDITION: Proceed only if Phase 0 (0c) confirmed these functions do
--                 not already exist.

-- 5a. confirm_sale (fixed: products%rowtype, not product%rowtype)
CREATE OR REPLACE FUNCTION public.confirm_sale(
    p_sale_id uuid
)
RETURNS sales
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sale sales;
    v_business_id uuid;
    v_store_id uuid;
    v_item record;
    v_product products%rowtype;
    v_current_stock numeric;
    v_subtotal numeric := 0;
    v_tax_amount numeric := 0;
    v_discount_amount numeric := 0;
    v_total_amount numeric := 0;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found';
    END IF;
    IF v_sale.status <> 'draft' THEN
        RAISE EXCEPTION 'Sale is not in draft status';
    END IF;
    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;
    IF NOT EXISTS (
        SELECT 1 FROM public.business_memberships
        WHERE business_id = v_business_id AND user_id = auth.uid() AND role IN ('owner','admin')
    ) THEN
        RAISE EXCEPTION 'Unauthorized: user must be an owner or admin of the business';
    END IF;
    FOR v_item IN
        SELECT * FROM public.sale_items WHERE sale_id = p_sale_id ORDER BY product_id, id
    LOOP
        SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id AND business_id = v_business_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found or does not belong to the business: %', v_item.product_id;
        END IF;
        IF v_product.store_id IS NOT NULL AND v_product.store_id <> v_store_id THEN
            RAISE EXCEPTION 'Product does not belong to the sale store: product store % vs sale store %', v_product.store_id, v_store_id;
        END IF;
        IF NOT v_product.is_service THEN
            SELECT COALESCE(SUM(quantity), 0) INTO v_current_stock
            FROM public.inventory_movements
            WHERE product_id = v_item.product_id AND store_id = v_store_id;
            IF v_current_stock < v_item.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for product %: available %, requested %', v_item.product_id, v_current_stock, v_item.quantity;
            END IF;
        END IF;
        IF v_item.unit_price < 0 THEN RAISE EXCEPTION 'Unit price cannot be negative'; END IF;
        IF v_item.tax_rate < 0 OR v_item.tax_rate > 1 THEN RAISE EXCEPTION 'Tax rate must be between 0 and 1'; END IF;
        IF v_item.discount_amount < 0 THEN RAISE EXCEPTION 'Discount amount cannot be negative'; END IF;
        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_tax_amount := v_tax_amount + (v_item.unit_price * v_item.quantity * v_item.tax_rate);
        v_discount_amount := v_discount_amount + v_item.discount_amount;
        v_total_amount := v_total_amount + ((v_item.unit_price * v_item.quantity) * (1 + v_item.tax_rate) - v_item.discount_amount);
    END LOOP;
    UPDATE public.sales
    SET subtotal = v_subtotal, tax_amount = v_tax_amount, discount_amount = v_discount_amount,
        total_amount = v_total_amount, paid_amount = LEAST(paid_amount, v_total_amount),
        balance_amount = GREATEST(v_total_amount - paid_amount, 0),
        payment_status = CASE WHEN paid_amount >= v_total_amount THEN 'paid'
                              WHEN paid_amount > 0 THEN 'partial'
                              ELSE 'unpaid' END,
        status = 'confirmed', updated_at = timezone('utc'::text, now())
    WHERE id = p_sale_id RETURNING * INTO v_sale;
    FOR v_item IN SELECT * FROM public.sale_items WHERE sale_id = p_sale_id LOOP
        SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;
        IF NOT v_product.is_service THEN
            INSERT INTO public.inventory_movements (business_id, store_id, product_id, type, reference_type, reference_id, quantity, unit_cost, notes, created_by)
            VALUES (v_business_id, v_store_id, v_item.product_id, 'sale', 'sale', p_sale_id, -v_item.quantity, v_product.purchase_price, 'Confirmed sale: ' || v_sale.invoice_number, auth.uid());
        END IF;
    END LOOP;
    RETURN v_sale;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_sale(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_sale(uuid) TO authenticated;

-- 5b. record_payment
CREATE OR REPLACE FUNCTION public.record_payment(
    p_sale_id uuid,
    p_amount numeric,
    p_method text,
    p_reference text,
    p_payment_date date,
    p_notes text
)
RETURNS payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sale sales;
    v_payment payments;
    v_existing_payment payments%rowtype;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Sale not found'; END IF;
    IF v_sale.status <> 'confirmed' THEN RAISE EXCEPTION 'Sale is not in a confirmed state'; END IF;
    IF v_sale.balance_amount <= 0 THEN RAISE EXCEPTION 'Sale has no outstanding balance'; END IF;
    IF p_amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be positive'; END IF;
    IF p_method NOT IN ('cash','card','upi','bank_transfer','credit','other') THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
    IF p_amount > v_sale.balance_amount THEN RAISE EXCEPTION 'Payment amount exceeds outstanding balance'; END IF;
    IF p_reference IS NOT NULL THEN
        SELECT * INTO v_existing_payment FROM public.payments WHERE sale_id = p_sale_id AND reference = p_reference LIMIT 1;
        IF FOUND THEN RAISE EXCEPTION 'A payment with this reference already exists for the sale'; END IF;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.business_memberships
        WHERE business_id = v_sale.business_id AND user_id = auth.uid() AND role IN ('owner','admin')
    ) THEN RAISE EXCEPTION 'Unauthorized: user must be an owner or admin of the business'; END IF;
    INSERT INTO public.payments (business_id, store_id, customer_id, supplier_id, sale_id, purchase_id, amount, method, reference, payment_date, notes, created_by)
    VALUES (v_sale.business_id, v_sale.store_id, v_sale.customer_id, NULL, p_sale_id, NULL, p_amount, p_method, p_reference, p_payment_date, p_notes, auth.uid())
    RETURNING * INTO v_payment;
    UPDATE public.sales
    SET paid_amount = paid_amount + p_amount,
        balance_amount = GREATEST(balance_amount - p_amount, 0),
        payment_status = CASE WHEN paid_amount + p_amount >= total_amount THEN 'paid'
                              WHEN paid_amount + p_amount > 0 THEN 'partial'
                              ELSE 'unpaid' END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_sale_id;
    RETURN v_payment;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, text, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, text, date, text) TO authenticated;

-- 5c. POST-CHECK Phase 5: verify function signatures and privileges
SELECT proname, pg_get_function_identity_arguments(oid) AS signature, prosecdef AS security_definer
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('confirm_sale','record_payment')
ORDER BY proname;

SELECT routine_name, privilege_type, grantee
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('confirm_sale','record_payment')
ORDER BY routine_name, grantee;

-- ============================================================================
-- PHASE 6 — Migration 4-fixes: fn_update_updated_at, unique indexes, confirm_sale replacement
-- ============================================================================
-- 6a: fn_update_updated_at() — creates the trigger function.
-- 6b: updated_at triggers — scoped ONLY to VyapariAI tables (not ALL public
--     tables with updated_at, to avoid touching unrelated tables).
-- 6c: unique indexes for payment idempotency (IF NOT EXISTS).
-- 6d: confirm_sale replacement — DROP FUNCTION IF EXISTS + recreate with
--     pg_advisory_xact_lock on business-store pair. This is the only DROP
--     in the plan; it replaces a missing function so risk is low.
-- ============================================================================

-- STOP CONDITION: Proceed only if Phases 4 and 5 completed successfully.

-- 6a. fn_update_updated_at
CREATE OR REPLACE FUNCTION public.fn_update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 6b. updated_at triggers on VyapariAI tables only (scoped, not all public tables)
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_expense_categories_updated_at ON expense_categories';
    EXECUTE 'CREATE TRIGGER trigger_update_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_expenses_updated_at ON expenses';
    EXECUTE 'CREATE TRIGGER trigger_update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_inventory_movements_updated_at ON inventory_movements';
    EXECUTE 'CREATE TRIGGER trigger_update_inventory_movements_updated_at BEFORE UPDATE ON inventory_movements FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_sales_updated_at ON sales';
    EXECUTE 'CREATE TRIGGER trigger_update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_sale_items_updated_at ON sale_items';
    EXECUTE 'CREATE TRIGGER trigger_update_sale_items_updated_at BEFORE UPDATE ON sale_items FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments';
    EXECUTE 'CREATE TRIGGER trigger_update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_purchases_updated_at ON purchases';
    EXECUTE 'CREATE TRIGGER trigger_update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_purchase_items_updated_at ON purchase_items';
    EXECUTE 'CREATE TRIGGER trigger_update_purchase_items_updated_at BEFORE UPDATE ON purchase_items FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at()';
END $$;

-- 6c. Unique indexes for payment idempotency
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_sale_ref ON payments(sale_id, reference) WHERE reference IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_purchase_ref ON payments(purchase_id, reference) WHERE reference IS NOT NULL;

-- 6d. Inventory index
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_store_type ON inventory_movements(product_id, store_id, type);

-- 6e. Replace confirm_sale with advisory-lock version (DROP + CREATE)
DROP FUNCTION IF EXISTS public.confirm_sale(uuid);

CREATE OR REPLACE FUNCTION public.confirm_sale(
    p_sale_id uuid
)
RETURNS sales
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sale sales;
    v_business_id uuid;
    v_store_id uuid;
    v_item record;
    v_product products%rowtype;
    v_current_stock numeric;
    v_subtotal numeric := 0;
    v_tax_amount numeric := 0;
    v_discount_amount numeric := 0;
    v_total_amount numeric := 0;
    v_lock_key bigint;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found';
    END IF;
    IF v_sale.status <> 'draft' THEN
        RAISE EXCEPTION 'Sale is not in draft status';
    END IF;
    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;
    IF NOT EXISTS (
        SELECT 1 FROM business_memberships
        WHERE business_id = v_business_id AND user_id = auth.uid() AND role IN ('owner','admin')
    ) THEN
        RAISE EXCEPTION 'Unauthorized: user must be an owner or admin of the business';
    END IF;
    v_lock_key := (hashtext(v_business_id::text || '-' || v_store_id::text))::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);
    FOR v_item IN
        SELECT * FROM sale_items WHERE sale_id = p_sale_id ORDER BY product_id, id
    LOOP
        SELECT * INTO v_product FROM products WHERE id = v_item.product_id AND business_id = v_business_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found or does not belong to the business: %', v_item.product_id;
        END IF;
        IF v_product.store_id IS NOT NULL AND v_product.store_id <> v_store_id THEN
            RAISE EXCEPTION 'Product does not belong to the sale store: product store % vs sale store %', v_product.store_id, v_store_id;
        END IF;
        IF NOT v_product.is_service THEN
            SELECT COALESCE(SUM(quantity), 0) INTO v_current_stock
            FROM inventory_movements
            WHERE product_id = v_item.product_id AND store_id = v_store_id;
            IF v_current_stock < v_item.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for product %: available %, requested %', v_item.product_id, v_current_stock, v_item.quantity;
            END IF;
        END IF;
        IF v_item.unit_price < 0 THEN RAISE EXCEPTION 'Unit price cannot be negative'; END IF;
        IF v_item.tax_rate < 0 OR v_item.tax_rate > 1 THEN RAISE EXCEPTION 'Tax rate must be between 0 and 1'; END IF;
        IF v_item.discount_amount < 0 THEN RAISE EXCEPTION 'Discount amount cannot be negative'; END IF;
        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_tax_amount := v_tax_amount + (v_item.unit_price * v_item.quantity * v_item.tax_rate);
        v_discount_amount := v_discount_amount + v_item.discount_amount;
        v_total_amount := v_total_amount + ((v_item.unit_price * v_item.quantity) * (1 + v_item.tax_rate) - v_item.discount_amount);
    END LOOP;
    UPDATE sales
    SET subtotal = v_subtotal, tax_amount = v_tax_amount, discount_amount = v_discount_amount,
        total_amount = v_total_amount, paid_amount = LEAST(paid_amount, v_total_amount),
        balance_amount = GREATEST(v_total_amount - paid_amount, 0),
        payment_status = CASE WHEN paid_amount >= v_total_amount THEN 'paid'
                              WHEN paid_amount > 0 THEN 'partial'
                              ELSE 'unpaid' END,
        status = 'confirmed', updated_at = timezone('utc'::text, now())
    WHERE id = p_sale_id RETURNING * INTO v_sale;
    FOR v_item IN SELECT * FROM sale_items WHERE sale_id = p_sale_id LOOP
        SELECT * INTO v_product FROM products WHERE id = v_item.product_id;
        IF NOT v_product.is_service THEN
            INSERT INTO inventory_movements (business_id, store_id, product_id, type, reference_type, reference_id, quantity, unit_cost, notes, created_by)
            VALUES (v_business_id, v_store_id, v_item.product_id, 'sale', 'sale', p_sale_id, -v_item.quantity, v_product.purchase_price, 'Confirmed sale: ' || v_sale.invoice_number, auth.uid());
        END IF;
    END LOOP;
    RETURN v_sale;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_sale(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_sale(uuid) TO authenticated;

-- 6f. POST-CHECK Phase 6: verify fn_update_updated_at, triggers, indexes, confirm_sale
SELECT proname, pg_get_function_identity_arguments(oid) AS signature
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('fn_update_updated_at','confirm_sale')
ORDER BY proname;

SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND NOT t.tgisinternal
  AND tgname LIKE 'trigger_update_%'
ORDER BY tgrelid::regclass, tgname;

SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
  AND indexname IN ('uq_payments_sale_ref','uq_payments_purchase_ref','idx_inventory_movements_product_store_type')
ORDER BY indexname;

-- ============================================================================
-- PHASE 7 — Migration 5: business/store consistency functions and triggers
-- ============================================================================
-- 7a: fn_validate_business_store() — validates store_id belongs to same business.
-- 7b: 10 trigger_validate_*_bs triggers on tables with business_id + store_id.
-- 7c: fn_prevent_store_business_change() — rejects stores.business_id changes.
-- 7d: trigger_prevent_store_business_change on stores.
-- ============================================================================

-- STOP CONDITION: Proceed only if Phases 2 and 6 completed successfully.

-- 7a. fn_validate_business_store
CREATE OR REPLACE FUNCTION public.fn_validate_business_store()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_store_business_id uuid;
BEGIN
    IF NEW.store_id IS NULL THEN
        RETURN NEW;
    END IF;
    SELECT business_id INTO v_store_business_id FROM public.stores WHERE id = NEW.store_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Store % does not exist', NEW.store_id;
    END IF;
    IF v_store_business_id <> NEW.business_id THEN
        RAISE EXCEPTION 'Store % does not belong to business % (store belongs to %)',
            NEW.store_id, NEW.business_id, v_store_business_id;
    END IF;
    RETURN NEW;
END;
$$;

-- 7b. Consistency triggers (drop/recreate guarded)
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_product_categories_bs ON product_categories';
    EXECUTE 'CREATE TRIGGER trigger_validate_product_categories_bs BEFORE INSERT OR UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_products_bs ON products';
    EXECUTE 'CREATE TRIGGER trigger_validate_products_bs BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_customers_bs ON customers';
    EXECUTE 'CREATE TRIGGER trigger_validate_customers_bs BEFORE INSERT OR UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_suppliers_bs ON suppliers';
    EXECUTE 'CREATE TRIGGER trigger_validate_suppliers_bs BEFORE INSERT OR UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_expense_categories_bs ON expense_categories';
    EXECUTE 'CREATE TRIGGER trigger_validate_expense_categories_bs BEFORE INSERT OR UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_expenses_bs ON expenses';
    EXECUTE 'CREATE TRIGGER trigger_validate_expenses_bs BEFORE INSERT OR UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_inventory_movements_bs ON inventory_movements';
    EXECUTE 'CREATE TRIGGER trigger_validate_inventory_movements_bs BEFORE INSERT OR UPDATE ON inventory_movements FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_sales_bs ON sales';
    EXECUTE 'CREATE TRIGGER trigger_validate_sales_bs BEFORE INSERT OR UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_payments_bs ON payments';
    EXECUTE 'CREATE TRIGGER trigger_validate_payments_bs BEFORE INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_validate_purchases_bs ON purchases';
    EXECUTE 'CREATE TRIGGER trigger_validate_purchases_bs BEFORE INSERT OR UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION public.fn_validate_business_store()';
END $$;

-- 7c. fn_prevent_store_business_change
CREATE OR REPLACE FUNCTION public.fn_prevent_store_business_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.business_id IS DISTINCT FROM OLD.business_id THEN
        RAISE EXCEPTION 'Cannot change business_id of store % from % to %', OLD.id, OLD.business_id, NEW.business_id;
    END IF;
    RETURN NEW;
END;
$$;

-- 7d. Store business_id change prevention trigger
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_prevent_store_business_change ON public.stores';
    EXECUTE 'CREATE TRIGGER trigger_prevent_store_business_change BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_store_business_change()';
END $$;

-- 7e. POST-CHECK Phase 7: verify all consistency functions and triggers
SELECT proname, pg_get_function_identity_arguments(oid) AS signature
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('fn_validate_business_store','fn_prevent_store_business_change')
ORDER BY proname;

SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND NOT t.tgisinternal
  AND (tgname LIKE 'trigger_validate_%' OR tgname = 'trigger_prevent_store_business_change')
ORDER BY tgrelid::regclass, tgname;

-- ============================================================================
-- FINAL POST-CHECK — Full database state summary (read-only)
-- ============================================================================
-- Run after all phases complete. Share this output for review.

SELECT 'tables' AS object_type, COUNT(*) AS object_count
FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 'functions', COUNT(*)
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'
UNION ALL
SELECT 'triggers', COUNT(*)
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND NOT t.tgisinternal
UNION ALL
SELECT 'policies', COUNT(*)
FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- End of REPAIR_PLAN_STAGED.sql
-- ============================================================================
