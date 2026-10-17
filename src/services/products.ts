import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import type { ServiceResult } from './types'

export async function listProducts(
  businessId: string,
  storeId?: string | null
): Promise<ServiceResult<Product[]>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }

  let query = supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true })

  if (storeId) query = query.eq('store_id', storeId)

  const { data, error } = await query
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as Product[], error: null }
}

export async function getProduct(
  businessId: string,
  productId: string
): Promise<ServiceResult<Product>> {
  if (!businessId) return { data: null, error: new Error('Missing business context') }
  if (!productId) return { data: null, error: new Error('Missing product id') }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', productId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: new Error('Product not found') }
  return { data: data as Product, error: null }
}
