-- VyapariAI -- Migration 4: Corrective fixes
-- Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

-- Enable uuid-ossp extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Function to automatically update updated_at column
create or replace function public.fn_update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Apply updated_at trigger to all tables that have the column
-- Uses DROP TRIGGER IF EXISTS + CREATE TRIGGER to be safe for re-runs
do $$
declare
    tbl record;
begin
    for tbl in
        select table_name
        from information_schema.columns
        where column_name = 'updated_at'
          and table_schema = 'public'
    loop
        execute format('
            drop trigger if exists trigger_update_%I_updated_at on %I;
            create trigger trigger_update_%I_updated_at
            before update on %I
            for each row
            execute function public.fn_update_updated_at();
        ', tbl.table_name, tbl.table_name, tbl.table_name, tbl.table_name);
    end loop;
end $$;

-- Add unique indexes for payment idempotency
create unique index if not exists uq_payments_sale_ref
    on payments(sale_id, reference)
    where reference is not null;

create unique index if not exists uq_payments_purchase_ref
    on payments(purchase_id, reference)
    where reference is not null;

-- Add index for faster inventory stock checks
create index if not exists idx_inventory_movements_product_store_type
    on inventory_movements(product_id, store_id, type);

-- Replace confirm_sale function with enhanced version
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
    v_product product%rowtype;
    v_current_stock numeric;
    v_subtotal numeric := 0;
    v_tax_amount numeric := 0;
    v_discount_amount numeric := 0;
    v_total_amount numeric := 0;
    v_lock_key bigint;
begin
    -- Ensure the authenticated user is present
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    -- Lock the sale row for update to prevent concurrent modifications
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

    -- Get business and store IDs from the sale
    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;

    -- Check that the authenticated user is an owner or admin of the business
    if not exists (
        select 1 from business_memberships
        where business_id = v_business_id
          and user_id = auth.uid()
          and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    -- Advisory lock on product-store pair to prevent concurrent inventory mutations
    v_lock_key := (hashtext(v_business_id::text || '-' || v_store_id::text))::bigint;
    perform pg_advisory_xact_lock(v_lock_key);

    -- Validate each sale item and calculate totals, and check inventory
    for v_item in
        select * from sale_items where sale_id = p_sale_id order by product_id, id
    loop
        -- Check that the product exists and belongs to the business, and lock it
        select * into v_product
        from products
        where id = v_item.product_id
          and business_id = v_business_id
        for update;

        if not found then
            raise exception 'Product not found or does not belong to the business: %', v_item.product_id;
        end if;

        -- Validate product/store link: product must be either unassigned to a store or assigned to this sale's store
        if v_product.store_id is not null and v_product.store_id <> v_store_id then
            raise exception 'Product does not belong to the sale store: product store % vs sale store %', v_product.store_id, v_store_id;
        end if;

        -- For service products, we don't check inventory
        if not v_product.is_service then
            -- Calculate current stock for this product at this store (signed quantities)
            select coalesce(sum(quantity), 0) into v_current_stock
            from inventory_movements
            where product_id = v_item.product_id
              and store_id = v_store_id;

            if v_current_stock < v_item.quantity then
                raise exception 'Insufficient stock for product %: available %, requested %', v_item.product_id, v_current_stock, v_item.quantity;
            end if;
        end if;

        -- Validate unit price, tax rate, discount amount (though these are already constrained by the table, we check again for safety)
        if v_item.unit_price < 0 then
            raise exception 'Unit price cannot be negative';
        end if;

        if v_item.tax_rate < 0 or v_item.tax_rate > 1 then
            raise exception 'Tax rate must be between 0 and 1';
        end if;

        if v_item.discount_amount < 0 then
            raise exception 'Discount amount cannot be negative';
        end if;

        -- Calculate item total and accumulate
        v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
        v_tax_amount := v_tax_amount + (v_item.unit_price * v_item.quantity * v_item.tax_rate);
        v_discount_amount := v_discount_amount + v_item.discount_amount;
        v_total_amount := v_total_amount + ((v_item.unit_price * v_item.quantity) * (1 + v_item.tax_rate) - v_item.discount_amount);
    end loop;

    -- Update the sale with calculated totals and status
    update sales
    set
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        discount_amount = v_discount_amount,
        total_amount = v_total_amount,
        paid_amount = least(paid_amount, v_total_amount),  -- Ensure paid_amount does not exceed total_amount
        balance_amount = greatest(v_total_amount - paid_amount, 0),  -- Recalculate balance
        payment_status = case
            when paid_amount >= v_total_amount then 'paid'
            when paid_amount > 0 then 'partial'
            else 'unpaid'
        end,
        status = 'confirmed',
        updated_at = timezone('utc'::text, now())
        where id = p_sale_id
        returning * into v_sale;

    -- Create inventory movements for each sale item (if not service)
    for v_item in
        select * from sale_items where sale_id = p_sale_id
    loop
        select * into v_product
        from products
        where id = v_item.product_id;

        if not v_product.is_service then
            insert into inventory_movements (
                business_id,
                store_id,
                product_id,
                type,
                reference_type,
                reference_id,
                quantity,
                unit_cost,
                notes,
                created_by
            ) values (
                v_business_id,
                v_store_id,
                v_item.product_id,
                'sale',
                'sale',
                p_sale_id,
                -v_item.quantity,  -- Negative because it's a reduction in stock
                v_product.purchase_price,  -- Use purchase price as unit cost (or could be average cost)
                'Confirmed sale: ' || v_sale.invoice_number,
                auth.uid()
            );
        end if;
    end loop;

    return v_sale;
    end;
$$;

-- Revoke execute privilege from public and grant to authenticated users
revoke execute on function public.confirm_sale(uuid) from public;
grant execute on function public.confirm_sale(uuid) to authenticated;

-- Note: record_payment function remains unchanged except for the unique indexes added above.
