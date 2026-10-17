import { useState } from 'react'
import { X, Building2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import type { Business, BusinessType } from '@/types'

interface EditBusinessModalProps {
  open: boolean
  onClose: () => void
  business: Business | null
  onSuccess: () => void
}

export function EditBusinessModal({ open, onClose, business, onSuccess }: EditBusinessModalProps) {
  const { updateBusiness, refreshSession } = useAuth()
  const [form, setForm] = useState({
    name: business?.name || '',
    type: (business?.type || 'retail') as BusinessType,
    gst: business?.gst_number || '',
    phone: business?.phone || '',
    email: business?.email || '',
    address: business?.address || '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)
    setLoading(true)

    const { error } = await updateBusiness({
      name: form.name,
      type: form.type,
      gst_number: form.gst || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
      return
    }

    await refreshSession()
    setToast({ message: 'Business updated successfully', type: 'success' })
    setLoading(false)
    setTimeout(() => {
      setToast(null)
      onSuccess()
      onClose()
    }, 1200)
  }

  if (!open || !business) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Business Details"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              Edit Business Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            {toast && (
              <div className={cn(
                'mb-4 p-3 rounded-lg flex items-center gap-2 text-sm',
                toast.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              )}>
                {toast.type === 'success' ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{toast.message}</span>
                {toast.type === 'success' && !loading && (
                  <button onClick={dismissToast} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="bizName" className="label">Business Name *</label>
                <input
                  id="bizName"
                  type="text"
                  autoComplete="off"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="My Store"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="bizType" className="label">Business Type *</label>
                <select
                  id="bizType"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as BusinessType })}
                  className="input"
                  disabled={loading}
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="bizGst" className="label">GST Number</label>
                <input
                  id="bizGst"
                  type="text"
                  autoComplete="off"
                  value={form.gst}
                  onChange={(e) => setForm({ ...form, gst: e.target.value })}
                  className="input"
                  placeholder="29ABCDE1234F"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bizPhone" className="label">Phone</label>
                  <input
                    id="bizPhone"
                    type="tel"
                    autoComplete="off"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="bizEmail" className="label">Email</label>
                  <input
                    id="bizEmail"
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                    placeholder="business@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bizAddress" className="label">Address</label>
                <input
                  id="bizAddress"
                  type="text"
                  autoComplete="off"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input"
                  placeholder="123 Business Street"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}