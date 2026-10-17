import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthProvider, useAuth } from './AuthContext'

describe('AuthContext and Tenant Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  const createChain = (resolveValue: any) => {
    const chain: any = {
      eq: vi.fn().mockImplementation(() => chain),
      single: vi.fn().mockResolvedValue(resolveValue),
      maybeSingle: vi.fn().mockResolvedValue(resolveValue),
      then: (resolve: any) => Promise.resolve(resolveValue).then(resolve),
    }
    return chain
  }

  it('initializes with loading false and null user when no session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as any)

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await result.current.refreshSession()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.business).toBeNull()
    expect(result.current.store).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('identifies profileIncomplete when user has no full_name', async () => {
    const mockSession = { user: { id: 'u-123', email: 'test@example.com' } }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
    } as any)

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue(createChain({
            data: { id: 'u-123', email: 'test@example.com', full_name: null },
            error: null,
          })),
        } as any
      }
      return { select: vi.fn().mockReturnValue(createChain({ data: [], error: null })) } as any
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshSession()
    })

    expect(result.current.user?.id).toBe('u-123')
    expect(result.current.profileIncomplete).toBe(true)
  })

  it('completeProfile executes profiles upsert with user id and preferred language', async () => {
    const mockSession = { user: { id: 'u-123', email: 'test@example.com' } }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
    } as any)

    const upsertMock = vi.fn().mockResolvedValue({ error: null })

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue(createChain({
            data: { id: 'u-123', email: 'test@example.com', full_name: null },
            error: null,
          })),
          upsert: upsertMock,
        } as any
      }
      return { select: vi.fn().mockReturnValue(createChain({ data: [], error: null })) } as any
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshSession()
    })

    await act(async () => {
      const res = await result.current.completeProfile({
        full_name: 'Test Owner',
        preferred_language: 'hi',
      })
      expect(res.error).toBeNull()
    })

    expect(upsertMock).toHaveBeenCalledWith({
      id: 'u-123',
      full_name: 'Test Owner',
      preferred_language: 'hi',
    })
  })

  it('dispatches create_business_with_owner RPC with authenticated user id as owner', async () => {
    const mockSession = { user: { id: 'u-owner-1', email: 'owner@example.com' } }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
    } as any)

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue(createChain({
            data: { id: 'u-owner-1', email: 'owner@example.com', full_name: 'Owner' },
            error: null,
          })),
        } as any
      }
      return { select: vi.fn().mockReturnValue(createChain({ data: [], error: null })) } as any
    })

    const rpcMock = vi.fn().mockResolvedValue({
      data: { id: 'biz-new-1', name: 'My Retail Business' },
      error: null,
    })
    vi.mocked(supabase.rpc).mockImplementation(rpcMock)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshSession()
    })

    await act(async () => {
      const res = await result.current.createBusiness({
        name: 'My Retail Business',
        type: 'retail',
        gst_number: '29ABCDE1234F1Z5',
        address: '123 Market Rd',
        phone: '9876543210',
        email: 'store@example.com',
      })
      expect(res.business).toEqual({ id: 'biz-new-1', name: 'My Retail Business' })
      expect(res.error).toBeNull()
    })

    expect(rpcMock).toHaveBeenCalledWith('create_business_with_owner', {
      p_name: 'My Retail Business',
      p_type: 'retail',
      p_gst_number: '29ABCDE1234F1Z5',
      p_address: '123 Market Rd',
      p_phone: '9876543210',
      p_email: 'store@example.com',
      p_owner_id: 'u-owner-1',
    })
  })

  it('dispatches create_store_with_manager RPC with business id and manager id', async () => {
    const mockSession = { user: { id: 'u-owner-1', email: 'owner@example.com' } }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
    } as any)

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue(createChain({
            data: { id: 'u-owner-1', email: 'owner@example.com', full_name: 'Owner' },
            error: null,
          })),
        } as any
      }
      return { select: vi.fn().mockReturnValue(createChain({ data: [], error: null })) } as any
    })

    const rpcMock = vi.fn().mockResolvedValue({
      data: { id: 'store-new-1', name: 'Branch 1', code: 'BR1' },
      error: null,
    })
    vi.mocked(supabase.rpc).mockImplementation(rpcMock)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshSession()
    })

    await act(async () => {
      const res = await result.current.createStore({
        business_id: 'biz-new-1',
        name: 'Branch 1',
        code: 'BR1',
        address: '456 Branch Ave',
        phone: '9876543211',
        email: 'branch1@example.com',
      })
      expect(res.store).toEqual({ id: 'store-new-1', name: 'Branch 1', code: 'BR1' })
      expect(res.error).toBeNull()
    })

    expect(rpcMock).toHaveBeenCalledWith('create_store_with_manager', {
      p_business_id: 'biz-new-1',
      p_name: 'Branch 1',
      p_code: 'BR1',
      p_address: '456 Branch Ave',
      p_phone: '9876543211',
      p_email: 'branch1@example.com',
      p_manager_id: 'u-owner-1',
    })
  })
})
