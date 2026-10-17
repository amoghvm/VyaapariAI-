import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Save, X, ArrowLeft } from 'lucide-react'
import type { Expense } from '@/types'

export function ExpenseForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Expense>>({ description: '', amount: 0, expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true)
    try { await new Promise(r=>setTimeout(r,300)); navigate('/expenses') }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setLoading(false) }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement
    let value: unknown = e.target.value
    if (type==='number') value = value===''?0:parseFloat(value as string)
    setFormData(p=>({...p,[name]:value as any}))
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4"><NavLink to="/expenses" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink><div><h1 className="text-2xl font-bold">Add Expense</h1></div></div>
      <form onSubmit={handleSubmit} className="space-y-6">{error&&<div className="bg-red-50 p-4">{error}</div>}
        <div className="card"><div className="card-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Date *</label><input type="date" name="expense_date" value={formData.expense_date||''} onChange={handleChange} className="input" required/></div>
            <div><label className="label">Amount (₹) *</label><input type="number" step="0.01" min="0" name="amount" value={formData.amount||0} onChange={handleChange} className="input" required/></div>
            <div><label className="label">Payment Method</label><select name="payment_method" value={formData.payment_method||'cash'} onChange={handleChange} className="input"><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option><option value="other">Other</option></select></div>
            <div><label className="label">Reference</label><input name="reference" value={formData.reference||''} onChange={handleChange} className="input"/></div>
          </div>
          <div><label className="label">Description *</label><textarea name="description" value={formData.description||''} onChange={handleChange} className="input h-20 resize-none" required/></div>
          <div><label className="label">Notes</label><textarea name="notes" value={formData.notes||''} onChange={handleChange} className="input h-20 resize-none"/></div>
        </div></div>
        <div className="flex gap-3 justify-end"><NavLink to="/expenses" className="btn-secondary"><X className="h-4 w-4"/> Cancel</NavLink><button type="submit" className="btn-primary" disabled={loading}><Save className="h-4 w-4"/> {loading?'Saving...':'Save'}</button></div>
      </form>
    </div>
  )
}
