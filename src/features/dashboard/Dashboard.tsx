import { LayoutDashboard, Building2, Store, Users, Package, CreditCard, TrendingUp, FileText, AlertTriangle, Bot, ShoppingCart, Settings, Plus, X } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { STORAGE_KEYS, getStoredData, saveStoredData } from '@/lib/storage'
import { cn, formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
  const [openSale, setOpenSale] = useState(false)
  const [openProduct, setOpenProduct] = useState(false)
  const [openCustomer, setOpenCustomer] = useState(false)
  const [openExpense, setOpenExpense] = useState(false)

  // Product form state
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '', sku: '', category: 'Grains', unit: 'kg', salePrice: '', purchasePrice: '', stock: '', reorderLevel: '',
  })
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string; category: string; unit: string; salePrice: number; purchasePrice: number; stock: number; reorderLevel: number; status: string; business_id?: string; store_id?: string }>>([])

  // Inventory catalogue for sale line items
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([])

  useEffect(() => {
    async function loadInventoryItems() {
      // 1. Attempt fetching live items directly from Supabase products/inventory
      if (business?.id && store?.id) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, sale_price, stock')
          .eq('business_id', business.id)
          .eq('store_id', store.id)

        if (!error && data && data.length > 0) {
          setInventoryProducts(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: Number(p.sale_price),
              stock: Number(p.stock),
            }))
          )
          return
        }
      }

      // 2. Fallback to shared inventory/products storage
      const stored = getStoredData(STORAGE_KEYS.PRODUCTS, [
        { id: '1', name: 'Basmati Rice 1kg', salePrice: 85, stock: 50 },
        { id: '2', name: 'Toor Dal 1kg', salePrice: 120, stock: 30 },
        { id: '3', name: 'Sunflower Oil 1L', salePrice: 145, stock: 4 },
        { id: '4', name: 'Biscuits Packet', salePrice: 25, stock: 100 },
      ])
      setInventoryProducts(
        stored.map((p: any) => ({
          id: p.id || p.sku,
          name: p.name,
          price: Number(p.salePrice || p.sale_price || 0),
          stock: Number(p.stock || p.currentStock || 0),
        }))
      )
    }

    loadInventoryItems()
  }, [business?.id, store?.id])

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

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    customerName: 'Walk-in Customer',
    paymentMethod: 'Cash',
    paymentStatus: 'paid',
    items: [{ productName: '', sku: '', quantity: 1, price: 0, lineTotal: 0 }],
  })
  const [sales, setSales] = useState<Array<{ id: string; customer_name: string; total_amount: number; payment_status: string; payment_method: string; business_id?: string; store_id?: string }>>([])

  // KPI state
  const [todaySales, setTodaySales] = useState(0)
  const [stats, setStats] = useState([
    { name: "Today's Sales", value: '₹0.00', icon: ShoppingCart, color: 'text-primary-600 bg-primary-100' },
    { name: 'Outstanding Credit', value: '₹0.00', icon: Users, color: 'text-yellow-600 bg-yellow-100' },
    { name: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
    { name: 'Pending Actions', value: '0', icon: FileText, color: 'text-blue-600 bg-blue-100' },
  ])

  const updateTodaySales = (amount: number) => {
    setTodaySales(prev => prev + amount)
    setStats(prev => prev.map(s => s.name === "Today's Sales" ? { ...s, value: `₹${(prev + amount).toFixed(2)}` } : s))
  }

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!productForm.name || !productForm.sku) return
    if (!business?.id || !store?.id) return

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
      business_id: business.id,
      store_id: store.id,
    }

    try {
      const { error } = await supabase.from('products').insert({
        business_id: business.id,
        store_id: store.id,
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        unit: productForm.unit,
        sale_price: Number(productForm.salePrice),
        purchase_price: Number(productForm.purchasePrice),
        stock: Number(productForm.stock),
        reorder_level: Number(productForm.reorderLevel),
        status: 'active'
      })

      if (error) throw error
    } catch (err) {
      console.warn('Supabase insert failed, falling back to localStorage:', err)
    }

    const updated = [...products, newProduct]
    setProducts(updated)
    saveStoredData(STORAGE_KEYS.PRODUCTS, updated)
    setProductForm({ name: '', sku: '', category: 'Grains', unit: 'kg', salePrice: '', purchasePrice: '', stock: '', reorderLevel: '' })
    setOpenProduct(false)
    showToast('Product added to catalogue')
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!customerForm.name) return
    if (!business?.id) return

    const newCustomer = {
      id: String(Date.now()),
      name: customerForm.name,
      phone: customerForm.phone,
      email: customerForm.email,
      address: customerForm.address,
      creditLimit: parseFloat(customerForm.creditLimit) || 0,
      outstanding: 0,
      status: 'active',
      business_id: business.id,
    }

    try {
      const { error } = await supabase.from('customers').insert({
        business_id: business.id,
        full_name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
        address: customerForm.address,
        credit_limit: Number(customerForm.creditLimit || 0),
        outstanding_balance: 0,
        status: 'Active'
      })
      if (error) throw error
    } catch (err) {
      console.warn('Supabase insert failed, falling back to localStorage:', err)
    }

    const updated = [...customers, newCustomer]
    setCustomers(updated)
    saveStoredData(STORAGE_KEYS.CUSTOMERS, updated)
    setCustomerForm({ name: '', phone: '', email: '', address: '', creditLimit: '0' })
    setOpenCustomer(false)
    showToast('Customer added successfully')
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!expenseForm.description || !expenseForm.amount) return
    if (!business?.id || !store?.id) return

    const newExpense = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount) || 0,
      method: expenseForm.method,
      reference: expenseForm.reference,
      business_id: business.id,
      store_id: store.id,
    }

    try {
      const { error } = await supabase.from('expenses').insert({
        business_id: business.id,
        store_id: store.id,
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        payment_method: expenseForm.method,
        reference: expenseForm.reference || null,
        date: new Date().toISOString().slice(0, 10)
      })
      if (error) throw error
    } catch (err) {
      console.warn('Supabase insert failed, falling back to localStorage:', err)
    }

    const updated = [...expenses, newExpense]
    setExpenses(updated)
    saveStoredData(STORAGE_KEYS.EXPENSES, updated)
    setExpenseForm({ category: 'Rent', description: '', amount: '', method: 'cash', reference: '' })
    setOpenExpense(false)
    showToast('Expense recorded successfully')
  }

  const handleSaleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!business?.id || !store?.id) return
    const lineItems = saleForm.items.filter(it => it.productName && it.quantity > 0)
    if (lineItems.length === 0) return

    const calculatedTotal = lineItems.reduce((s, it) => s + Number(it.quantity) * Number(it.price), 0)

    try {
      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        business_id: business.id,
        store_id: store.id,
        customer_name: saleForm.customerName || 'Walk-in Customer',
        total_amount: calculatedTotal,
        payment_status: saleForm.paymentStatus,
        payment_method: saleForm.paymentMethod
      }).select().single()

      if (!saleError && saleData) {
        await supabase.from('sale_items').insert(
          lineItems.map(item => ({
            sale_id: saleData.id,
            product_name: item.productName,
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            subtotal: Number(item.quantity) * Number(item.price)
          }))
        )
      }
    } catch (err) {
      console.warn('Supabase insert failed, falling back to localStorage:', err)
    }

    const newSale = {
      id: String(Date.now()),
      customer_name: saleForm.customerName || 'Walk-in Customer',
      total_amount: calculatedTotal,
      payment_status: saleForm.paymentStatus,
      payment_method: saleForm.paymentMethod,
      business_id: business.id,
      store_id: store.id,
    }
    const updated = [newSale, ...sales]
    setSales(updated)
    saveStoredData(STORAGE_KEYS.SALES, updated)
    updateTodaySales(calculatedTotal)

    setSaleForm({
      customerName: 'Walk-in Customer',
      paymentMethod: 'Cash',
      paymentStatus: 'paid',
      items: [{ productName: '', sku: '', quantity: 1, price: 0, lineTotal: 0 }],
    })
    setOpenSale(false)
    showToast('Sale recorded successfully')
  }

  const addSaleItem = () => {
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', sku: '', quantity: 1, price: 0, lineTotal: 0 }],
    }))
  }

  const updateSaleItem = (i: number, field: string, val: any) => {
    const next = [...saleForm.items]
    next[i] = { ...next[i], [field]: val }
    if (field === 'productName') {
      const p = inventoryProducts.find((x) => x.name === val)
      if (p) {
        next[i].price = p.price
        next[i].sku = p.id
      }
    }
    next[i].lineTotal = Number(next[i].quantity) * Number(next[i].price)
    setSaleForm(prev => ({ ...prev, items: next }))
  }

  const removeSaleItem = (i: number) => {
    setSaleForm(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))
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
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          {toast && <div className="text-green-600 text-sm">{toast}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Customer</label>
              <input
                className="input"
                placeholder="Walk-in Customer"
                value={saleForm.customerName}
                onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select
                className="input"
                value={saleForm.paymentMethod}
                onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select
                className="input"
                value={saleForm.paymentStatus}
                onChange={(e) => setSaleForm({ ...saleForm, paymentStatus: e.target.value })}
              >
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Line Items</label>
              <button type="button" onClick={addSaleItem} className="btn-secondary text-sm">+ Add Item</button>
            </div>
            {saleForm.items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <select
                    className="input"
                    value={it.productName}
                    onChange={(e) => updateSaleItem(i, 'productName', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {inventoryProducts.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} — ₹{p.price} {p.stock > 0 ? `(Stock: ${p.stock})` : '(Out of stock)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    className="input"
                    placeholder="Qty"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => updateSaleItem(i, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    className="input"
                    placeholder="Price"
                    step="0.01"
                    value={it.price}
                    onChange={(e) => updateSaleItem(i, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <button type="button" onClick={() => removeSaleItem(i)} className="btn-secondary text-sm w-full">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-100 font-medium">
            <span>Total</span>
            <span>₹{saleForm.items.reduce((s, it) => s + Number(it.quantity) * Number(it.price), 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenSale(false)} className="btn-secondary px-4">Cancel</button>
            <button type="button" onClick={handleSaleSubmit} className="btn-primary">Create Invoice</button>
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
