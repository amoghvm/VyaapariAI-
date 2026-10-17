-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- profiles table
create table profiles (
    id uuid primary key references auth.users on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    preferred_language text not null default 'en',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- businesses table
create table businesses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type text not null check (type in ('retail','wholesale','manufacturing','services','restaurant','other')),
    gst_number text,
    address text,
    phone text,
    email text,
    logo_url text,
    settings jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- business_memberships table
create table business_memberships (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('owner','admin','manager','staff','viewer')),
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(business_id, user_id)
);

-- stores table
create table stores (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    name text not null,
    code text not null,
    address text,
    phone text,
    email text,
    is_active boolean not null default true,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(business_id, code)
);

-- store_memberships table
create table store_memberships (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('manager','staff','viewer')),
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(store_id, user_id)
);

-- product_categories table
create table product_categories (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    name text not null,
    description text,
    parent_id uuid references product_categories(id) on delete set null,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- products table
create table products (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    category_id uuid references product_categories(id) on delete set null,
    name text not null,
    description text,
    sku text,
    barcode text,
    unit text not null check (unit in ('piece','packet','kg','gram','litre','ml','meter','box','dozen','custom')),
    sale_price numeric(10,2) not null check (sale_price >= 0),
    purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
    tax_rate numeric(5,4) not null check (tax_rate >= 0 and tax_rate <= 1),
    reorder_level integer not null default 0 check (reorder_level >= 0),
    reorder_quantity integer not null default 0 check (reorder_quantity >= 0),
    is_active boolean not null default true,
    is_service boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- customers table
create table customers (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    name text not null,
    phone text,
    email text,
    address text,
    gst_number text,
    credit_limit numeric(10,2) not null default 0 check (credit_limit >= 0),
    payment_terms integer not null default 0 check (payment_terms >= 0),
    is_active boolean not null default true,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- suppliers table
create table suppliers (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid not null references businesses(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    name text not null,
    contact_person text,
    phone text,
    email text,
    address text,
    gst_number text,
    payment_terms integer not null default 0 check (payment_terms >= 0),
    is_active boolean not null default true,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_memberships enable row level security;
alter table stores enable row level security;
alter table store_memberships enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;

-- Policies for profiles: users can view their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for businesses: users can view businesses they are members of
create policy "Members can view business" on businesses for select using (
    exists (
        select 1 from business_memberships
        where business_memberships.business_id = businesses.id
        and business_memberships.user_id = auth.uid()
    )
);
-- Only owners/admins can update own business
create policy "Members can update own business" on businesses for update using (
    exists (
        select 1 from business_memberships
        where business_memberships.business_id = businesses.id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);
-- Authenticated users can insert businesses (via RPC)
create policy "Authenticated users can insert businesses" on businesses for insert with check (auth.uid() is not null);

-- Policies for business_memberships: users can view memberships of businesses they belong to
create policy "Members can view business memberships" on business_memberships for select using (
    exists (
        select 1 from business_memberships bm
        where bm.business_id = business_memberships.business_id
        and bm.user_id = auth.uid()
    )
);
-- Admins can insert business memberships
create policy "Admins can insert business memberships" on business_memberships for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = business_memberships.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
-- Admins can update business memberships
create policy "Admins can update business memberships" on business_memberships for update using (
    exists (
        select 1 from business_memberships
        where business_id = business_memberships.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
-- Admins can delete business memberships
create policy "Admins can delete business memberships" on business_memberships for delete using (
    exists (
        select 1 from business_memberships
        where business_id = business_memberships.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Policies for stores: users can view stores of businesses they belong to
create policy "Members can view stores" on stores for select using (
    exists (
        select 1 from business_memberships
        where business_id = stores.business_id
        and user_id = auth.uid()
    )
);
-- Authenticated users can insert stores (via RPC)
create policy "Authenticated users can insert stores" on stores for insert with check (auth.uid() is not null);
-- Business admins can update stores
create policy "Business admins can update stores" on stores for update using (
    exists (
        select 1 from business_memberships
        where business_id = stores.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
-- Business admins can delete stores
create policy "Business admins can delete stores" on stores for delete using (
    exists (
        select 1 from business_memberships
        where business_id = stores.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Policies for store_memberships: users can view memberships of stores they belong to (via business membership)
create policy "Members can view store memberships" on store_memberships for select using (
    exists (
        select 1 from store_memberships sm
        join stores s on s.id = sm.store_id
        join business_memberships bm on bm.business_id = s.business_id
        where bm.user_id = auth.uid()
    )
);
-- Business admins can insert store memberships
create policy "Business admins can insert store memberships" on store_memberships for insert with check (
    exists (
        select 1 from store_memberships sm
        join stores s on s.id = sm.store_id
        join business_memberships bm on bm.business_id = s.business_id
        where bm.user_id = auth.uid()
        and bm.role in ('owner','admin')
    )
);
-- Business admins can update store memberships
create policy "Business admins can update store memberships" on store_memberships for update using (
    exists (
        select 1 from store_memberships sm
        join stores s on s.id = sm.store_id
        join business_memberships bm on bm.business_id = s.business_id
        where bm.user_id = auth.uid()
        and bm.role in ('owner','admin')
    )
);
-- Business admins can delete store memberships
create policy "Business admins can delete store memberships" on store_memberships for delete using (
    exists (
        select 1 from store_memberships sm
        join stores s on s.id = sm.store_id
        join business_memberships bm on bm.business_id = s.business_id
        where bm.user_id = auth.uid()
        and bm.role in ('owner','admin')
    )
);

-- Policies for product_categories: users can view categories of businesses they belong to
create policy "Members can view product categories" on product_categories for select using (
    exists (
        select 1 from business_memberships
        where business_id = product_categories.business_id
        and user_id = auth.uid()
    )
);
-- Business admins can insert product categories
create policy "Business admins can insert product categories" on product_categories for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = product_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
-- Business admins can update product categories
create policy "Business admins can update product categories" on product_categories for update using (
    exists (
        select 1 from business_memberships
        where business_id = product_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
-- Business admins can delete product categories
create policy "Business admins can delete product categories" on product_categories for delete using (
    exists (
        select 1 from business_memberships
        where business_id = product_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Policies for products: similar
create policy "Members can view products" on products for select using (
    exists (
        select 1 from business_memberships
        where business_id = products.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert products" on products for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = products.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update products" on products for update using (
    exists (
        select 1 from business_memberships
        where business_id = products.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete products" on products for delete using (
    exists (
        select 1 from business_memberships
        where business_id = products.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Policies for customers: similar
create policy "Members can view customers" on customers for select using (
    exists (
        select 1 from business_memberships
        where business_id = customers.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert customers" on customers for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = customers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update customers" on customers for update using (
    exists (
        select 1 from business_memberships
        where business_id = customers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete customers" on customers for delete using (
    exists (
        select 1 from business_memberships
        where business_id = customers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Policies for suppliers: similar
create policy "Members can view suppliers" on suppliers for select using (
    exists (
        select 1 from business_memberships
        where business_id = suppliers.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert suppliers" on suppliers for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = suppliers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update suppliers" on suppliers for update using (
    exists (
        select 1 from business_memberships
        where business_id = suppliers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete suppliers" on suppliers for delete using (
    exists (
        select 1 from business_memberships
        where business_id = suppliers.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);

-- Indexes for performance
create index idx_business_memberships_user_id on business_memberships(user_id);
create index idx_store_memberships_user_id on store_memberships(user_id);
create index idx_stores_business_id on stores(business_id);
create index idx_product_categories_business_id on product_categories(business_id);
create index idx_products_business_id on products(business_id);
create index idx_customers_business_id on customers(business_id);
create index idx_suppliers_business_id on suppliers(business_id);