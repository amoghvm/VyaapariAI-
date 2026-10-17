import { User, Store, Building2, Bell, Shield, Palette, Database, LogOut, Save, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'

export function Settings() {
  const { user, business, store, signOut, switchStore } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'store' | 'notifications' | 'security' | 'appearance' | 'data'>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {message && (
        <div className={cn(
          'p-4 rounded-lg flex items-center gap-3',
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
        </div>
      )}

      <div className="card">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-1 p-1" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="card-body">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'business' && <BusinessTab business={business} />}
          {activeTab === 'store' && <StoreTab store={store} onSwitchStore={switchStore} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'data' && <DataTab />}
        </div>
      </div>

      <div className="card border-red-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-600 mt-1">Sign out of your account</p>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-danger"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    language: 'en',
  })

  return (
    <form className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-10 w-10 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{formData.full_name || 'User'}</h3>
          <p className="text-gray-600">{formData.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="label">Full Name</label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            disabled
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone</label>
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
          <label htmlFor="language" className="label">Preferred Language</label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="input"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
            <option value="bn">Bengali</option>
            <option value="pa">Punjabi</option>
          </select>
        </div>
      </div>

      <button type="button" className="btn-primary">Save Changes</button>
    </form>
  )
}

function BusinessTab({ business }: { business: any }) {
  if (!business) return <div className="text-center py-12 text-gray-600">No business selected</div>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
        <p className="text-gray-600 mt-1">Manage your business details</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-gray-600">Name</dt>
          <dd className="font-medium text-gray-900">{business.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Type</dt>
          <dd className="font-medium text-gray-900 capitalize">{business.type}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">GST Number</dt>
          <dd className="font-medium text-gray-900">{business.gst_number || 'Not registered'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Phone</dt>
          <dd className="font-medium text-gray-900">{business.phone || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Email</dt>
          <dd className="font-medium text-gray-900">{business.email || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Address</dt>
          <dd className="font-medium text-gray-900">{business.address || 'Not set'}</dd>
        </div>
      </dl>

      <button className="btn-secondary">Edit Business Details</button>
    </div>
  )
}

function StoreTab({ store, onSwitchStore }: { store: any; onSwitchStore: (id: string) => Promise<any> }) {
  if (!store) return <div className="text-center py-12 text-gray-600">No store selected</div>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Current Store</h3>
        <p className="text-gray-600 mt-1">Manage your store details</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-gray-600">Name</dt>
          <dd className="font-medium text-gray-900">{store.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Code</dt>
          <dd className="font-medium text-gray-900">{store.code}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Phone</dt>
          <dd className="font-medium text-gray-900">{store.phone || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Email</dt>
          <dd className="font-medium text-gray-900">{store.email || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Address</dt>
          <dd className="font-medium text-gray-900">{store.address || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Status</dt>
          <dd className="font-medium text-gray-900">{store.is_active ? 'Active' : 'Inactive'}</dd>
        </div>
      </dl>

      <button className="btn-secondary">Edit Store Details</button>
    </div>
  )
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    overduePayments: true,
    dailySummary: false,
    weeklyReport: true,
  })

  return (
    <form className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
      </div>

      <div className="space-y-4">
        {[
          { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
          { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in the app' },
          { key: 'lowStock', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
          { key: 'overduePayments', label: 'Overdue Payment Alerts', description: 'Get notified when customers have overdue payments' },
          { key: 'dailySummary', label: 'Daily Summary', description: 'Receive a daily business summary' },
          { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive a weekly analytics report' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </form>
  )
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <p className="text-gray-600 mt-1">Manage your account security</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
          <button className="btn-secondary">Change Password</button>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button className="btn-secondary">Enable 2FA</button>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Active Sessions</p>
            <p className="text-sm text-gray-600">Manage your active login sessions</p>
          </div>
          <button className="btn-secondary">View Sessions</button>
        </div>
      </div>
    </div>
  )
}

function AppearanceTab() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <form className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Theme</h3>
        <p className="text-gray-600 mt-1">Choose your preferred color theme</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {['light', 'dark', 'system'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t as any)}
            className={cn(
              'p-4 border-2 rounded-lg text-center transition-colors',
              theme === t
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="text-lg font-medium capitalize">{t}</div>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Display Density</h3>
        <p className="text-gray-600 mt-1">Adjust the spacing and density of the interface</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {['comfortable', 'compact'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDensity(d as any)}
            className={cn(
              'p-4 border-2 rounded-lg text-center transition-colors',
              density === d
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="text-lg font-medium capitalize">{d}</div>
          </button>
        ))}
      </div>
    </form>
  )
}

function DataTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
        <p className="text-gray-600 mt-1">Export or manage your business data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Export Data</h4>
          <p className="text-sm text-gray-600 mt-1">Download your business data as CSV or Excel</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-secondary text-sm">Export CSV</button>
            <button className="btn-secondary text-sm">Export Excel</button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Import Data</h4>
          <p className="text-sm text-gray-600 mt-1">Import products, customers, or suppliers</p>
          <button className="btn-secondary text-sm mt-4">Import File</button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Backup</h4>
          <p className="text-sm text-gray-600 mt-1">Create a complete backup of your data</p>
          <button className="btn-secondary text-sm mt-4">Create Backup</button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Data Retention</h4>
          <p className="text-sm text-gray-600 mt-1">Configure automatic data cleanup policies</p>
          <button className="btn-secondary text-sm mt-4">Configure</button>
        </div>
      </div>
    </div>
  )
}