-- ============================================================================
-- VyapariAI Supabase Read-Only Database Diagnostics
-- ============================================================================
-- Purpose: Inspect current Supabase database state before applying
--          REPAIR_SCRIPT_REVIEWED.sql.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor.
--   2. Paste the entire contents of this file (or run one numbered section
--      at a time by highlighting that section and clicking "Run").
--   3. Click "Run".
--   4. Compare the results against the migration files and
--      REPAIR_SCRIPT_REVIEWED.sql before applying any repair SQL.
--
-- Safety:
--   - Every statement is a read-only SELECT against information_schema or
--     PostgreSQL catalog views (pg_catalog).
--   - No CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE, or EXECUTE.
--   - No secrets are exposed.
--   - Missing optional schemas / migration-tracking tables are handled
--     gracefully (discovery queries return empty sets; to_regclass returns
--     NULL instead of erroring).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Session context (read-only)
-- ----------------------------------------------------------------------------
SELECT
    current_database() AS database_name,
    current_user AS current_user,
    current_schema() AS current_schema;

-- ----------------------------------------------------------------------------
-- 1. Existing public tables and columns
-- ----------------------------------------------------------------------------
-- 1a. Tables in the public schema
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 1b. Columns: data types, nullability, defaults
SELECT
    table_name,
    ordinal_position,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ----------------------------------------------------------------------------
-- 2. Constraints: PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE
-- ----------------------------------------------------------------------------
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 't' THEN 'TRIGGER'
        WHEN 'x' THEN 'EXCLUSION'
        ELSE contype::text
    END AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass, contype, conname;

-- ----------------------------------------------------------------------------
-- 3. Index definitions
-- ----------------------------------------------------------------------------
-- 3a. Index names and definitions (pg_indexes)
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3b. Additional index metadata: type, unique, primary
SELECT
    t.relname AS table_name,
    i.relname AS index_name,
    am.amname AS index_type,
    ix.indisunique AS is_unique,
    ix.indisprimary AS is_primary,
    pg_get_indexdef(ix.indexrelid) AS definition
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_am am ON am.oid = i.relam
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
ORDER BY t.relname, i.relname;

-- ----------------------------------------------------------------------------
-- 4. RLS status and policies
-- ----------------------------------------------------------------------------
-- 4a. Row Level Security enabled/forced per table
SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 4b. All policies with their expressions (qual = USING, with_check = WITH CHECK)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ----------------------------------------------------------------------------
-- 5. Public functions: signatures, security-definer status, privileges
-- ----------------------------------------------------------------------------
-- 5a. Function definitions and argument signatures
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS argument_signature,
    pg_get_function_result(p.oid) AS return_type,
    p.prosecdef AS is_security_definer,
    p.provolatile AS volatility,
    pg_get_functiondef(p.oid) AS full_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 5b. Execute privileges granted on public functions
SELECT
    routine_schema,
    routine_name,
    privilege_type,
    grantee
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
ORDER BY routine_name, grantee, privilege_type;

-- ----------------------------------------------------------------------------
-- 6. User-defined triggers and their associated functions
-- ----------------------------------------------------------------------------
SELECT
    n.nspname AS schema_name,
    t.tgname AS trigger_name,
    c.relname AS table_name,
    pg_get_triggerdef(t.oid) AS definition,
    CASE
        WHEN t.tgenabled = 'O' THEN 'enabled'
        WHEN t.tgenabled = 'D' THEN 'disabled'
        WHEN t.tgenabled = 'R' THEN 'replica'
        WHEN t.tgenabled = 'A' THEN 'always'
        ELSE t.tgenabled::text
    END AS enabled,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ----------------------------------------------------------------------------
-- 7. Migration-tracking table existence and recorded migrations
-- ----------------------------------------------------------------------------
-- 7a. Discover any migration-tracking-like tables (safe even if none exist)
SELECT
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_name ILIKE '%migration%' OR table_name ILIKE '%schema_migration%'
ORDER BY table_schema, table_name;

-- 7b. Check whether supabase.schema_migrations exists (returns NULL if missing,
--     does not error)
SELECT
    to_regclass('supabase.schema_migrations') AS supabase_schema_migrations_oid;

-- 7c. Recorded migrations (Supabase tracking table).
--     NOTE: Uncomment and run this statement ONLY if step 7b returns a non-null
--     oid (i.e. the table exists). Running it against a missing table errors
--     and stops the batch.
-- SELECT * FROM supabase.schema_migrations ORDER BY version;

-- 7d. Also check the public schema for any application-managed tracking table
--     (commented out; uncomment and adjust table name if step 7a finds one).
-- SELECT * FROM public.schema_migrations ORDER BY version;

-- ============================================================================
-- End of diagnostics
-- ============================================================================
