import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Business, Store, BusinessMembership, StoreMembership, UserContext } from '@/types'

const ACTIVE_BUSINESS_ID_KEY = 'vyapari_active_business_id'
const ACTIVE_STORE_ID_KEY = 'vyapari_active_store_id'
const DEFAULT_LANGUAGE = 'en'

interface AuthContextType extends UserContext {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  loading: boolean
  refreshSession: () => Promise<void>
  createBusiness: (data: CreateBusinessData) => Promise<{ business: Business | null; error: Error | null }>
  createStore: (data: CreateStoreData) => Promise<{ store: Store | null; error: Error | null }>
}

interface CreateBusinessData {
  name: string
  type: Business['type']
  gst_number?: string
  address?: string
  phone?: string
  email?: string
}

interface CreateStoreData {
  business_id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessMemberships, setBusinessMemberships] = useState<BusinessMembership[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [storeMemberships, setStoreMemberships] = useState<StoreMembership[]>([])
  const [business, setBusiness] = useState<Business | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [membership, setMembership] = useState<BusinessMembership | null>(null)
  const [storeMembership, setStoreMembership] = useState<StoreMembership | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        clearUserData()
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getCachedId = useCallback((key: string) => {
    if (typeof localStorage === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }, [])

  const setCachedId = useCallback((key: string, value: string | null) => {
    if (typeof localStorage === 'undefined') return
    try {
      if (value) {
        localStorage.setItem(key, value)
      } else {
        localStorage.removeItem(key)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        const fallback: Profile = {
          id: userId,
          email: '',
          full_name: null,
          avatar_url: null,
          preferred_language: DEFAULT_LANGUAGE,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUser(fallback)
        setLoading(false)
        return
      }

      setUser(profile)
      await loadBusinessData(userId)
    } catch (error) {
      console.error('Failed to load user data:', error)
      setLoading(false)
    }
  }

  const loadBusinessData = async (userId: string) => {
    try {
      const { data: memberships, error } = await supabase
        .from('business_memberships')
        .select('*, business:businesses(*)')
        .eq('user_id', userId)
        .eq('businesses.is_active', true)

      if (error) {
        console.error('Failed to load business memberships:', error)
        setLoading(false)
        return
      }

      const membershipsList = (memberships || []) as Array<BusinessMembership & { business: Business }>
      const businessesList = membershipsList.map((m) => m.business).filter(Boolean) as Business[]
      setBusinesses(businessesList)
      setBusinessMemberships(membershipsList as BusinessMembership[])

      if (businessesList.length === 0) {
        setLoading(false)
        return
      }

      const cachedBusinessId = getCachedId(ACTIVE_BUSINESS_ID_KEY)
      const activeBusiness = businessesList.find((b) => b.id === cachedBusinessId) || businessesList[0]
      setBusiness(activeBusiness)
      const activeMembership = membershipsList.find((m) => m.business_id === activeBusiness.id && m.user_id === userId)
      setMembership(activeMembership || null)

      setCachedId(ACTIVE_BUSINESS_ID_KEY, activeBusiness.id)

      await loadStoresForBusiness(activeBusiness.id, userId)
    } catch (error) {
      console.error('Failed to load business data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStoresForBusiness = async (businessId: string, userId: string) => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('*, store_memberships!inner(*)')
        .eq('business_id', businessId)
        .eq('store_memberships.user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Failed to load stores:', error)
        return
      }

      const storesList = (storesData || []) as Array<Store & { store_memberships: StoreMembership[] }>
      setStores(storesList)
      setStoreMemberships(storesList.flatMap((s) => s.store_memberships))

      if (storesList.length === 0) {
        setStore(null)
        setStoreMembership(null)
        setCachedId(ACTIVE_STORE_ID_KEY, null)
        return
      }

      const cachedStoreId = getCachedId(ACTIVE_STORE_ID_KEY)
      const activeStore = storesList.find((s) => s.id === cachedStoreId) || storesList[0]
      setStore(activeStore)
      setStoreMembership(activeStore.store_memberships[0] || null)
      setCachedId(ACTIVE_STORE_ID_KEY, activeStore.id)
    } catch (error) {
      console.error('Failed to load stores:', error)
    }
  }

  const clearUserData = () => {
    setUser(null)
    setBusinesses([])
    setBusinessMemberships([])
    setStores([])
    setStoreMemberships([])
    setBusiness(null)
    setStore(null)
    setMembership(null)
    setStoreMembership(null)
    setCachedId(ACTIVE_BUSINESS_ID_KEY, null)
    setCachedId(ACTIVE_STORE_ID_KEY, null)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    clearUserData()
  }

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await loadUserData(session.user.id)
    } else {
      clearUserData()
      setLoading(false)
    }
  }

  const switchBusiness = async (businessId: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    const target = businesses.find((b) => b.id === businessId)
    if (!target) {
      return { error: new Error('Business not found or access denied') }
    }

    setBusiness(target)
    const activeMembership = businessMemberships.find(
      (m) => m.business_id === businessId && m.user_id === user.id
    )
    setMembership(activeMembership || null)
    setCachedId(ACTIVE_BUSINESS_ID_KEY, businessId)

    setStore(null)
    setStoreMembership(null)
    setCachedId(ACTIVE_STORE_ID_KEY, null)

    await loadStoresForBusiness(businessId, user.id)
    return { error: null }
  }

  const switchStore = async (storeId: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    const target = stores.find((s) => s.id === storeId)
    if (!target) {
      return { error: new Error('Store not found or access denied') }
    }

    setStore(target)
    setStoreMembership(storeMemberships.find((m) => m.store_id === storeId) || null)
    setCachedId(ACTIVE_STORE_ID_KEY, storeId)
    return { error: null }
  }

  const createBusiness = async (data: CreateBusinessData) => {
    if (!user) return { business: null, error: new Error('Not authenticated') }

    const { data: businessData, error } = await supabase.rpc('create_business_with_owner', {
      p_name: data.name,
      p_type: data.type,
      p_gst_number: data.gst_number,
      p_address: data.address,
      p_phone: data.phone,
      p_email: data.email,
      p_owner_id: user.id,
    })

    if (error) return { business: null, error: new Error(error.message) }

    setBusiness(businessData)
    await refreshSession()
    return { business: businessData, error: null }
  }

  const createStore = async (data: CreateStoreData) => {
    if (!user) return { store: null, error: new Error('Not authenticated') }

    const { data: storeData, error } = await supabase.rpc('create_store_with_manager', {
      p_business_id: data.business_id,
      p_name: data.name,
      p_code: data.code,
      p_address: data.address,
      p_phone: data.phone,
      p_email: data.email,
      p_manager_id: user.id,
    })

    if (error) return { store: null, error: new Error(error.message) }

    setStore(storeData)
    await refreshSession()
    return { store: storeData, error: null }
  }

  const completeProfile = async ({ full_name, preferred_language }: { full_name: string; preferred_language: string }) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name, preferred_language })

    if (error) return { error: new Error(error.message) }

    await refreshSession()
    return { error: null }
  }

  const profileIncomplete = !user?.full_name

  return (
    <AuthContext.Provider
      value={{
        user,
        businesses,
        businessMemberships,
        stores,
        storeMemberships,
        business,
        store,
        membership,
        storeMembership,
        loading,
        profileIncomplete,
        signIn,
        signUp,
        signOut,
        refreshSession,
        switchBusiness,
        switchStore,
        completeProfile,
        createBusiness,
        createStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
