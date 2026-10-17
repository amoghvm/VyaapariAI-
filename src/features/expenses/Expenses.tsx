import { Receipt, Plus, X } from 'lucide-react'
import { useState } from 'react'

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

export function Expenses() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ category: '', description: '', amount: '', method: 'Cash', reference: '' })
  const [rows, setRows] = useState([{ id: '1', category: 'Rent', description: 'Shop rent', amount: 5000, method: 'Bank', reference: 'R-001' }])

  const save = () => {
    setRows([...rows, { id: String(Date.now()), category: form.category, description: form.description, amount: parseFloat(form.amount) || 0, method: form.method, reference: form.reference }])
    setForm({ category: '', description: '', amount: '', method: 'Cash', reference: '' })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Record Expense</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr className="border-b"><th className="text-left p-4">Category</th><th className="text-left p-4">Description</th><th className="text-left p-4">Amount</th><th className="text-left p-4">Method</th><th className="text-left p-4">Reference</th></tr></thead>
          <tbody>
            {rows.map((r) => (<tr key={r.id} className="border-b"><td className="p-4">{r.category}</td><td className="p-4">{r.description}</td><td className="p-4">₹{r.amount}</td><td className="p-4">{r.method}</td><td className="p-4">{r.reference}</td></tr>))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Record Expense">
        <div className="space-y-4">
          <div><label className="label">Category</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Amount</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div><label className="label">Payment Method</label><select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option>Cash</option><option>Card</option><option>UPI</option><option>Bank</option></select></div>
          <div><label className="label">Reference</label><input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
