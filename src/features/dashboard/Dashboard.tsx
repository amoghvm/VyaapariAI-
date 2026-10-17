import { LayoutDashboard, Building2, Store, Users, Package, CreditCard, TrendingUp, FileText, AlertTriangle, Bot, ShoppingCart, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn, formatCurrency } from '@/lib/utils'
import { NavLink, useLocation } from 'react-router-dom'

const stats = [
  { name: 'Today\'s Sales', value: '₹0.00', icon: ShoppingCart, color: 'text-primary-600 bg-primary-100' },
  { name: 'Outstanding Credit', value: '₹0.00', icon: Users, color: 'text-yellow-600 bg-yellow-100' },
  { name: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
  { name: 'Pending Actions', value: '0', icon: FileText, color: 'text-blue-600 bg-blue-100' },
]

const quickActions = [
  { name: 'New Sale', href: '/sales/new', icon: ShoppingCart },
  { name: 'Add Product', href: '/products/new', icon: Package },
  { name: 'Add Customer', href: '/customers/new', icon: Users },
  { name: 'Record Expense', href: '/expenses/new', icon: CreditCard },
]

export function Dashboard() {
  const { business, store } = useAuth()
  const location = useLocation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your business.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <NavLink
                  key={action.name}
                  to={action.href}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <action.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{action.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-500">
              <LayoutDashboard className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2">No recent activity</p>
              <p className="text-sm">Start by creating a sale or adding products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
        </div>
        <div className="card-body">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-gray-600">Business</dt>
              <dd className="font-medium text-gray-900">{business?.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Store</dt>
              <dd className="font-medium text-gray-900">{store?.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Type</dt>
              <dd className="font-medium text-gray-900 capitalize">{business?.type || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">GST</dt>
              <dd className="font-medium text-gray-900">{business?.gst_number || 'Not registered'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}