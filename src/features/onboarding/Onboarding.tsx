import { useState } from 'react'
import { LayoutDashboard, Building2, Store, Users, Package, CreditCard, TrendingUp, FileText, AlertTriangle, Bot, ShoppingCart, Settings, Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import type { BusinessType } from '@/types'

const steps = [
  { id: 'business', name: 'Business Details', icon: Building2, href: '/onboarding/business' },
  { id: 'store', name: 'Store Setup', icon: Store, href: '/onboarding/store' },
  { id: 'complete', name: 'Complete', icon: LayoutDashboard, href: '/dashboard' },
]

export function Onboarding() {
  const { business, createBusiness, createStore, loading } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  const handleBusinessSubmit = async (data: { name: string; type: BusinessType; gst_number?: string; address?: string; phone?: string; email?: string }) => {
    const { business: newBusiness, error } = await createBusiness(data)
    if (error) {
      alert(error.message)
      return
    }
    if (newBusiness) {
      setCurrentStep(1)
    }
  }

  const handleStoreSubmit = async (data: { name: string; code: string; address?: string; phone?: string; email?: string }) => {
    if (!business) return
    const { store, error } = await createStore({ business_id: business.id, ...data })
    if (error) {
      alert(error.message)
      return
    }
    if (store) {
      navigate('/dashboard')
    }
  }

  if (business) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set up your first store</h1>
          <p className="text-gray-600 mt-2">Add a store to start managing your business</p>
        </div>
        <StoreForm onSubmit={handleStoreSubmit} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium',
                index < currentStep
                  ? 'bg-primary-600 text-white'
                  : index === currentStep
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-400'
              )}>
                {index < currentStep ? <LayoutDashboard className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className={cn('w-16 h-0.5 mx-2', index < currentStep ? 'bg-primary-600' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((step) => (
            <span key={step.id} className="w-32 text-center">{step.name}</span>
          ))}
        </div>
      </div>

      {currentStep === 0 && (
        <BusinessForm onSubmit={handleBusinessSubmit} />
      )}
      {currentStep === 1 && business && (
        <StoreForm onSubmit={handleStoreSubmit} />
      )}
    </div>
  )
}

function BusinessForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({ name: '', type: 'retail', gst_number: '', address: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label htmlFor="name" className="label">Business Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="My Shop"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="label">Business Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
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
            <label htmlFor="gst_number" className="label">GST Number (Optional)</label>
            <input
              id="gst_number"
              type="text"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              className="input"
              placeholder="29ABCDE1234F1Z5"
            />
          </div>
          <div>
            <label htmlFor="address" className="label">Address (Optional)</label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows={3}
              placeholder="123 Main Street, City, State"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="label">Phone (Optional)</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">Email (Optional)</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="business@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Continue to Store Setup'}
      </button>
    </form>
  )
}

function StoreForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({ name: '', code: '', address: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Store Setup</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label htmlFor="name" className="label">Store Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Main Branch"
              required
            />
          </div>
          <div>
            <label htmlFor="code" className="label">Store Code *</label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input"
              placeholder="MB01"
              required
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="address" className="label">Address (Optional)</label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows={3}
              placeholder="123 Main Street, City, State"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="label">Phone (Optional)</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">Email (Optional)</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="store@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Complete Setup'}
      </button>
    </form>
  )
}