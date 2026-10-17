import { useState } from 'react'
import { X, Shield, QrCode, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TwoFactorModalProps {
  open: boolean
  onClose: () => void
}

export function TwoFactorModal({ open, onClose }: TwoFactorModalProps) {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify'>('intro')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleEnable = () => {
    setStep('setup')
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setToast({ message: 'Please enter a valid 6-digit code', type: 'error' })
      return
    }
    setLoading(true)
    // Simulate verification
    setTimeout(() => {
      setToast({ message: 'Two-factor authentication enabled', type: 'success' })
      setLoading(false)
      setCode('')
      setTimeout(() => {
        setToast(null)
        onClose()
        setStep('intro')
      }, 1500)
    }, 1000)
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
        aria-label="Two-Factor Authentication"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Two-Factor Authentication
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

            {step === 'intro' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-primary-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Add an extra layer of security to your account by enabling two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy.
                </p>
                <button
                  onClick={handleEnable}
                  className="btn-primary w-full"
                >
                  Enable via Authenticator App
                </button>
              </div>
            )}

            {step === 'setup' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-40 w-40 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <QrCode className="h-20 w-20 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with your authenticator app, then enter the 6-digit code it generates.
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="mfaCode" className="label">Verification Code</label>
                    <input
                      id="mfaCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input text-center text-lg tracking-widest"
                      placeholder="123456"
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
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}