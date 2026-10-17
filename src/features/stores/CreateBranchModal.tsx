import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { X, Plus, Loader2, AlertCircle, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateBranchModalProps {
  open: boolean
  onClose: () => void
}

export function CreateBranchModal({ open, onClose }: CreateBranchModalProps) {
  const { createStore, switchStore, business } = useAuth()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)
    setLoading(true)

    if (!business) {
      setToast({ message: 'No active business', type: 'error' })
      setLoading(false)
      return
    }

    const { store, error } = await createStore({
      business_id: business.id,
      name,
      code,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
      return
    }

    if (store) {
      await switchStore(store.id)
      setToast({ message: 'Branch created successfully', type: 'success' })
      setLoading(false)
      setName('')
      setCode('')
      setAddress('')
      setPhone('')
      setEmail('')
      setTimeout(() => {
        setToast(null)
        onClose()
      }, 1200)
    }
  }

  if (!open) return null

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
        aria-label="Add Branch"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              Add Branch
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
                  <Plus className="h-4 w-4" />
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
                <label htmlFor="branchName" className="label">Branch / Store Name *</label>
                <input
                  id="branchName"
                  type="text"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="East Branch"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="branchCode" className="label">Store Code *</label>
                <input
                  id="branchCode"
                  type="text"
                  autoComplete="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input"
                  placeholder="BR02"
                  required
                  maxLength={10}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="branchAddress" className="label">Address</label>
                <input
                  id="branchAddress"
                  type="text"
                  autoComplete="off"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                  placeholder="123 Branch Street"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="branchPhone" className="label">Phone</label>
                  <input
                    id="branchPhone"
                    type="tel"
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="branchEmail" className="label">Email</label>
                  <input
                    id="branchEmail"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="branch@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Branch'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
