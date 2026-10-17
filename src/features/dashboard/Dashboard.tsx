import { LayoutDashboard, Building2, Store, Users, Package, CreditCard, TrendingUp, FileText, AlertTriangle, Bot, ShoppingCart, Settings, Plus, X } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn, formatCurrency } from '@/lib/utils'
import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface ProductFormData {
  name: string
  sku: string
  category: string
  unit: string
  salePrice: string
  purchasePrice: string
  stock: string
  reorderLevel: string
}

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  creditLimit: string
}

interface ExpenseFormData {
  category: string
  description: string
  amount: string
  method: string
  reference: string
}

interface SaleItem {
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface SaleFormData {
  customer: string
  paymentMethod: string
  paymentStatus: string
  items: SaleItem[]
}

const stats = [
  { name: "Today's Sales", value: '₹0.00', icon: ShoppingCart, color: 'text-primary-600 bg-primary-100' },
  { name: 'Outstanding Credit', value: '₹0.00', icon: Users, color: 'text-yellow-600 bg-yellow-100' },
  { name: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
  { name: 'Pending Actions', value: '0', icon: FileText, color: 'text-blue-600 bg-blue-100' },
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

  // Product form state
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '', sku: '', category: 'Grains', unit: 'kg', salePrice: '', purchasePrice: '', stock: '', reorderLevel: '',
  })
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string; category: string; unit: string; salePrice: number; purchasePrice: number; stock: number; reorderLevel: number; status: string; business_id?: string; store_id?: string }>>([])

  // Customer form state
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: '', phone: '', email: '', address: '', creditLimit: '0',
  })
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string; email: string; address: string; creditLimit: number; outstanding: number; status: string; business_id?: string }>>([])

  // Expense form state
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    category: 'Rent', description: '', amount: '', method: 'cash', reference: '',
  })
  const [expenses, setExpenses] = useState<Array<{ id: string; date: string; category: string; description: string; amount: number; method: string; reference: string; business_id?: string; store_id?: string }>>([])

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm.name || !productForm.sku) return
    const newProduct = {
      id: String(Date.now()),
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      unit: productForm.unit,
      salePrice: parseFloat(productForm.salePrice) || 0,
      purchasePrice: parseFloat(productForm.purchasePrice) || 0,
      stock: parseInt(productForm.stock, 10) || 0,
      reorderLevel: parseInt(productForm.reorderLevel, 10) || 0,
      status: 'active',
      business_id: business?.id,
      store_id: store?.id,
    }
    setProducts([...products, newProduct])
    setProductForm({ name: '', sku: '', category: 'Grains', unit: 'kg', salePrice: '', purchasePrice: '', stock: '', reorderLevel: '' })
    setOpenProduct(false)
  }

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerForm.name) return
    const newCustomer = {
      id: String(Date.now()),
      name: customerForm.name,
      phone: customerForm.phone,
      email: customerForm.email,
      address: customerForm.address,
      creditLimit: parseFloat(customerForm.creditLimit) || 0,
      outstanding: 0,
      status: 'active',
      business_id: business?.id,
    }
    setCustomers([...customers, newCustomer])
    setCustomerForm({ name: '', phone: '', email: '', address: '', creditLimit: '0' })
    setOpenCustomer(false)
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.description || !expenseForm.amount) return
    const newExpense = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount) || 0,
      method: expenseForm.method,
      reference: expenseForm.reference,
      business_id: business?.id,
      store_id: store?.id,
    }
    setExpenses([...expenses, newExpense])
    setExpenseForm({ category: 'Rent', description: '', amount: '', method: 'cash', reference: '' })
    setOpenExpense(false)
  }

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

      {/* New Sale Modal */}
      <Modal open={openSale} onClose={() => setOpenSale(false)} title="New Sale">
        <form className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Customer</label>
              <input className="input" placeholder="Walk-in Customer" defaultValue="Walk-in Customer" />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input">
                <option>Cash</option>
                <option>Card</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Add line items from the Sales module
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenSale(false)} className="btn-secondary px-4">Cancel</button>
            <button type="submit" className="btn-primary">Create Invoice</button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal open={openProduct} onClose={() => setOpenProduct(false)} title="Add Product">
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                <option>Grains</option>
                <option>Pulses</option>
                <option>Oils</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}>
                <option>kg</option>
                <option>litre</option>
                <option>packet</option>
                <option>piece</option>
                <option>box</option>
              </select>
            </div>
            <div>
              <label className="label">Sale Price</label>
              <input type="number" className="input" placeholder="₹0.00" value={productForm.salePrice} onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })} required />
            </div>
            <div>
              <label className="label">Purchase Price</label>
              <input type="number" className="input" placeholder="₹0.00" value={productForm.purchasePrice} onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })} required />
            </div>
            <div>
              <label className="label">Initial Stock</label>
              <input type="number" className="input" placeholder="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
            </div>
            <div>
              <label className="label">Reorder Level</label>
              <input type="number" className="input" placeholder="0" value={productForm.reorderLevel} onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })} required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenProduct(false)} className="btn-secondary px-4">Cancel</button>
            <button type="submit" className="btn-primary">Add Product</button>
          </div>
        </form>
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={openCustomer} onClose={() => setOpenCustomer(false)} title="Add Customer">
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Customer name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input" placeholder="+91 98765 43210" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="customer@example.com" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" placeholder="Customer address" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
            </div>
            <div>
              <label className="label">Credit Limit</label>
              <input type="number" className="input" placeholder="₹0.00" value={customerForm.creditLimit} onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenCustomer(false)} className="btn-secondary px-4">Cancel</button>
            <button type="submit" className="btn-primary">Save Customer</button>
          </div>
        </form>
      </Modal>

      {/* Record Expense Modal */}
      <Modal open={openExpense} onClose={() => setOpenExpense(false)} title="Record Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select className="input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                <option>Rent</option>
                <option>Utilities</option>
                <option>Transport</option>
                <option>Marketing</option>
                <option>Inventory</option>
                <option>Salaries</option>
                <option>Misc</option>
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Expense description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
            </div>
            <div>
              <label className="label">Amount</label>
              <input type="number" className="input" placeholder="₹0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={expenseForm.method} onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="label">Reference / Bill No.</label>
              <input className="input" placeholder="Bill number" value={expenseForm.reference} onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenExpense(false)} className="btn-secondary px-4">Cancel</button>
            <button type="submit" className="btn-primary">Record Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
