import { Package, Plus, Search, X } from 'lucide-react'
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

export function Inventory() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openAdjust, setOpenAdjust] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ name: '', sku: '', stock: '', reorder: '', notes: '' })
  const [items, setItems] = useState(() =>
    getStoredData(STORAGE_KEYS.PRODUCTS, [
      { id: '1', name: 'Basmati Rice 1kg', sku: 'RICE-001', stock: 50, reorderLevel: 10 },
      { id: '2', name: 'Toor Dal 1kg', sku: 'DAL-001', stock: 30, reorderLevel: 5 },
    ])
  )

  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*')
        if (!error && data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            reorderLevel: p.reorder_level,
          }))
          setItems(mapped)
          saveStoredData(STORAGE_KEYS.PRODUCTS, mapped)
        }
      } catch (err) {
        console.warn('Failed to load inventory from Supabase:', err)
      }
    }
    loadFromSupabase()
  }, [])

  const saveProduct = () => {
    const updated = [...items, { id: String(Date.now()), name: form.name, sku: form.sku, stock: parseInt(form.stock) || 0, reorderLevel: parseInt(form.reorder) || 0 }]
    setItems(updated)
    saveStoredData(STORAGE_KEYS.PRODUCTS, updated)
    setForm({ name: '', sku: '', stock: '', reorder: '', notes: '' })
    setOpenAdd(false)
  }
  const saveAdjust = () => {
    const updated = items.map((it) => it.id === selected?.id ? { ...it, stock: parseInt(form.stock) || it.stock, reorderLevel: parseInt(form.reorder) || it.reorderLevel } : it)
    setItems(updated)
    saveStoredData(STORAGE_KEYS.PRODUCTS, updated)
    setOpenAdjust(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button onClick={() => setOpenAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Product</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr className="border-b"><th className="text-left p-4">Product</th><th className="text-left p-4">SKU</th><th className="text-left p-4">Stock</th><th className="text-left p-4">Reorder</th><th className="text-left p-4">Actions</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-4">{it.name}</td><td className="p-4">{it.sku}</td><td className="p-4">{it.stock}</td><td className="p-4">{it.reorderLevel}</td>
                <td className="p-4"><button onClick={() => { setSelected(it); setForm({ name: it.name, sku: it.sku, stock: String(it.stock), reorder: String(it.reorderLevel), notes: '' }); setOpenAdjust(true) }} className="text-primary-600 text-sm">Adjust</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Product">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div><label className="label">Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div><label className="label">Reorder Level</label><input type="number" className="input" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenAdd(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={saveProduct} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={openAdjust} onClose={() => setOpenAdjust(false)} title="Adjust/Edit Stock">
        <div className="space-y-4">
          <div><label className="label">Quantity</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div><label className="label">Reorder Level</label><input type="number" className="input" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} /></div>
          <div><label className="label">Movement Notes</label><textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenAdjust(false)} className="btn-secondary px-4">Cancel</button>
            <button onClick={saveAdjust} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
