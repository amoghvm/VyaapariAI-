import { useState } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { Package, Save, X, ArrowLeft } from 'lucide-react'
import type { Product, ProductUnit } from '@/types'

const units: ProductUnit[] = ['piece', 'packet', 'kg', 'gram', 'litre', 'ml', 'meter', 'box', 'dozen', 'custom']

export function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', description: '', sku: '', barcode: '', unit: 'piece', sale_price: 0, purchase_price: 0, tax_rate: 0, reorder_level: 0, reorder_quantity: 0, is_active: true, is_service: false, category_id: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      navigate('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement
    let value: unknown = e.target.value
    if (type === 'number') {
      value = value === '' ? 0 : parseFloat(value as string)
    } else if (type === 'checkbox') {
      value = (e.target as HTMLInputElement).checked
    }
    setFormData((prev) => ({ ...prev, [name]: value as any }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <NavLink to="/products" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></NavLink>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-gray-600 mt-1">{isEdit ? 'Update product details' : 'Create a new product'}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800">{error}</p></div>}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Package className="h-5 w-5" /> Basic Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Product Name *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required />
              </div>
              <div><label className="label">SKU</label><input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="input" /></div>
              <div><label className="label">Barcode</label><input type="text" name="barcode" value={formData.barcode || ''} onChange={handleChange} className="input" /></div>
              <div>
                <label className="label">Unit *</label>
                <select name="unit" value={formData.unit || 'piece'} onChange={handleChange} className="input">
                  {units.map((u) => (<option key={u} value={u}>{u}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" name="is_service" checked={formData.is_service || false} onChange={handleChange} className="rounded border-gray-300" />
                <label className="text-sm text-gray-700">This is a service</label>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="input h-20 resize-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <NavLink to="/products" className="btn-secondary"><X className="h-4 w-4" /> Cancel</NavLink>
          <button type="submit" className="btn-primary" disabled={loading}><Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Product'}</button>
        </div>
      </form>
    </div>
  )
}
