import { Users, Plus, Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { STORAGE_KEYS, getStoredData, saveStoredData } from '@/lib/storage'

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

export function Customers() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openLedger, setOpenLedger] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', credit: '' })
  const [customers, setCustomers] = useState(() =>
    getStoredData(STORAGE_KEYS.CUSTOMERS, [
      { id: '1', name: 'Ramesh Kumar', phone: '9876543210', email: '', address: '', creditLimit: 5000, balance: 1200 },
    ])
  )

  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('customers').select('*')
        if (!error && data && data.length > 0) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.full_name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            creditLimit: c.credit_limit,
            balance: c.outstanding_balance,
          }))
          setCustomers(mapped)
          saveStoredData(STORAGE_KEYS.CUSTOMERS, mapped)
        }
      } catch (err) {
        console.warn('Failed to load customers from Supabase:', err)
      }
    }
    loadFromSupabase()
  }, [])

  const save = async () => {
    if (form.name) {
      try {
        await supabase.from('customers').insert({
          full_name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          credit_limit: Number(form.credit) || 0,
          outstanding_balance: 0,
          status: 'Active',
        })
      } catch (err) {
        console.warn('Supabase insert failed, falling back to localStorage:', err)
      }

      const updated = [...customers, { id: String(Date.now()), name: form.name, phone: form.phone, email: form.email, address: form.address, creditLimit: parseFloat(form.credit) || 0, balance: 0 }]
      setCustomers(updated)
      saveStoredData(STORAGE_KEYS.CUSTOMERS, updated)
    }
    setForm({ name: '', phone: '', email: '', address: '', credit: '' })
    setOpenAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => setOpenAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Customer</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr className="border-b"><th className="text-left p-4">Name</th><th className="text-left p-4">Phone</th><th className="text-left p-4">Balance</th><th className="text-left p-4">Actions</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-4">{c.name}</td><td className="p-4">{c.phone}</td><td className="p-4">₹{c.balance}</td>
                <td className="p-4"><button onClick={() => { setSelected(c); setOpenLedger(true) }} className="text-primary-600 text-sm">View Ledger</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Customer">
        <div className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">Credit Limit</label><input type="number" className="input" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenAdd(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={openLedger} onClose={() => setOpenLedger(false)} title="View Ledger">
        {selected && (
          <div className="space-y-4">
            <p className="font-medium">{selected.name}</p>
            <p className="text-sm text-gray-600">Outstanding Balance: ₹{selected.balance}</p>
            <div className="border rounded p-3 text-sm text-gray-500">Mock purchase ledger entries</div>
          </div>
        )}
      </Modal>
    </div>
  )
}
