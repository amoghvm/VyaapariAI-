import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase'
import { listProducts, getProduct } from './products'
import { listProductCategories, listExpenseCategories } from './categories'
import { listCustomers, getCustomer } from './customers'
import { listSuppliers, getSupplier } from './suppliers'
import { listExpenses, getExpense } from './expenses'

describe('Data Services (Read-Only)', () => {
  const businessId = 'biz-uuid-123'
  const storeId = 'store-uuid-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Products Service', () => {
    it('returns error when businessId is missing', async () => {
      const res = await listProducts('')
      expect(res.error).toBeInstanceOf(Error)
      expect(res.error?.message).toBe('Missing business context')
      expect(res.data).toBeNull()
    })

    it('queries products with businessId and storeId filtering', async () => {
      const mockData = [
        { id: 'p1', name: 'Product A', business_id: businessId, store_id: storeId },
      ]

      const eqMock = vi.fn().mockReturnThis()
      const orderMock = vi.fn().mockReturnThis()
      const selectMock = vi.fn().mockReturnValue({
        eq: eqMock,
        order: orderMock,
      })

      // Configure chain for supabase.from('products').select('*').eq('business_id', ...).order(...).eq('store_id', ...)
      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      // When storeId is passed, it adds an extra eq()
      orderMock.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      })

      const res = await listProducts(businessId, storeId)
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(res.data).toEqual(mockData)
      expect(res.error).toBeNull()
    })

    it('getProduct returns error if businessId or productId missing', async () => {
      const res1 = await getProduct('', 'p1')
      expect(res1.error?.message).toBe('Missing business context')

      const res2 = await getProduct(businessId, '')
      expect(res2.error?.message).toBe('Missing product id')
    })
  })

  describe('Categories Service', () => {
    it('listProductCategories enforces businessId', async () => {
      const res = await listProductCategories('')
      expect(res.error?.message).toBe('Missing business context')
    })

    it('listExpenseCategories queries expense_categories', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Utilities', business_id: businessId }]
      const orderMock = vi.fn().mockResolvedValue({ data: mockCategories, error: null })
      const eqMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      const res = await listExpenseCategories(businessId)
      expect(supabase.from).toHaveBeenCalledWith('expense_categories')
      expect(res.data).toEqual(mockCategories)
    })
  })

  describe('Customers Service', () => {
    it('listCustomers requires businessId', async () => {
      const res = await listCustomers('')
      expect(res.error?.message).toBe('Missing business context')
    })

    it('getCustomer handles missing customer gracefully', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eq2Mock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ eq: eq1Mock })

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      const res = await getCustomer(businessId, 'c-none')
      expect(res.error?.message).toBe('Customer not found')
      expect(res.data).toBeNull()
    })
  })

  describe('Suppliers Service', () => {
    it('listSuppliers requires businessId', async () => {
      const res = await listSuppliers('')
      expect(res.error?.message).toBe('Missing business context')
    })

    it('getSupplier fetches supplier by id and businessId', async () => {
      const mockSupplier = { id: 's1', name: 'Supplier X', business_id: businessId }
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockSupplier, error: null })
      const eq2Mock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ eq: eq1Mock })

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      const res = await getSupplier(businessId, 's1')
      expect(supabase.from).toHaveBeenCalledWith('suppliers')
      expect(res.data).toEqual(mockSupplier)
    })
  })

  describe('Expenses Service', () => {
    it('listExpenses requires businessId', async () => {
      const res = await listExpenses('')
      expect(res.error?.message).toBe('Missing business context')
    })

    it('getExpense fetches expense by businessId and expenseId', async () => {
      const mockExpense = { id: 'exp-1', amount: 500, business_id: businessId }
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockExpense, error: null })
      const eq2Mock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ eq: eq1Mock })

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      const res = await getExpense(businessId, 'exp-1')
      expect(supabase.from).toHaveBeenCalledWith('expenses')
      expect(res.data).toEqual(mockExpense)
    })
  })
})
