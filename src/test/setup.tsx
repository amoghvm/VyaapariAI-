import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

const storage: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { storage[key] = value }),
  removeItem: vi.fn((key: string) => { delete storage[key] }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key]
    }
  }),
  length: 0,
  key: vi.fn((i: number) => Object.keys(storage)[i] ?? null),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    NavLink: ({ children, to, className, ...props }: any) => (
      <a href={to} className={className} {...props}>{children}</a>
    ),
    Outlet: () => <div data-testid="outlet" />,
  }
})
