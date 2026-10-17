import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Save, X, ArrowLeft } from 'lucide-react'

export function SaleForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true)
    try { await new Promise(r=>setTimeout(r,300)); navigate('/sales') }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4"><NavLink to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink><div><h1 className="text-2xl font-bold">New Sale</h1></div></div>
      <form onSubmit={handleSubmit} className="space-y-6">{error&&<div className="bg-red-50 p-4">{error}</div>}
        <div className="card"><div className="card-body"><p className="text-gray-600">Sale form placeholder - add line items and totals.</p></div></div>
        <div className="flex gap-3 justify-end"><NavLink to="/sales" className="btn-secondary"><X className="h-4 w-4"/> Cancel</NavLink><button type="submit" className="btn-primary" disabled={loading}><Save className="h-4 w-4"/> {loading?'Saving...':'Save'}</button></div>
      </form>
    </div>
  )
}
