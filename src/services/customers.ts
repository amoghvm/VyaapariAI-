import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types'
import type { ServiceResult } from './types'

export async function listCustomers(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<Customer[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as Customer[], error: null }
}

export async function getCustomer(
  businessId: string,
  customerId: string
): Promise<ServiceResult<Customer>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }
  if (!customerId) return { data: null, error: new Error('Missing customer id') }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', customerId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: new Error('Customer not found') }
  return { data: data as Customer, error: null }
}
