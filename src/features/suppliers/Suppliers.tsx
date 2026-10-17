import { Truck, Plus, X } from 'lucide-react'
import { useState } from 'react'

function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} border border-gray-200`}>
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

export function Suppliers() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openPurchase, setOpenPurchase] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', gst: '', terms: '' })
  const [suppliers, setSuppliers] = useState([{ id: '1', name: 'ABC Suppliers', contact: 'John', phone: '9999', email: '', gst: '', terms: 'Net 30' }])

  const saveSupplier = () => {
    setSuppliers([...suppliers, { id: String(Date.now()), name: form.name, contact: form.contact, phone: form.phone, email: form.email, gst: form.gst, terms: form.terms }])
    setForm({ name: '', contact: '', phone: '', email: '', gst: '', terms: '' })
    setOpenAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <div className="flex gap-2">
          <button onClick={() => setOpenPurchase(true)} className="btn-secondary">New Purchase</button>
          <button onClick={() => setOpenAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Supplier</button>
        </div>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr className="border-b"><th className="text-left p-4">Name</th><th className="text-left p-4">Contact</th><th className="text-left p-4">Phone</th><th className="text-left p-4">Terms</th></tr></thead>
          <tbody>
            {suppliers.map((s) => (<tr key={s.id} className="border-b"><td className="p-4">{s.name}</td><td className="p-4">{s.contact}</td><td className="p-4">{s.phone}</td><td className="p-4">{s.terms}</td></tr>))}
          </tbody>
        </table>
      </div>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Supplier">
        <div className="space-y-4">
          {(['name','contact','phone','email','gst','terms'] as const).map((f) => (
            <div key={f}><label className="label">{f}</label><input className="input" value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></div>
          ))}
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenAdd(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={saveSupplier} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={openPurchase} onClose={() => setOpenPurchase(false)} title="New Purchase" wide>
        <div className="space-y-4">
          <div><label className="label">Supplier</label>
            <select className="input">{suppliers.map((s) => <option key={s.id}>{s.name}</option>)}</select>
          </div>
          <div className="p-4 border rounded text-sm text-gray-500">Items, total, stock replenishment — connect to Purchases module</div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenPurchase(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={() => setOpenPurchase(false)} className="btn-primary">Save Purchase</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
