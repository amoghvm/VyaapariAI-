import { ShoppingCart, Plus, Search, Filter, Package, CreditCard, Users, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} border border-gray-200 animate-in fade-in zoom-in`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

const products = [
  { id: 'p1', name: 'Basmati Rice 1kg', price: 85 },
  { id: 'p2', name: 'Toor Dal 1kg', price: 120 },
  { id: 'p3', name: 'Sunflower Oil 1L', price: 145 },
]

export function Sales() {
  const [search, setSearch] = useState('')
  const [openNewSale, setOpenNewSale] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const [customer, setCustomer] = useState('Walk-in Customer')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentStatus, setPaymentStatus] = useState('paid')
  const [items, setItems] = useState([{ productId: 'p1', qty: 1, price: 85 }])

  const [sales, setSales] = useState([
    { id: '1', invoice: 'INV-001', date: '2024-01-15', customer: 'Walk-in Customer', total: 1250.00, status: 'paid', paymentStatus: 'paid', items: [{ name: 'Basmati Rice 1kg', qty: 2, price: 85 }] },
    { id: '2', invoice: 'INV-002', date: '2024-01-15', customer: 'Ramesh Kumar', total: 3500.00, status: 'confirmed', paymentStatus: 'partial', items: [{ name: 'Toor Dal 1kg', qty: 10, price: 120 }] },
    { id: '3', invoice: 'INV-003', date: '2024-01-14', customer: 'Priya Sharma', total: 890.00, status: 'confirmed', paymentStatus: 'unpaid', items: [{ name: 'Sunflower Oil 1L', qty: 5, price: 145 }] },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const total = items.reduce((s, it) => s + it.qty * it.price, 0)
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0 || items.some((it) => it.qty <= 0)) return
    setSubmitting(true)
    const calculatedTotal = items.reduce((s, it) => s + it.qty * it.price, 0)
    const newSale = {
      id: crypto.randomUUID(),
      invoice: `INV-${String(sales.length + 1).padStart(3, '0')}`,
      invoice_number: `INV-00${sales.length + 1}`,
      customer: customer,
      customer_name: customer,
      date: new Date().toISOString().slice(0, 10),
      total: calculatedTotal,
      total_amount: calculatedTotal,
      paymentStatus: paymentStatus,
      payment_status: paymentStatus.toLowerCase(),
      paymentMethod: paymentMethod,
      payment_method: paymentMethod,
      items: items.map((item) => {
        const p = products.find((x) => x.id === item.productId)
        return { product_name: p?.name || '', quantity: Number(item.qty), unit_price: Number(item.price), subtotal: Number(item.qty) * Number(item.price), name: p?.name || '', qty: item.qty, price: item.price }
      }),
    }
    setSales([newSale as any, ...sales])
    setItems([{ productId: products[0].id, qty: 1, price: products[0].price }])
    setCustomer('Walk-in Customer')
    setPaymentMethod('Cash')
    setPaymentStatus('paid')
    setOpenNewSale(false)
    setSubmitting(false)
    setToast('Sale recorded successfully')
    setTimeout(() => setToast(null), 3000)
  }

  const addItem = () => setItems([...items, { productId: products[0].id, qty: 1, price: products[0].price }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, val: any) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: val }
    if (field === 'productId') {
      const p = products.find((x) => x.id === val)
      if (p) next[i].price = p.price
    }
    setItems(next)
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50">{toast}</div>}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage sales and billing</p>
        </div>
        <button onClick={() => setOpenNewSale(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Sale
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Invoice</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Total</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-900">{sale.invoice}</td>
                  <td className="p-4 text-sm text-gray-600">{sale.date}</td>
                  <td className="p-4 text-sm text-gray-600">{sale.customer}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">₹{sale.total.toFixed(2)}</td>
                  <td className="p-4"><span className={`badge ${sale.paymentStatus === 'paid' ? 'badge-success' : sale.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>{sale.paymentStatus}</span></td>
                  <td className="p-4">
                    <button onClick={() => { setSelectedSale(sale); setOpenView(true) }} className="text-primary-600 hover:text-primary-500 text-sm font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={openNewSale} onClose={() => setOpenNewSale(false)} title="New Sale / POS Invoice" wide>
        <form onSubmit={handleSaveSale} className="space-y-4">
          {toast && <div className="text-green-600 text-sm">{toast}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Customer</label>
              <select className="input" value={customer} onChange={(e) => setCustomer(e.target.value)}>
                <option>Walk-in Customer</option>
                <option>Ramesh Kumar</option>
                <option>Priya Sharma</option>
              </select>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option><option>Credit</option>
              </select>
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select className="input" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Line Items</label>
              <button type="button" onClick={addItem} className="btn-secondary text-sm">+ Add Item</button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <select className="input" value={it.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" className="input" value={it.qty} onChange={(e) => updateItem(i, 'qty', parseInt(e.target.value) || 0)} />
                <input type="number" className="input" value={it.price} onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} />
                <button type="button" onClick={() => removeItem(i)} className="btn-secondary text-sm">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-100 font-medium">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenNewSale(false)} className="btn-secondary px-4">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">Save Sale</button>
          </div>
        </form>
      </Modal>

      <Modal open={openView} onClose={() => setOpenView(false)} title="Invoice Preview">
        {selectedSale && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-gray-900">Invoice #{selectedSale.invoice}</p>
                <p className="text-sm text-gray-600">{selectedSale.customer}</p>
              </div>
              <p className="text-sm text-gray-600">{selectedSale.date}</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th></tr></thead>
              <tbody>
                {selectedSale.items.map((it: any, i: number) => (
                  <tr key={i} className="border-b"><td className="p-2">{it.name}</td><td className="text-right p-2">{it.qty}</td><td className="text-right p-2">₹{it.price}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">₹{selectedSale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className={`badge ${selectedSale.paymentStatus === 'paid' ? 'badge-success' : selectedSale.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>{selectedSale.paymentStatus}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
