import { supabase } from '@/lib/supabase'
import type { Supplier } from '@/types'
import type { ServiceResult } from './types'

export async function listSuppliers(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<Supplier[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as Supplier[], error: null }
}

export async function getSupplier(
  businessId: string,
  supplierId: string
): Promise<ServiceResult<Supplier>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }
  if (!supplierId) return { data: null, error: new Error('Missing supplier id') }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', supplierId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: new Error('Supplier not found') }
  return { data: data as Supplier, error: null }
}
