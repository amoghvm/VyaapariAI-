import { useState } from 'react'
import { X, Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import type { StoreSettings } from '@/types'

interface RetentionModalProps {
  open: boolean
  onClose: () => void
}

type RetentionPeriod = '1year' | '3years' | 'forever'

export function RetentionModal({ open, onClose }: RetentionModalProps) {
  const { store, updateStore } = useAuth()
  const [retention, setRetention] = useState<RetentionPeriod>(
    ((store?.settings as unknown as Record<string, unknown>)?.data_retention as RetentionPeriod) || 'forever'
  )
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)
    setLoading(true)

    const { error } = await updateStore({
      settings: {
        ...store?.settings,
        data_retention: retention,
      } as StoreSettings,
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
      return
    }

    setToast({ message: 'Data retention settings saved', type: 'success' })
    setLoading(false)
    setTimeout(() => {
      setToast(null)
      onClose()
    }, 1200)
  }

  if (!open) return null

  const options: { value: RetentionPeriod; label: string; description: string }[] = [
    { value: '1year', label: '1 Year', description: 'Transactions older than 1 year will be archived' },
    { value: '3years', label: '3 Years', description: 'Transactions older than 3 years will be archived' },
    { value: 'forever', label: 'Forever', description: 'Keep all transaction history indefinitely' },
  ]

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
        aria-label="Configure Data Retention"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary-600" />
              Configure Data Retention
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
                  <CheckCircle className="h-4 w-4" />
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
              <p className="text-sm text-gray-600">
                Choose how long to keep your transaction history before archiving.
              </p>
              <div className="space-y-3">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRetention(opt.value)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border-2 transition-colors',
                      retention === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{opt.description}</div>
                  </button>
                ))}
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
                  'Save Preferences'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}