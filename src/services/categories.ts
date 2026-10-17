import { supabase } from '@/lib/supabase'
import type { ProductCategory, ExpenseCategory } from '@/types'
import type { ServiceResult } from './types'

export async function listProductCategories(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<ProductCategory[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('product_categories')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as ProductCategory[], error: null }
}

export async function listExpenseCategories(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<ExpenseCategory[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('expense_categories')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as ExpenseCategory[], error: null }
}
