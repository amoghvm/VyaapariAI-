import { ShoppingCart, Plus, Search, Filter, Package, CreditCard, Users, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
          <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="btn-secondary px-4">Close</button>
          </div>
        </div>
      </div>
    </>
  )
}

export function Sales() {
  const [search, setSearch] = useState('')
  const [openNewSale, setOpenNewSale] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const sales = [
    { id: '1', invoice: 'INV-001', date: '2024-01-15', customer: 'Walk-in Customer', total: 1250.00, status: 'paid', paymentStatus: 'paid' },
    { id: '2', invoice: 'INV-002', date: '2024-01-15', customer: 'Ramesh Kumar', total: 3500.00, status: 'confirmed', paymentStatus: 'partial' },
    { id: '3', invoice: 'INV-003', date: '2024-01-14', customer: 'Priya Sharma', total: 890.00, status: 'confirmed', paymentStatus: 'unpaid' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage sales and billing</p>
        </div>
        <button
          onClick={() => setOpenNewSale(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Sale
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select className="input w-auto">
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="input w-auto">
                <option value="">All Payment</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
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
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
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
                  <td className="p-4">
                    <span className={`badge ${
                      sale.status === 'confirmed' ? 'badge-success' :
                      sale.status === 'draft' ? 'badge-info' :
                      'badge-danger'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      sale.paymentStatus === 'paid' ? 'badge-success' :
                      sale.paymentStatus === 'partial' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => { setSelectedSale(sale); setOpenView(true) }}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-body flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {sales.length} sales</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm" disabled>Previous</button>
            <button className="btn-secondary text-sm" disabled>Next</button>
          </div>
        </div>
      </div>

      <Modal open={openNewSale} onClose={() => setOpenNewSale(false)} title="New Sale / POS Invoice">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Create a new invoice with item selection, quantity, and payment.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Customer</label>
              <input className="input" placeholder="Select or enter customer" />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input">
                <option>Cash</option>
                <option>Card</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Credit</option>
              </select>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Line items and billing form — connect to Sales module
          </div>
        </div>
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
            <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
              Line items and totals — connect to Sales module
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">₹{selectedSale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className={`badge ${selectedSale.paymentStatus === 'paid' ? 'badge-success' : selectedSale.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                {selectedSale.paymentStatus}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
