import { useState } from 'react'
import { X, Store, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import type { Store as StoreType } from '@/types'

interface EditStoreModalProps {
  open: boolean
  onClose: () => void
  store: StoreType | null
  onSuccess: () => void
}

export function EditStoreModal({ open, onClose, store, onSuccess }: EditStoreModalProps) {
  const { updateStore } = useAuth()
  const [form, setForm] = useState({
    name: store?.name || '',
    code: store?.code || '',
    phone: store?.phone || '',
    email: store?.email || '',
    address: store?.address || '',
    status: store?.is_active ? 'Active' : 'Inactive',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)
    setLoading(true)

    const { error } = await updateStore({
      name: form.name,
      code: form.code,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      is_active: form.status === 'Active',
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
      return
    }

    setToast({ message: 'Store updated successfully', type: 'success' })
    setLoading(false)
    setTimeout(() => {
      setToast(null)
      onSuccess()
      onClose()
    }, 1200)
  }

  if (!open || !store) return null

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
        aria-label="Edit Store Details"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary-600" />
              Edit Store Details
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
                  <Store className="h-4 w-4" />
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
                <label htmlFor="storeName" className="label">Store Name *</label>
                <input
                  id="storeName"
                  type="text"
                  autoComplete="off"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Main Branch"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="storeCode" className="label">Store Code *</label>
                <input
                  id="storeCode"
                  type="text"
                  autoComplete="off"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="BR01"
                  required
                  maxLength={10}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="storePhone" className="label">Phone</label>
                  <input
                    id="storePhone"
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
                  <label htmlFor="storeEmail" className="label">Email</label>
                  <input
                    id="storeEmail"
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                    placeholder="store@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="storeAddress" className="label">Address</label>
                <input
                  id="storeAddress"
                  type="text"
                  autoComplete="off"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input"
                  placeholder="123 Store Street"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="storeStatus" className="label">Status</label>
                <select
                  id="storeStatus"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })}
                  className="input"
                  disabled={loading}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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