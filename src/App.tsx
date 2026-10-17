import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { Layout } from './app/Layout'
import { SignIn } from './features/auth/SignIn'
import { SignUp } from './features/auth/SignUp'
import { ProfileSetup } from './features/auth/ProfileSetup'
import { Onboarding } from './features/onboarding/Onboarding'
import { Dashboard } from './features/dashboard/Dashboard'
import { Assistant } from './features/assistant/Assistant'
import { Sales } from './features/sales/Sales'
import { SaleForm } from './features/sales/SaleForm'
import { SaleDetail } from './features/sales/SaleDetail'
import { Products } from './features/products/Products'
import { ProductForm } from './features/products/ProductForm'
import { ProductDetail } from './features/products/ProductDetail'
import { Inventory } from './features/inventory/Inventory'
import { InventoryMovementList } from './features/inventory/InventoryMovementList'
import { Customers } from './features/customers/Customers'
import { CustomerForm } from './features/customers/CustomerForm'
import { CustomerDetail } from './features/customers/CustomerDetail'
import { Expenses } from './features/expenses/Expenses'
import { ExpenseForm } from './features/expenses/ExpenseForm'
import { ExpenseDetail } from './features/expenses/ExpenseDetail'
import { Suppliers } from './features/suppliers/Suppliers'
import { SupplierForm } from './features/suppliers/SupplierForm'
import { SupplierDetail } from './features/suppliers/SupplierDetail'
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
  const { user, business, store, profileIncomplete, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  if (profileIncomplete) return <Navigate to="/onboarding/profile" replace />
  if (!business || !store) return <Navigate to="/onboarding" replace />

  return <Layout />
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/onboarding/profile" element={<ProfileSetup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/sales/:id" element={<SaleDetail />} />
          <Route path="/sales/:id/edit" element={<SaleForm />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/movements" element={<InventoryMovementList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />
          <Route path="/expenses/:id" element={<ExpenseDetail />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
          <Route path="/suppliers/:id/purchase" element={<SaleForm />} />
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
