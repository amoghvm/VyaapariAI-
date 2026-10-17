import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Business, Store, BusinessMembership, StoreMembership, UserContext } from '@/types'

interface AuthContextType extends UserContext {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  loading: boolean
  refreshSession: () => Promise<void>
  switchStore: (storeId: string) => Promise<{ error: Error | null }>
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

  const loadUserData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUser(profile)
        await loadBusinessData(profile.id)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setLoading(false)
    }
  }

  const loadBusinessData = async (userId: string) => {
    try {
      const { data: memberships } = await supabase
        .from('business_memberships')
        .select('*, business:businesses(*)')
        .eq('user_id', userId)
        .eq('businesses.is_active', true)

      if (memberships && memberships.length > 0) {
        const primaryMembership = memberships[0]
        setMembership(primaryMembership)
        setBusiness(primaryMembership.business)

        const { data: stores } = await supabase
          .from('stores')
          .select('*, store_memberships!inner(*)')
          .eq('business_id', primaryMembership.business_id)
          .eq('store_memberships.user_id', userId)
          .eq('is_active', true)

        if (stores && stores.length > 0) {
          const primaryStore = stores[0]
          setStore(primaryStore)
          setStoreMembership(primaryStore.store_memberships[0])
        }
      }
    } catch (error) {
      console.error('Failed to load business data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearUserData = () => {
    setUser(null)
    setBusiness(null)
    setStore(null)
    setMembership(null)
    setStoreMembership(null)
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
    }
  }

  const switchStore = async (storeId: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { data: storeData, error } = await supabase
      .from('stores')
      .select('*, store_memberships!inner(*)')
      .eq('id', storeId)
      .eq('store_memberships.user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !storeData) {
      return { error: new Error('Store not found or access denied') }
    }

    setStore(storeData)
    setStoreMembership(storeData.store_memberships[0])
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

    await refreshSession()
    return { store: storeData, error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        store,
        membership,
        storeMembership,
        loading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        switchStore,
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