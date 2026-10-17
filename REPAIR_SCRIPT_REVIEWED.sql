-- ============================================================================
-- VyapariAI Supabase Migration Repair Script
-- ============================================================================
-- Purpose: Add missing migration objects idempotently without dropping tables,
-- truncating data, disabling RLS, weakening policies, or modifying production data.
-- Database: vyapariai-dev (PRODUCTION)
-- ============================================================================
-- SAFETY RULES:
--   - No DROP TABLE
--   - No TRUNCATE
--   - No ALTER TABLE ... DISABLE ROW LEVEL SECURITY
--   - No policy weakening (only ADD missing policies; Migration 2's intended
--     policy removals are guarded and only remove the two explicitly named
--     permissive insert policies)
--   - No data modification (INSERT/UPDATE/DELETE on user tables)
--   - All operations guarded with IF NOT EXISTS / DO blocks / CREATE OR REPLACE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Step 0: Extension (idempotent)
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Step 1: Migration 1 — Core schema objects that may be missing
-- Tables already exist per diagnostics; do NOT recreate them.
-- Add any missing RLS policies and indexes guarded by existence checks.
-- ----------------------------------------------------------------------------

-- Profiles policies (add only if missing)
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
        create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
        create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
    end if;
end $$;

-- Businesses policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='businesses' and policyname='Members can view business') then
        create policy "Members can view business" on businesses for select using (
            exists (select 1 from business_memberships where business_memberships.business_id = businesses.id and business_memberships.user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='businesses' and policyname='Members can update own business') then
        create policy "Members can update own business" on businesses for update using (
            exists (select 1 from business_memberships where business_memberships.business_id = businesses.id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
end $$;

-- Business memberships policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='business_memberships' and policyname='Members can view business memberships') then
        create policy "Members can view business memberships" on business_memberships for select using (
            exists (select 1 from business_memberships bm where bm.business_id = business_memberships.business_id and bm.user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='business_memberships' and policyname='Admins can insert business memberships') then
        create policy "Admins can insert business memberships" on business_memberships for insert with check (
            exists (select 1 from business_memberships where business_id = business_memberships.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='business_memberships' and policyname='Admins can update business memberships') then
        create policy "Admins can update business memberships" on business_memberships for update using (
            exists (select 1 from business_memberships where business_id = business_memberships.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='business_memberships' and policyname='Admins can delete business memberships') then
        create policy "Admins can delete business memberships" on business_memberships for delete using (
            exists (select 1 from business_memberships where business_id = business_memberships.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Stores policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='stores' and policyname='Members can view stores') then
        create policy "Members can view stores" on stores for select using (
            exists (select 1 from business_memberships where business_id = stores.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='stores' and policyname='Business admins can update stores') then
        create policy "Business admins can update stores" on stores for update using (
            exists (select 1 from business_memberships where business_id = stores.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='stores' and policyname='Business admins can delete stores') then
        create policy "Business admins can delete stores" on stores for delete using (
            exists (select 1 from business_memberships where business_id = stores.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Store memberships policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_memberships' and policyname='Members can view store memberships') then
        create policy "Members can view store memberships" on store_memberships for select using (
            exists (select 1 from store_memberships sm join stores s on s.id = sm.store_id join business_memberships bm on bm.business_id = s.business_id where bm.user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_memberships' and policyname='Business admins can insert store memberships') then
        create policy "Business admins can insert store memberships" on store_memberships for insert with check (
            exists (select 1 from store_memberships sm join stores s on s.id = sm.store_id join business_memberships bm on bm.business_id = s.business_id where bm.user_id = auth.uid() and bm.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_memberships' and policyname='Business admins can update store memberships') then
        create policy "Business admins can update store memberships" on store_memberships for update using (
            exists (select 1 from store_memberships sm join stores s on s.id = sm.store_id join business_memberships bm on bm.business_id = s.business_id where bm.user_id = auth.uid() and bm.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_memberships' and policyname='Business admins can delete store memberships') then
        create policy "Business admins can delete store memberships" on store_memberships for delete using (
            exists (select 1 from store_memberships sm join stores s on s.id = sm.store_id join business_memberships bm on bm.business_id = s.business_id where bm.user_id = auth.uid() and bm.role in ('owner','admin'))
        );
    end if;
end $$;

-- Product categories policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_categories' and policyname='Members can view product categories') then
        create policy "Members can view product categories" on product_categories for select using (
            exists (select 1 from business_memberships where business_id = product_categories.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_categories' and policyname='Business admins can insert product categories') then
        create policy "Business admins can insert product categories" on product_categories for insert with check (
            exists (select 1 from business_memberships where business_id = product_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_categories' and policyname='Business admins can update product categories') then
        create policy "Business admins can update product categories" on product_categories for update using (
            exists (select 1 from business_memberships where business_id = product_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_categories' and policyname='Business admins can delete product categories') then
        create policy "Business admins can delete product categories" on product_categories for delete using (
            exists (select 1 from business_memberships where business_id = product_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Products policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Members can view products') then
        create policy "Members can view products" on products for select using (
            exists (select 1 from business_memberships where business_id = products.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Business admins can insert products') then
        create policy "Business admins can insert products" on products for insert with check (
            exists (select 1 from business_memberships where business_id = products.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Business admins can update products') then
        create policy "Business admins can update products" on products for update using (
            exists (select 1 from business_memberships where business_id = products.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Business admins can delete products') then
        create policy "Business admins can delete products" on products for delete using (
            exists (select 1 from business_memberships where business_id = products.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Customers policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Members can view customers') then
        create policy "Members can view customers" on customers for select using (
            exists (select 1 from business_memberships where business_id = customers.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Business admins can insert customers') then
        create policy "Business admins can insert customers" on customers for insert with check (
            exists (select 1 from business_memberships where business_id = customers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Business admins can update customers') then
        create policy "Business admins can update customers" on customers for update using (
            exists (select 1 from business_memberships where business_id = customers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Business admins can delete customers') then
        create policy "Business admins can delete customers" on customers for delete using (
            exists (select 1 from business_memberships where business_id = customers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Suppliers policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='suppliers' and policyname='Members can view suppliers') then
        create policy "Members can view suppliers" on suppliers for select using (
            exists (select 1 from business_memberships where business_id = suppliers.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='suppliers' and policyname='Business admins can insert suppliers') then
        create policy "Business admins can insert suppliers" on suppliers for insert with check (
            exists (select 1 from business_memberships where business_id = suppliers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='suppliers' and policyname='Business admins can update suppliers') then
        create policy "Business admins can update suppliers" on suppliers for update using (
            exists (select 1 from business_memberships where business_id = suppliers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='suppliers' and policyname='Business admins can delete suppliers') then
        create policy "Business admins can delete suppliers" on suppliers for delete using (
            exists (select 1 from business_memberships where business_id = suppliers.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

-- Migration 1 indexes (IF NOT EXISTS)
create index if not exists idx_business_memberships_user_id on business_memberships(user_id);
create index if not exists idx_store_memberships_user_id on store_memberships(user_id);
create index if not exists idx_stores_business_id on stores(business_id);
create index if not exists idx_product_categories_business_id on product_categories(business_id);
create index if not exists idx_products_business_id on products(business_id);
create index if not exists idx_customers_business_id on customers(business_id);
create index if not exists idx_suppliers_business_id on suppliers(business_id);

-- ----------------------------------------------------------------------------
-- Step 2: Migration 2 — Secure business setup functions + policy removals
-- ----------------------------------------------------------------------------

-- Migration 2 removes two permissive insert policies. Guarded: only if they exist.
do $$
begin
    if exists (select 1 from pg_policies where schemaname='public' and tablename='businesses' and policyname='Authenticated users can insert businesses') then
        drop policy "Authenticated users can insert businesses" on businesses;
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='stores' and policyname='Authenticated users can insert stores') then
        drop policy "Authenticated users can insert stores" on stores;
    end if;
end $$;

-- create_business_with_owner (idempotent via CREATE OR REPLACE)
create or replace function public.create_business_with_owner(
    p_name text,
    p_type text,
    p_gst_number text,
    p_address text,
    p_phone text,
    p_email text,
    p_owner_id uuid
)
returns businesses
language plpgsql
security definer
set search_path = public
as $$
declare
    v_business businesses;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;
    if auth.uid() <> p_owner_id then
        raise exception 'Unauthorized: owner_id must match the authenticated user';
    end if;
    insert into public.businesses (name, type, gst_number, address, phone, email, settings, is_active)
    values (p_name, p_type, p_gst_number, p_address, p_phone, p_email, '{}'::jsonb, true)
    returning * into v_business;
    insert into public.business_memberships (business_id, user_id, role, joined_at)
    values (v_business.id, p_owner_id, 'owner', timezone('utc'::text, now()));
    return v_business;
end;
$$;

revoke execute on function public.create_business_with_owner(text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_business_with_owner(text, text, text, text, text, text, uuid) to authenticated;

-- create_store_with_manager (idempotent via CREATE OR REPLACE)
create or replace function public.create_store_with_manager(
    p_business_id uuid,
    p_name text,
    p_code text,
    p_address text,
    p_phone text,
    p_email text,
    p_manager_id uuid
)
returns stores
language plpgsql
security definer
set search_path = public
as $$
declare
    v_store stores;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;
    if auth.uid() <> p_manager_id then
        raise exception 'Unauthorized: manager_id must match the authenticated user';
    end if;
    if not exists (
        select 1 from business_memberships
        where business_id = p_business_id and user_id = auth.uid() and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business to create a store';
    end if;
    insert into public.stores (business_id, name, code, address, phone, email, settings, is_active)
    values (p_business_id, p_name, p_code, p_address, p_phone, p_email, '{}'::jsonb, true)
    returning * into v_store;
    insert into public.store_memberships (store_id, user_id, role, joined_at)
    values (v_store.id, p_manager_id, 'manager', timezone('utc'::text, now()));
    return v_store;
end;
$$;

revoke execute on function public.create_store_with_manager(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.create_store_with_manager(uuid, text, text, text, text, text, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Step 3: Migration 3 — Transactions and inventory tables (idempotent)
-- ----------------------------------------------------------------------------

create table if not exists expense_categories (
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

create table if not exists expenses (
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

create table if not exists inventory_movements (
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

create table if not exists sales (
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

create table if not exists sale_items (
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

create table if not exists payments (
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

create table if not exists purchases (
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

create table if not exists purchase_items (
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

-- RLS on Migration 3 tables (idempotent)
alter table expense_categories enable row level security;
alter table expenses enable row level security;
alter table inventory_movements enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table payments enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;

-- Migration 3 policies (guarded additions)
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expense_categories' and policyname='Members can view expense categories') then
        create policy "Members can view expense categories" on expense_categories for select using (
            exists (select 1 from business_memberships where business_id = expense_categories.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expense_categories' and policyname='Business admins can insert expense categories') then
        create policy "Business admins can insert expense categories" on expense_categories for insert with check (
            exists (select 1 from business_memberships where business_id = expense_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expense_categories' and policyname='Business admins can update expense categories') then
        create policy "Business admins can update expense categories" on expense_categories for update using (
            exists (select 1 from business_memberships where business_id = expense_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expense_categories' and policyname='Business admins can delete expense categories') then
        create policy "Business admins can delete expense categories" on expense_categories for delete using (
            exists (select 1 from business_memberships where business_id = expense_categories.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Members can view expenses') then
        create policy "Members can view expenses" on expenses for select using (
            exists (select 1 from business_memberships where business_id = expenses.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Business admins can insert expenses') then
        create policy "Business admins can insert expenses" on expenses for insert with check (
            exists (select 1 from business_memberships where business_id = expenses.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Business admins can update expenses') then
        create policy "Business admins can update expenses" on expenses for update using (
            exists (select 1 from business_memberships where business_id = expenses.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='Business admins can delete expenses') then
        create policy "Business admins can delete expenses" on expenses for delete using (
            exists (select 1 from business_memberships where business_id = expenses.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='Members can view inventory movements') then
        create policy "Members can view inventory movements" on inventory_movements for select using (
            exists (select 1 from business_memberships where business_id = inventory_movements.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='Business admins can insert inventory movements') then
        create policy "Business admins can insert inventory movements" on inventory_movements for insert with check (
            exists (select 1 from business_memberships where business_id = inventory_movements.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='Business admins can update inventory movements') then
        create policy "Business admins can update inventory movements" on inventory_movements for update using (
            exists (select 1 from business_memberships where business_id = inventory_movements.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory_movements' and policyname='Business admins can delete inventory movements') then
        create policy "Business admins can delete inventory movements" on inventory_movements for delete using (
            exists (select 1 from business_memberships where business_id = inventory_movements.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='Members can view sales') then
        create policy "Members can view sales" on sales for select using (
            exists (select 1 from business_memberships where business_id = sales.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='Business admins can insert sales') then
        create policy "Business admins can insert sales" on sales for insert with check (
            exists (select 1 from business_memberships where business_id = sales.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='Business admins can update sales') then
        create policy "Business admins can update sales" on sales for update using (
            exists (select 1 from business_memberships where business_id = sales.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='Business admins can delete sales') then
        create policy "Business admins can delete sales" on sales for delete using (
            exists (select 1 from business_memberships where business_id = sales.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='Members can view sale items') then
        create policy "Members can view sale items" on sale_items for select using (
            exists (select 1 from business_memberships join sales on sales.id = sale_items.sale_id where sales.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='Business admins can insert sale items') then
        create policy "Business admins can insert sale items" on sale_items for insert with check (
            exists (select 1 from business_memberships join sales on sales.id = sale_items.sale_id where sales.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='Business admins can update sale items') then
        create policy "Business admins can update sale items" on sale_items for update using (
            exists (select 1 from business_memberships join sales on sales.id = sale_items.sale_id where sales.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='Business admins can delete sale items') then
        create policy "Business admins can delete sale items" on sale_items for delete using (
            exists (select 1 from business_memberships join sales on sales.id = sale_items.sale_id where sales.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='Members can view payments') then
        create policy "Members can view payments" on payments for select using (
            exists (select 1 from business_memberships where business_id = payments.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='Business admins can insert payments') then
        create policy "Business admins can insert payments" on payments for insert with check (
            exists (select 1 from business_memberships where business_id = payments.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='Business admins can update payments') then
        create policy "Business admins can update payments" on payments for update using (
            exists (select 1 from business_memberships where business_id = payments.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='Business admins can delete payments') then
        create policy "Business admins can delete payments" on payments for delete using (
            exists (select 1 from business_memberships where business_id = payments.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchases' and policyname='Members can view purchases') then
        create policy "Members can view purchases" on purchases for select using (
            exists (select 1 from business_memberships where business_id = purchases.business_id and user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchases' and policyname='Business admins can insert purchases') then
        create policy "Business admins can insert purchases" on purchases for insert with check (
            exists (select 1 from business_memberships where business_id = purchases.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchases' and policyname='Business admins can update purchases') then
        create policy "Business admins can update purchases" on purchases for update using (
            exists (select 1 from business_memberships where business_id = purchases.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchases' and policyname='Business admins can delete purchases') then
        create policy "Business admins can delete purchases" on purchases for delete using (
            exists (select 1 from business_memberships where business_id = purchases.business_id and user_id = auth.uid() and role in ('owner','admin'))
        );
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchase_items' and policyname='Members can view purchase items') then
        create policy "Members can view purchase items" on purchase_items for select using (
            exists (select 1 from business_memberships join purchases on purchases.id = purchase_items.purchase_id where purchases.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid())
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchase_items' and policyname='Business admins can insert purchase items') then
        create policy "Business admins can insert purchase items" on purchase_items for insert with check (
            exists (select 1 from business_memberships join purchases on purchases.id = purchase_items.purchase_id where purchases.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchase_items' and policyname='Business admins can update purchase items') then
        create policy "Business admins can update purchase items" on purchase_items for update using (
            exists (select 1 from business_memberships join purchases on purchases.id = purchase_items.purchase_id where purchases.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='purchase_items' and policyname='Business admins can delete purchase items') then
        create policy "Business admins can delete purchase items" on purchase_items for delete using (
            exists (select 1 from business_memberships join purchases on purchases.id = purchase_items.purchase_id where purchases.business_id = business_memberships.business_id and business_memberships.user_id = auth.uid() and business_memberships.role in ('owner','admin'))
        );
    end if;
end $$;

-- Migration 3 indexes (IF NOT EXISTS)
create index if not exists idx_expense_categories_business_id on expense_categories(business_id);
create index if not exists idx_expenses_business_id on expenses(business_id);
create index if not exists idx_inventory_movements_business_id on inventory_movements(business_id);
create index if not exists idx_sales_business_id on sales(business_id);
create index if not exists idx_sale_items_sale_id on sale_items(sale_id);
create index if not exists idx_payments_business_id on payments(business_id);
create index if not exists idx_purchases_business_id on purchases(business_id);
create index if not exists idx_purchase_items_purchase_id on purchase_items(purchase_id);
create index if not exists idx_expenses_store_id on expenses(store_id);
create index if not exists idx_inventory_movements_store_id on inventory_movements(store_id);
create index if not exists idx_sales_store_id on sales(store_id);
create index if not exists idx_payments_store_id on payments(store_id);
create index if not exists idx_purchases_store_id on purchases(store_id);
create index if not exists idx_inventory_movements_product_id on inventory_movements(product_id);
create index if not exists idx_sale_items_product_id on sale_items(product_id);
create index if not exists idx_purchase_items_product_id on purchase_items(product_id);

-- ----------------------------------------------------------------------------
-- Step 4: Migration 4 — Atomic posting functions (idempotent via CREATE OR REPLACE)
-- ----------------------------------------------------------------------------

create or replace function public.confirm_sale(
    p_sale_id uuid
)
returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
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
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    select * into v_sale
    from public.sales
    where id = p_sale_id
    for update;

    if not found then
        raise exception 'Sale not found';
    end if;

    if v_sale.status <> 'draft' then
        raise exception 'Sale is not in draft status';
    end if;

    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;

    if not exists (
        select 1 from public.business_memberships
        where business_id = v_business_id and user_id = auth.uid() and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    for v_item in
        select * from public.sale_items where sale_id = p_sale_id order by product_id, id
    loop
        select * into v_product
        from public.products
        where id = v_item.product_id and business_id = v_business_id
        for update;

        if not found then
            raise exception 'Product not found or does not belong to the business: %', v_item.product_id;
        end if;

        if v_product.store_id is not null and v_product.store_id <> v_store_id then
            raise exception 'Product does not belong to the sale store: product store % vs sale store %', v_product.store_id, v_store_id;
        end if;

        if not v_product.is_service then
            select coalesce(sum(quantity), 0) into v_current_stock
            from public.inventory_movements
            where product_id = v_item.product_id and store_id = v_store_id;

            if v_current_stock < v_item.quantity then
                raise exception 'Insufficient stock for product %: available %, requested %', v_item.product_id, v_current_stock, v_item.quantity;
            end if;
        end if;

        if v_item.unit_price < 0 then
            raise exception 'Unit price cannot be negative';
        end if;
        if v_item.tax_rate < 0 or v_item.tax_rate > 1 then
            raise exception 'Tax rate must be between 0 and 1';
        end if;
        if v_item.discount_amount < 0 then
            raise exception 'Discount amount cannot be negative';
        end if;

        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_tax_amount := v_tax_amount + (v_item.unit_price * v_item.quantity * v_item.tax_rate);
        v_discount_amount := v_discount_amount + v_item.discount_amount;
        v_total_amount := v_total_amount + ((v_item.unit_price * v_item.quantity) * (1 + v_item.tax_rate) - v_item.discount_amount);
    end loop;

    update public.sales
    set subtotal = v_subtotal, tax_amount = v_tax_amount, discount_amount = v_discount_amount,
        total_amount = v_total_amount, paid_amount = least(paid_amount, v_total_amount),
        balance_amount = greatest(v_total_amount - paid_amount, 0),
        payment_status = case
            when paid_amount >= v_total_amount then 'paid'
            when paid_amount > 0 then 'partial'
            else 'unpaid'
        end,
        status = 'confirmed', updated_at = timezone('utc'::text, now())
    where id = p_sale_id
    returning * into v_sale;

    for v_item in
        select * from public.sale_items where sale_id = p_sale_id
    loop
        select * into v_product
        from public.products
        where id = v_item.product_id;

        if not v_product.is_service then
            insert into public.inventory_movements (
                business_id, store_id, product_id, type, reference_type, reference_id,
                quantity, unit_cost, notes, created_by
            ) values (
                v_business_id, v_store_id, v_item.product_id, 'sale', 'sale', p_sale_id,
                -v_item.quantity, v_product.purchase_price,
                'Confirmed sale: ' || v_sale.invoice_number, auth.uid()
            );
        end if;
    end loop;

    return v_sale;
end;
$$;

revoke execute on function public.confirm_sale(uuid) from public;
grant execute on function public.confirm_sale(uuid) to authenticated;

create or replace function public.record_payment(
    p_sale_id uuid,
    p_amount numeric,
    p_method text,
    p_reference text,
    p_payment_date date,
    p_notes text
)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_sale sales;
    v_payment payments;
    v_existing_payment payments%rowtype;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    select * into v_sale from public.sales where id = p_sale_id for update;

    if not found then
        raise exception 'Sale not found';
    end if;

    if v_sale.status <> 'confirmed' then
        raise exception 'Sale is not in a confirmed state';
    end if;

    if v_sale.balance_amount <= 0 then
        raise exception 'Sale has no outstanding balance';
    end if;

    if p_amount <= 0 then
        raise exception 'Payment amount must be positive';
    end if;

    if p_method not in ('cash','card','upi','bank_transfer','credit','other') then
        raise exception 'Invalid payment method';
    end if;

    if p_amount > v_sale.balance_amount then
        raise exception 'Payment amount exceeds outstanding balance';
    end if;

    if p_reference is not null then
        select * into v_existing_payment
        from public.payments
        where sale_id = p_sale_id and reference = p_reference
        limit 1;

        if found then
            raise exception 'A payment with this reference already exists for the sale';
        end if;
    end if;

    if not exists (
        select 1 from public.business_memberships
        where business_id = v_sale.business_id and user_id = auth.uid() and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    insert into public.payments (
        business_id, store_id, customer_id, supplier_id, sale_id, purchase_id,
        amount, method, reference, payment_date, notes, created_by
    ) values (
        v_sale.business_id, v_sale.store_id, v_sale.customer_id, null,
        p_sale_id, null, p_amount, p_method, p_reference, p_payment_date, p_notes, auth.uid()
    )
    returning * into v_payment;

    update public.sales
    set paid_amount = paid_amount + p_amount,
        balance_amount = greatest(balance_amount - p_amount, 0),
        payment_status = case
            when paid_amount + p_amount >= total_amount then 'paid'
            when paid_amount + p_amount > 0 then 'partial'
            else 'unpaid'
        end,
        updated_at = timezone('utc'::text, now())
    where id = p_sale_id;

    return v_payment;
end;
$$;

revoke execute on function public.record_payment(uuid, numeric, text, text, date, text) from public;
grant execute on function public.record_payment(uuid, numeric, text, text, date, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Step 5: Migration 4-fixes — fn_update_updated_at, triggers, indexes, confirm_sale replacement
-- ----------------------------------------------------------------------------

-- fn_update_updated_at (idempotent)
create or replace function public.fn_update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Apply updated_at trigger to all tables with updated_at column (guarded re-run)
do $$
declare
    tbl record;
begin
    for tbl in
        select table_name
        from information_schema.columns
        where column_name = 'updated_at' and table_schema = 'public'
    loop
        execute format(
            'drop trigger if exists trigger_update_%I_updated_at on %I; ' ||
            'create trigger trigger_update_%I_updated_at ' ||
            'before update on %I for each row execute function public.fn_update_updated_at();',
            tbl.table_name, tbl.table_name, tbl.table_name, tbl.table_name
        );
    end loop;
end $$;

-- Unique indexes (IF NOT EXISTS)
create unique index if not exists uq_payments_sale_ref
    on payments(sale_id, reference) where reference is not null;

create unique index if not exists uq_payments_purchase_ref
    on payments(purchase_id, reference) where reference is not null;

-- Inventory index (IF NOT EXISTS)
create index if not exists idx_inventory_movements_product_store_type
    on inventory_movements(product_id, store_id, type);

-- Replace confirm_sale with enhanced version (advisory lock)
-- Guarded: drop if exists then create
drop function if exists public.confirm_sale(uuid);

create or replace function public.confirm_sale(
    p_sale_id uuid
)
returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
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
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    select * into v_sale
    from sales
    where id = p_sale_id
    for update;

    if not found then
        raise exception 'Sale not found';
    end if;

    if v_sale.status <> 'draft' then
        raise exception 'Sale is not in draft status';
    end if;

    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;

    if not exists (
        select 1 from business_memberships
        where business_id = v_business_id and user_id = auth.uid() and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    v_lock_key := (hashtext(v_business_id::text || '-' || v_store_id::text))::bigint;
    perform pg_advisory_xact_lock(v_lock_key);

    for v_item in
        select * from sale_items where sale_id = p_sale_id order by product_id, id
    loop
        select * into v_product
        from products
        where id = v_item.product_id and business_id = v_business_id
        for update;

        if not found then
            raise exception 'Product not found or does not belong to the business: %', v_item.product_id;
        end if;

        if v_product.store_id is not null and v_product.store_id <> v_store_id then
            raise exception 'Product does not belong to the sale store: product store % vs sale store %', v_product.store_id, v_store_id;
        end if;

        if not v_product.is_service then
            select coalesce(sum(quantity), 0) into v_current_stock
            from inventory_movements
            where product_id = v_item.product_id and store_id = v_store_id;

            if v_current_stock < v_item.quantity then
                raise exception 'Insufficient stock for product %: available %, requested %', v_item.product_id, v_current_stock, v_item.quantity;
            end if;
        end if;

        if v_item.unit_price < 0 then
            raise exception 'Unit price cannot be negative';
        end if;
        if v_item.tax_rate < 0 or v_item.tax_rate > 1 then
            raise exception 'Tax rate must be between 0 and 1';
        end if;
        if v_item.discount_amount < 0 then
            raise exception 'Discount amount cannot be negative';
        end if;

        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_tax_amount := v_tax_amount + (v_item.unit_price * v_item.quantity * v_item.tax_rate);
        v_discount_amount := v_discount_amount + v_item.discount_amount;
        v_total_amount := v_total_amount + ((v_item.unit_price * v_item.quantity) * (1 + v_item.tax_rate) - v_item.discount_amount);
    end loop;

    update sales
    set subtotal = v_subtotal, tax_amount = v_tax_amount, discount_amount = v_discount_amount,
        total_amount = v_total_amount, paid_amount = least(paid_amount, v_total_amount),
        balance_amount = greatest(v_total_amount - paid_amount, 0),
        payment_status = case
            when paid_amount >= v_total_amount then 'paid'
            when paid_amount > 0 then 'partial'
            else 'unpaid'
        end,
        status = 'confirmed', updated_at = timezone('utc'::text, now())
    where id = p_sale_id
    returning * into v_sale;

    for v_item in
        select * from sale_items where sale_id = p_sale_id
    loop
        select * into v_product
        from products
        where id = v_item.product_id;

        if not v_product.is_service then
            insert into inventory_movements (
                business_id, store_id, product_id, type, reference_type, reference_id,
                quantity, unit_cost, notes, created_by
            ) values (
                v_business_id, v_store_id, v_item.product_id, 'sale', 'sale', p_sale_id,
                -v_item.quantity, v_product.purchase_price,
                'Confirmed sale: ' || v_sale.invoice_number, auth.uid()
            );
        end if;
    end loop;

    return v_sale;
end;
$$;

revoke execute on function public.confirm_sale(uuid) from public;
grant execute on function public.confirm_sale(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Step 6: Migration 5 — Business/store consistency functions and triggers
-- ----------------------------------------------------------------------------

create or replace function public.fn_validate_business_store()
returns trigger
language plpgsql
as $$
declare
    v_store_business_id uuid;
begin
    if new.store_id is null then
        return new;
    end if;

    select business_id into v_store_business_id
    from public.stores
    where id = new.store_id;

    if not found then
        raise exception 'Store % does not exist', new.store_id;
    end if;

    if v_store_business_id <> new.business_id then
        raise exception 'Store % does not belong to business % (store belongs to %)',
            new.store_id, new.business_id, v_store_business_id;
    end if;

    return new;
end;
$$;

-- Consistency triggers (guarded: drop if exists then create)
do $$
begin
    execute 'drop trigger if exists trigger_validate_product_categories_bs on product_categories';
    execute 'create trigger trigger_validate_product_categories_bs before insert or update on product_categories for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_products_bs on products';
    execute 'create trigger trigger_validate_products_bs before insert or update on products for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_customers_bs on customers';
    execute 'create trigger trigger_validate_customers_bs before insert or update on customers for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_suppliers_bs on suppliers';
    execute 'create trigger trigger_validate_suppliers_bs before insert or update on suppliers for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_expense_categories_bs on expense_categories';
    execute 'create trigger trigger_validate_expense_categories_bs before insert or update on expense_categories for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_expenses_bs on expenses';
    execute 'create trigger trigger_validate_expenses_bs before insert or update on expenses for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_inventory_movements_bs on inventory_movements';
    execute 'create trigger trigger_validate_inventory_movements_bs before insert or update on inventory_movements for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_sales_bs on sales';
    execute 'create trigger trigger_validate_sales_bs before insert or update on sales for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_payments_bs on payments';
    execute 'create trigger trigger_validate_payments_bs before insert or update on payments for each row execute function public.fn_validate_business_store()';
end $$;

do $$
begin
    execute 'drop trigger if exists trigger_validate_purchases_bs on purchases';
    execute 'create trigger trigger_validate_purchases_bs before insert or update on purchases for each row execute function public.fn_validate_business_store()';
end $$;

-- fn_prevent_store_business_change (idempotent)
create or replace function public.fn_prevent_store_business_change()
returns trigger
language plpgsql
as $$
begin
    if new.business_id is distinct from old.business_id then
        raise exception 'Cannot change business_id of store % from % to %',
            old.id, old.business_id, new.business_id;
    end if;
    return new;
end;
$$;

do $$
begin
    execute 'drop trigger if exists trigger_prevent_store_business_change on public.stores';
    execute 'create trigger trigger_prevent_store_business_change before update on public.stores for each row execute function public.fn_prevent_store_business_change()';
end $$;

-- ============================================================================
-- End of repair script
-- ============================================================================
-- NOTE: Before applying, run the read-only diagnostic queries listed in
-- MIGRATION_RECONCILIATION_REPORT.md and compare definitions against the
-- migration files. This script adds missing objects but does not verify that
-- existing object definitions match the migration files exactly.
-- ============================================================================