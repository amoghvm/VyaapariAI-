import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import {
  Menu,
  X,
  ChevronDown,
  Store,
  User,
  LogOut,
  Bell,
  Settings,
  Home,
  Bot,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  FileText,
  AlertTriangle,
  Cog,
  Plus,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Expenses', href: '/expenses', icon: CreditCard },
  { name: 'Suppliers', href: '/suppliers', icon: Package },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Action Centre', href: '/action-centre', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Cog },
]

const ROLE_BADGE: Record<string, string> = {
  owner: 'badge-info',
  admin: 'badge-info',
  manager: 'badge-success',
  staff: 'badge-warning',
  viewer: 'badge-info',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`badge ${ROLE_BADGE[role] || 'badge-info'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

function SwitcherButton({
  value,
  icon: Icon,
  items,
  onItemSelect,
  onAdd,
  addLabel,
  emptyState,
}: {
  label: string
  value: string | null
  icon: React.ComponentType<{ className?: string }>
  items: Array<{ id: string; name: string; role?: string }>
  onItemSelect: (id: string) => void
  onAdd: () => void
  addLabel: string
  emptyState: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
      >
        <Icon className="h-4 w-4 text-gray-500 shrink-0" />
        <span className="truncate">{value || emptyState}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 rounded-lg border border-gray-200 bg-white shadow-lg overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 z-50">
          {items.length > 0 ? (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onItemSelect(item.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="flex-1 truncate">{item.name}</span>
                {item.role && <RoleBadge role={item.role} />}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">{emptyState}</div>
          )}
          <div className="border-t border-gray-200" />
          <button
            onClick={(e) => {
              e.preventDefault()
              onAdd()
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-primary-600 font-medium transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export function Layout() {
  const {
    user,
    business,
    store,
    businesses,
    stores,
    businessMemberships,
    storeMemberships,
    signOut,
    loading: authLoading,
    switchBusiness,
    switchStore,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [actionCount, setActionCount] = useState(0)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (store) {
      setActionCount(0)
    }
  }, [store])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!user || !business || !store) {
    return <Outlet />
  }

  const businessRoleById = new Map<string, string>()
  businessMemberships.forEach((m) => businessRoleById.set(m.business_id, m.role))
  const storeRoleById = new Map<string, string>()
  storeMemberships.forEach((m) => storeRoleById.set(m.store_id, m.role))

  const businessItems = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    role: businessRoleById.get(b.id),
  }))

  const storeItems = stores.map((s) => ({
    id: s.id,
    name: s.name,
    role: storeRoleById.get(s.id),
  }))

  const handleAddBusiness = () => navigate('/onboarding')
  const handleAddStore = () => navigate('/onboarding')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">VyapariAI</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active business / store switchers */}
          <div className="p-4 space-y-3 border-b border-gray-200">
            <div className="px-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Business</p>
              <SwitcherButton
                label="Business"
                value={business.name}
                icon={Building2}
                items={businessItems}
                onItemSelect={switchBusiness}
                onAdd={handleAddBusiness}
                addLabel="Add Business"
                emptyState="No business"
              />
            </div>
            <div className="px-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Store</p>
              <SwitcherButton
                label="Store"
                value={store.name}
                icon={Store}
                items={storeItems}
                onItemSelect={switchStore}
                onAdd={handleAddStore}
                addLabel="Add Store"
                emptyState="No store"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main">
            <ul className="space-y-1" role="list">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-2">
              <button
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label={`Notifications${actionCount > 0 ? `, ${actionCount} unread` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {actionCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                    {actionCount > 9 ? '9+' : actionCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.full_name || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <NavLink
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </NavLink>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={async () => {
                          await signOut()
                          navigate('/signin')
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
