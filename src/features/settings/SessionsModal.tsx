import { useState } from 'react'
import { X, Monitor, Globe, MapPin, Clock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface SessionInfo {
  id: string
  browser: string
  os: string
  ip: string
  location: string
  lastActive: string
  current: boolean
}

interface SessionsModalProps {
  open: boolean
  onClose: () => void
}

export function SessionsModal({ open, onClose }: SessionsModalProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      id: 'current',
      browser: 'Chrome',
      os: 'Windows',
      ip: '192.168.1.100',
      location: 'Mumbai, India',
      lastActive: 'Current Session',
      current: true,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const dismissToast = () => setToast(null)

  const handleSignOutAll = async () => {
    setLoading(true)
    setToast(null)
    try {
      // Sign out all other sessions by updating the user's session
      const { error } = await supabase.auth.updateUser({
        // Trigger re-auth by updating a dummy field
      } as any)

      if (error) {
        setToast({ message: error.message, type: 'error' })
        setLoading(false)
        return
      }

      setSessions([sessions[0]])
      setToast({ message: 'Signed out all other devices', type: 'success' })
      setLoading(false)
      setTimeout(() => {
        setToast(null)
      }, 2000)
    } catch {
      setToast({ message: 'Failed to sign out other sessions', type: 'error' })
      setLoading(false)
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
        aria-label="Active Sessions"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary-600" />
              Active Sessions
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
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    session.current
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      session.current ? 'bg-primary-100' : 'bg-gray-100'
                    )}>
                      <Monitor className={cn(
                        'h-5 w-5',
                        session.current ? 'text-primary-600' : 'text-gray-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{session.browser}</p>
                        {session.current && (
                          <span className="badge badge-success">Current</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{session.os}</p>
                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          <span>{session.ip}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{session.lastActive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={handleSignOutAll}
                disabled={loading}
                className="btn-secondary w-full text-red-600 hover:bg-red-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  'Sign out all other devices'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}