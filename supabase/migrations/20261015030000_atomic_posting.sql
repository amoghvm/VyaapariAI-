-- VyapariAI -- Migration 4: Atomic Transaction Posting
-- Created: 2026-10-15 23:03:18

-- Enable uuid-ossp extension (if not already enabled)
create extension if not exists "uuid-ossp";


-- Function: confirm_sale
-- Confirms a draft sale, validates inventory, and creates inventory movements.
-- Parameters:
--   p_sale_id: the id of the sale to confirm
-- Returns: the updated sale record
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
begin
    -- Ensure the authenticated user is present
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    -- Lock the sale row for update to prevent concurrent modifications
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

    -- Get business and store IDs from the sale
    v_business_id := v_sale.business_id;
    v_store_id := v_sale.store_id;

    -- Check that the authenticated user is an owner or admin of the business
    if not exists (
        select 1 from public.business_memberships
        where business_id = v_business_id
          and user_id = auth.uid()
          and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    -- Validate each sale item and calculate totals, and check inventory
    for v_item in
        select * from public.sale_items where sale_id = p_sale_id order by product_id, id
    loop
        -- Check that the product exists and belongs to the business, and lock it
        select * into v_product
        from public.products
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
            from public.inventory_movements
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
    update public.sales
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
        select * from public.sale_items where sale_id = p_sale_id
    loop
        select * into v_product
        from public.products
        where id = v_item.product_id;

        if not v_product.is_service then
            insert into public.inventory_movements (
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




-- Function: record_payment
-- Records a payment against a sale and updates the sale payment status.
-- Parameters:
--   p_sale_id: the id of the sale to pay
--   p_amount: the payment amount
--   p_method: the payment method
--   p_reference: idempotency key or reference (optional)
--   p_payment_date: the date of the payment
--   p_notes: optional notes
-- Returns: the created payment record
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
    -- Ensure the authenticated user is present
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    -- Lock the sale row for update to prevent concurrent modifications
    select * into v_sale
    from public.sales
    where id = p_sale_id
    for update;

    if not found then
        raise exception 'Sale not found';
    end if;

    -- Check that the sale is in a payable state: confirmed and has a positive balance
    if v_sale.status <> 'confirmed' then
        raise exception 'Sale is not in a confirmed state';
    end if;

    if v_sale.balance_amount <= 0 then
        raise exception 'Sale has no outstanding balance';
    end if;

    -- Validate input
    if p_amount <= 0 then
        raise exception 'Payment amount must be positive';
    end if;

    if p_method not in ('cash','card','upi','bank_transfer','credit','other') then
        raise exception 'Invalid payment method';
    end if;

    -- Check that the payment does not exceed the outstanding balance
    if p_amount > v_sale.balance_amount then
        raise exception 'Payment amount exceeds outstanding balance';
    end if;

    -- Check for duplicate payment by reference (if provided)
    if p_reference is not null then
        select * into v_existing_payment
        from public.payments
        where sale_id = p_sale_id
          and reference = p_reference
        limit 1;

        if found then
            raise exception 'A payment with this reference already exists for the sale';
        end if;
    end if;

    -- Check that the authenticated user is an owner or admin of the business
    if not exists (
        select 1 from public.business_memberships
        where business_id = v_sale.business_id
          and user_id = auth.uid()
          and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business';
    end if;

    -- Insert the payment
    insert into public.payments (
        business_id,
        store_id,
        customer_id,
        supplier_id,
        sale_id,
        purchase_id,
        amount,
        method,
        reference,
        payment_date,
        notes,
        created_by
    ) values (
        v_sale.business_id,
        v_sale.store_id,
        v_sale.customer_id,
        null, -- supplier_id is null for sale payments
        p_sale_id,
        null, -- purchase_id is null for sale payments
        p_amount,
        p_method,
        p_reference,
        p_payment_date,
        p_notes,
        auth.uid()
    )
    returning * into v_payment;

    -- Update the sale's paid amount, balance, and payment status
    update public.sales
    set
        paid_amount = paid_amount + p_amount,
        balance_amount = greatest(balance_amount - p_amount, 0),  -- Ensure non-negative
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

-- Revoke execute privilege from public and grant to authenticated users
revoke execute on function public.record_payment(uuid, numeric, text, text, date, text) from public;
grant execute on function public.record_payment(uuid, numeric, text, text, date, text) to authenticated;

