import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { Layout } from './app/Layout'
import { SignIn } from './features/auth/SignIn'
import { SignUp } from './features/auth/SignUp'
import { Onboarding } from './features/onboarding/Onboarding'
import { Dashboard } from './features/dashboard/Dashboard'
import { Assistant } from './features/assistant/Assistant'
import { Sales } from './features/sales/Sales'
import { Products } from './features/products/Products'
import { Inventory } from './features/inventory/Inventory'
import { Customers } from './features/customers/Customers'
import { Expenses } from './features/expenses/Expenses'
import { Suppliers } from './features/suppliers/Suppliers'
import { Analytics } from './features/analytics/Analytics'
import { Documents } from './features/documents/Documents'
import { ActionCentre } from './features/action-centre/ActionCentre'
import { Settings } from './features/settings/Settings'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
    </div>
  )
}

function ProtectedLayout() {
  const { user, business, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  if (!business) return <Onboarding />

  return <Layout />
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/action-centre" element={<ActionCentre />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </AuthProvider>
  )
}