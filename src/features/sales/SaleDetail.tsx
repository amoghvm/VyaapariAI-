import { NavLink, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SaleDetail() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.rpc('confirm_sale', { p_sale_id: id })
      if (error) throw error
      console.log('Sale confirmed:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.rpc('record_payment', {
        p_sale_id: id,
        p_amount: 100,
        p_method: 'cash',
        p_reference: null,
        p_payment_date: new Date().toISOString().split('T')[0],
        p_notes: null
      })
      if (error) throw error
      console.log('Payment recorded:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4"><NavLink to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink><div><h1 className="text-2xl font-bold">Sale Details</h1><p className="text-gray-600 mt-1">ID: {id}</p></div></div>
      {error && <div className="bg-red-50 p-4">{error}</div>}
      <div className="card"><div className="card-body space-y-4">
        <p className="text-gray-600">Sale details placeholder. Integrate with service layer.</p>
        <div className="flex gap-3">
          <button className="btn-primary" disabled={loading} onClick={handleConfirm}>Confirm Sale (RPC)</button>
          <button className="btn-secondary" disabled={loading} onClick={handleRecordPayment}>Record Payment (RPC)</button>
        </div>
      </div></div>
    </div>
  )
}
