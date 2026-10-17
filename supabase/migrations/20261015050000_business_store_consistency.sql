-- VyapariAI -- Migration 5: Business/Store consistency constraints
-- Created: 2026-10-15 19:40:00

-- Function to validate that store_id (if not null) belongs to the same business as business_id
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

-- Apply trigger to all tables that have both business_id and store_id columns
-- Tables: product_categories, products, customers, suppliers, expense_categories,
--         expenses, inventory_movements, sales, payments, purchases

create trigger trigger_validate_product_categories_bs
    before insert or update on product_categories
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_products_bs
    before insert or update on products
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_customers_bs
    before insert or update on customers
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_suppliers_bs
    before insert or update on suppliers
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_expense_categories_bs
    before insert or update on expense_categories
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_expenses_bs
    before insert or update on expenses
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_inventory_movements_bs
    before insert or update on inventory_movements
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_sales_bs
    before insert or update on sales
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_payments_bs
    before insert or update on payments
    for each row execute function public.fn_validate_business_store();

create trigger trigger_validate_purchases_bs
    before insert or update on purchases
    for each row execute function public.fn_validate_business_store();

-- Function to prevent changing a store's business_id
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

-- Trigger to reject updates that change stores.business_id
create trigger trigger_prevent_store_business_change
    before update on public.stores
    for each row execute function public.fn_prevent_store_business_change();