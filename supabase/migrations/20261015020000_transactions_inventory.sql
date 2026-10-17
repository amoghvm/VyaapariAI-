-- VyapariAI -- Migration 3: Transactions and Inventory
-- Created: 2026-10-15 22:43:16


-- expense_categories table
create table expense_categories (
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


-- expenses table
create table expenses (
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


-- inventory_movements table
create table inventory_movements (
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


-- sales table
create table sales (
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


-- sale_items table
create table sale_items (
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


-- payments table
create table payments (
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


-- purchases table
create table purchases (
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


-- purchase_items table
create table purchase_items (
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

-- Enable Row Level Security on new tables
alter table expense_categories enable row level security;
alter table expenses enable row level security;
alter table inventory_movements enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table payments enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;


-- Policies for expense_categories: members can view, admins can insert/update/delete
create policy "Members can view expense categories" on expense_categories for select using (
    exists (
        select 1 from business_memberships
        where business_id = expense_categories.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert expense categories" on expense_categories for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = expense_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update expense categories" on expense_categories for update using (
    exists (
        select 1 from business_memberships
        where business_id = expense_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete expense categories" on expense_categories for delete using (
    exists (
        select 1 from business_memberships
        where business_id = expense_categories.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for expenses: similar
create policy "Members can view expenses" on expenses for select using (
    exists (
        select 1 from business_memberships
        where business_id = expenses.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert expenses" on expenses for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = expenses.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update expenses" on expenses for update using (
    exists (
        select 1 from business_memberships
        where business_id = expenses.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete expenses" on expenses for delete using (
    exists (
        select 1 from business_memberships
        where business_id = expenses.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for inventory_movements: members can view, admins can insert/update/delete
create policy "Members can view inventory movements" on inventory_movements for select using (
    exists (
        select 1 from business_memberships
        where business_id = inventory_movements.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert inventory movements" on inventory_movements for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = inventory_movements.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update inventory movements" on inventory_movements for update using (
    exists (
        select 1 from business_memberships
        where business_id = inventory_movements.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete inventory movements" on inventory_movements for delete using (
    exists (
        select 1 from business_memberships
        where business_id = inventory_movements.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for sales: members can view, admins can insert/update/delete
create policy "Members can view sales" on sales for select using (
    exists (
        select 1 from business_memberships
        where business_id = sales.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert sales" on sales for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = sales.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update sales" on sales for update using (
    exists (
        select 1 from business_memberships
        where business_id = sales.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete sales" on sales for delete using (
    exists (
        select 1 from business_memberships
        where business_id = sales.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for sale_items: members can view, admins can insert/update/delete
create policy "Members can view sale items" on sale_items for select using (
    exists (
        select 1 from business_memberships
        join sales on sales.id = sale_items.sale_id
        where sales.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
    )
);
create policy "Business admins can insert sale items" on sale_items for insert with check (
    exists (
        select 1 from business_memberships
        join sales on sales.id = sale_items.sale_id
        where sales.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);
create policy "Business admins can update sale items" on sale_items for update using (
    exists (
        select 1 from business_memberships
        join sales on sales.id = sale_items.sale_id
        where sales.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);
create policy "Business admins can delete sale items" on sale_items for delete using (
    exists (
        select 1 from business_memberships
        join sales on sales.id = sale_items.sale_id
        where sales.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);


-- Policies for payments: members can view, admins can insert/update/delete
create policy "Members can view payments" on payments for select using (
    exists (
        select 1 from business_memberships
        where business_id = payments.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert payments" on payments for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = payments.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update payments" on payments for update using (
    exists (
        select 1 from business_memberships
        where business_id = payments.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete payments" on payments for delete using (
    exists (
        select 1 from business_memberships
        where business_id = payments.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for purchases: members can view, admins can insert/update/delete
create policy "Members can view purchases" on purchases for select using (
    exists (
        select 1 from business_memberships
        where business_id = purchases.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert purchases" on purchases for insert with check (
    exists (
        select 1 from business_memberships
        where business_id = purchases.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can update purchases" on purchases for update using (
    exists (
        select 1 from business_memberships
        where business_id = purchases.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);
create policy "Business admins can delete purchases" on purchases for delete using (
    exists (
        select 1 from business_memberships
        where business_id = purchases.business_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
);


-- Policies for purchase_items: members can view, admins can insert/update/delete
create policy "Members can view purchase items" on purchase_items for select using (
    exists (
        select 1 from business_memberships
        where business_id = purchase_items.business_id
        and user_id = auth.uid()
    )
);
create policy "Business admins can insert purchase items" on purchase_items for insert with check (
    exists (
        select 1 from business_memberships
        join purchases on purchases.id = purchase_items.purchase_id
        where purchases.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);
create policy "Business admins can update purchase items" on purchase_items for update using (
    exists (
        select 1 from business_memberships
        join purchases on purchases.id = purchase_items.purchase_id
        where purchases.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);
create policy "Business admins can delete purchase items" on purchase_items for delete using (
    exists (
        select 1 from business_memberships
        join purchases on purchases.id = purchase_items.purchase_id
        where purchases.business_id = business_memberships.business_id
        and business_memberships.user_id = auth.uid()
        and business_memberships.role in ('owner','admin')
    )
);


-- Indexes for performance
create index idx_expense_categories_business_id on expense_categories(business_id);
create index idx_expenses_business_id on expenses(business_id);
create index idx_inventory_movements_business_id on inventory_movements(business_id);
create index idx_sales_business_id on sales(business_id);
create index idx_sale_items_sale_id on sale_items(sale_id);
create index idx_payments_business_id on payments(business_id);
create index idx_purchases_business_id on purchases(business_id);
create index idx_purchase_items_purchase_id on purchase_items(purchase_id);
-- Additional indexes for common query patterns
create index idx_expenses_store_id on expenses(store_id);
create index idx_inventory_movements_store_id on inventory_movements(store_id);
create index idx_sales_store_id on sales(store_id);
create index idx_payments_store_id on payments(store_id);
create index idx_purchases_store_id on purchases(store_id);
create index idx_inventory_movements_product_id on inventory_movements(product_id);
create index idx_sale_items_product_id on sale_items(product_id);
create index idx_purchase_items_product_id on purchase_items(product_id);

