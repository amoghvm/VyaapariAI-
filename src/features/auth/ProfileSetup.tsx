import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { User, Loader2, AlertCircle } from 'lucide-react'

export function ProfileSetup() {
  const navigate = useNavigate()
  const { completeProfile, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    setLoading(true)
    const { error: profileError } = await completeProfile({
      full_name: fullName.trim(),
      preferred_language: preferredLanguage,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    navigate('/onboarding')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card card-body text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary-600" />
            <p className="text-sm text-gray-600">Loading account...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete your profile</h1>
          <p className="text-gray-600 mt-2">Tell us a little about yourself to get started.</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input pl-10"
                    placeholder="Ravi Sharma"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="label">Preferred Language *</label>
                <select
                  id="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
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
                  'Save & Continue'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have a profile?{' '}
        </p>
      </div>
    </div>
  )
}
