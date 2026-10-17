import { useState } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { Save, X, ArrowLeft } from 'lucide-react'
import type { Supplier } from '@/types'

export function SupplierForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Supplier>>({ name: '', contact_person: '', phone: '', email: '', address: '', gst_number: '', payment_terms: 0, is_active: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true)
    try { await new Promise(r=>setTimeout(r,300)); navigate('/suppliers') }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setLoading(false) }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement
    let value: unknown = e.target.value
    if (type==='number') value = value===''?0:parseFloat(value as string)
    setFormData(p=>({...p,[name]:value as any}))
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4"><NavLink to="/suppliers" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink><div><h1 className="text-2xl font-bold">{isEdit?'Edit Supplier':'Add Supplier'}</h1></div></div>
      <form onSubmit={handleSubmit} className="space-y-6">{error&&<div className="bg-red-50 p-4">{error}</div>}
        <div className="card"><div className="card-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Name *</label><input name="name" value={formData.name||''} onChange={handleChange} className="input" required/></div>
            <div><label className="label">Contact Person</label><input name="contact_person" value={formData.contact_person||''} onChange={handleChange} className="input"/></div>
            <div><label className="label">Phone</label><input name="phone" value={formData.phone||''} onChange={handleChange} className="input"/></div>
            <div><label className="label">Email</label><input type="email" name="email" value={formData.email||''} onChange={handleChange} className="input"/></div>
            <div><label className="label">GST</label><input name="gst_number" value={formData.gst_number||''} onChange={handleChange} className="input"/></div>
            <div><label className="label">Payment Terms (days)</label><input type="number" name="payment_terms" value={formData.payment_terms||0} onChange={handleChange} className="input"/></div>
            <div className="flex items-center gap-2 pt-6"><input type="checkbox" name="is_active" checked={formData.is_active||false} onChange={handleChange} className="rounded"/><label className="text-sm">Active</label></div>
          </div>
          <div><label className="label">Address</label><textarea name="address" value={formData.address||''} onChange={handleChange} className="input h-20 resize-none"/></div>
        </div></div>
        <div className="flex gap-3 justify-end"><NavLink to="/suppliers" className="btn-secondary"><X className="h-4 w-4"/> Cancel</NavLink><button type="submit" className="btn-primary" disabled={loading}><Save className="h-4 w-4"/> {loading?'Saving...':'Save'}</button></div>
      </form>
    </div>
  )
}
