-- Enable uuid-ossp extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Drop existing permissive insert policies on businesses and stores
-- We drop them only if they exist to avoid errors if they have been altered.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert businesses' AND tablename = 'businesses') THEN
        DROP POLICY "Authenticated users can insert businesses" ON businesses;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert stores' AND tablename = 'stores') THEN
        DROP POLICY "Authenticated users can insert stores" ON stores;
    END IF;
END $$;

-- Function: create_business_with_owner
-- Creates a business and assigns the authenticated user as owner.
-- Parameters:
--   p_name: business name
--   p_type: business type (retail, wholesale, etc.)
--   p_gst_number: GST number (optional)
--   p_address: address (optional)
--   p_phone: phone (optional)
--   p_email: email (optional)
--   p_owner_id: the user id of the owner (must match auth.uid())
-- Returns: the newly created business record
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
    -- Ensure the authenticated user matches the supplied owner_id
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    if auth.uid() <> p_owner_id then
        raise exception 'Unauthorized: owner_id must match the authenticated user';
    end if;

    -- Insert the business
    insert into public.businesses (
        name,
        type,
        gst_number,
        address,
        phone,
        email,
        settings,
        is_active
    ) values (
        p_name,
        p_type,
        p_gst_number,
        p_address,
        p_phone,
        p_email,
        '{}'::jsonb,
        true
    )
    returning * into v_business;

    -- Create an owner membership for the user
    insert into public.business_memberships (
        business_id,
        user_id,
        role,
        joined_at
    ) values (
        v_business.id,
        p_owner_id,
        'owner',
        timezone('utc'::text, now())
    );

    return v_business;
end;
$$;

-- Revoke execute privilege from public and grant to authenticated users
revoke execute on function public.create_business_with_owner(text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_business_with_owner(text, text, text, text, text, text, uuid) to authenticated;

-- Function: create_store_with_manager
-- Creates a store and assigns the authenticated user as manager.
-- Parameters:
--   p_business_id: the business id
--   p_name: store name
--   p_code: store code
--   p_address: address (optional)
--   p_phone: phone (optional)
--   p_email: email (optional)
--   p_manager_id: the user id of the manager (must match auth.uid())
-- Returns: the newly created store record
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
    -- Ensure the authenticated user matches the supplied manager_id
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    if auth.uid() <> p_manager_id then
        raise exception 'Unauthorized: manager_id must match the authenticated user';
    end if;

    -- Check that the authenticated user is an owner or admin of the business
    if not exists (
        select 1 from business_memberships
        where business_id = p_business_id
          and user_id = auth.uid()
          and role in ('owner', 'admin')
    ) then
        raise exception 'Unauthorized: user must be an owner or admin of the business to create a store';
    end if;

    -- Insert the store
    insert into public.stores (
        business_id,
        name,
        code,
        address,
        phone,
        email,
        settings,
        is_active
    ) values (
        p_business_id,
        p_name,
        p_code,
        p_address,
        p_phone,
        p_email,
        '{}'::jsonb,
        true
    )
    returning * into v_store;

    -- Create a manager membership for the user
    insert into public.store_memberships (
        store_id,
        user_id,
        role,
        joined_at
    ) values (
        v_store.id,
        p_manager_id,
        'manager',
        timezone('utc'::text, now())
    );

    return v_store;
end;
$$;

-- Revoke execute privilege from public and grant to authenticated users
revoke execute on function public.create_store_with_manager(uuid, text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_store_with_manager(uuid, text, text, text, text, text, text, uuid) to authenticated;

-- Note: We keep the existing select, update, delete policies as they are.
-- The insert policies have been removed, so only the above RPC functions can insert.