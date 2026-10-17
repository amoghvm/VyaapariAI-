import { LayoutDashboard, Building2, Store, Users, Package, CreditCard, TrendingUp, FileText, AlertTriangle, Bot, ShoppingCart, Settings, Plus, PlusCircle, X } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn, formatCurrency } from '@/lib/utils'
import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const stats = [
  { name: "Today's Sales", value: '₹0.00', icon: ShoppingCart, color: 'text-primary-600 bg-primary-100' },
  { name: 'Outstanding Credit', value: '₹0.00', icon: Users, color: 'text-yellow-600 bg-yellow-100' },
  { name: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
  { name: 'Pending Actions', value: '0', icon: FileText, color: 'text-blue-600 bg-blue-100' },
]

const quickActions = [
  { name: 'New Sale', icon: ShoppingCart },
  { name: 'Add Product', icon: Package },
  { name: 'Add Customer', icon: Users },
  { name: 'Record Expense', icon: CreditCard },
]

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
          <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
          </div>
        </div>
      </div>
    </>
  )
}

export function Dashboard() {
  const { business, store } = useAuth()
  const location = useLocation()
  const [openSale, setOpenSale] = useState(false)
  const [openProduct, setOpenProduct] = useState(false)
  const [openCustomer, setOpenCustomer] = useState(false)
  const [openExpense, setOpenExpense] = useState(false)

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
              <button
                onClick={() => setOpenSale(true)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">New Sale</span>
              </button>
              <button
                onClick={() => setOpenProduct(true)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">Add Product</span>
              </button>
              <button
                onClick={() => setOpenCustomer(true)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">Add Customer</span>
              </button>
              <button
                onClick={() => setOpenExpense(true)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">Record Expense</span>
              </button>
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

      <Modal open={openSale} onClose={() => setOpenSale(false)} title="New Sale">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Create a new invoice / POS sale.</p>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Sale creation form — connect to Sales module
          </div>
        </div>
      </Modal>
      <Modal open={openProduct} onClose={() => setOpenProduct(false)} title="Add Product">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Add a new product to your catalogue.</p>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Product creation form — connect to Products module
          </div>
        </div>
      </Modal>
      <Modal open={openCustomer} onClose={() => setOpenCustomer(false)} title="Add Customer">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Register a new customer.</p>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Customer creation form — connect to Customers module
          </div>
        </div>
      </Modal>
      <Modal open={openExpense} onClose={() => setOpenExpense(false)} title="Record Expense">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Record a new business expense.</p>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Expense creation form — connect to Expenses module
          </div>
        </div>
      </Modal>
    </div>
  )
}
