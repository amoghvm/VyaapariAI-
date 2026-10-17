import { useState } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { Save, X, ArrowLeft } from 'lucide-react'
import type { Customer } from '@/types'

export function CustomerForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', phone: '', email: '', address: '', gst_number: '', credit_limit: 0, payment_terms: 0, is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      navigate('/customers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement
    let value: unknown = e.target.value
    if (type === 'number') {
      value = value === '' ? 0 : parseFloat(value as string)
    } else if (type === 'checkbox') {
      value = (e.target as HTMLInputElement).checked
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <NavLink to="/customers" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></NavLink>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
          <p className="text-gray-600 mt-1">{isEdit ? 'Update customer details' : 'Create a new customer'}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800">{error}</p></div>}
        <div className="card">
          <div className="card-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Name *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required />
              </div>
              <div><label className="label">Phone</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="input" /></div>
              <div><label className="label">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input" /></div>
              <div><label className="label">GST</label><input type="text" name="gst_number" value={formData.gst_number || ''} onChange={handleChange} className="input" /></div>
              <div className="flex items-center gap-2 pt-6"><input type="checkbox" name="is_active" checked={formData.is_active || false} onChange={handleChange} className="rounded border-gray-300" /><label className="text-sm">Active</label></div>
            </div>
            <div><label className="label">Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} className="input h-20 resize-none" /></div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <NavLink to="/customers" className="btn-secondary"><X className="h-4 w-4" /> Cancel</NavLink>
          <button type="submit" className="btn-primary" disabled={loading}><Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
