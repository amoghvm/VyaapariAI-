import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types'
import type { ServiceResult } from './types'

export async function listExpenses(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<Expense[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('business_id', businessId)
    .order('expense_date', { ascending: false })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as Expense[], error: null }
}

export async function getExpense(
  businessId: string,
  expenseId: string
): Promise<ServiceResult<Expense>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }
  if (!expenseId) return { data: null, error: new Error('Missing expense id') }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', expenseId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: new Error('Expense not found') }
  return { data: data as Expense, error: null }
}
