
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { Layout } from './app/Layout'

const SignIn = lazy(() => import('./features/auth/SignIn').then(m => ({ default: m.SignIn })))
const SignUp = lazy(() => import('./features/auth/SignUp').then(m => ({ default: m.SignUp })))
const ProfileSetup = lazy(() => import('./features/auth/ProfileSetup').then(m => ({ default: m.ProfileSetup })))
const Onboarding = lazy(() => import('./features/onboarding/Onboarding').then(m => ({ default: m.Onboarding })))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const Assistant = lazy(() => import('./features/assistant/Assistant').then(m => ({ default: m.Assistant })))
const Sales = lazy(() => import('./features/sales/Sales').then(m => ({ default: m.Sales })))
const SaleForm = lazy(() => import('./features/sales/SaleForm').then(m => ({ default: m.SaleForm })))
const SaleDetail = lazy(() => import('./features/sales/SaleDetail').then(m => ({ default: m.SaleDetail })))
const Products = lazy(() => import('./features/products/Products').then(m => ({ default: m.Products })))
const ProductForm = lazy(() => import('./features/products/ProductForm').then(m => ({ default: m.ProductForm })))
const ProductDetail = lazy(() => import('./features/products/ProductDetail').then(m => ({ default: m.ProductDetail })))
const Inventory = lazy(() => import('./features/inventory/Inventory').then(m => ({ default: m.Inventory })))
const InventoryMovementList = lazy(() => import('./features/inventory/InventoryMovementList').then(m => ({ default: m.InventoryMovementList })))
const Customers = lazy(() => import('./features/customers/Customers').then(m => ({ default: m.Customers })))
const CustomerForm = lazy(() => import('./features/customers/CustomerForm').then(m => ({ default: m.CustomerForm })))
const CustomerDetail = lazy(() => import('./features/customers/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const Expenses = lazy(() => import('./features/expenses/Expenses').then(m => ({ default: m.Expenses })))
const ExpenseForm = lazy(() => import('./features/expenses/ExpenseForm').then(m => ({ default: m.ExpenseForm })))
const ExpenseDetail = lazy(() => import('./features/expenses/ExpenseDetail').then(m => ({ default: m.ExpenseDetail })))
const Suppliers = lazy(() => import('./features/suppliers/Suppliers').then(m => ({ default: m.Suppliers })))
const SupplierForm = lazy(() => import('./features/suppliers/SupplierForm').then(m => ({ default: m.SupplierForm })))
const SupplierDetail = lazy(() => import('./features/suppliers/SupplierDetail').then(m => ({ default: m.SupplierDetail })))
const Analytics = lazy(() => import('./features/analytics/Analytics').then(m => ({ default: m.Analytics })))
const Documents = lazy(() => import('./features/documents/Documents').then(m => ({ default: m.Documents })))
const ActionCentre = lazy(() => import('./features/action-centre/ActionCentre').then(m => ({ default: m.ActionCentre })))
const Settings = lazy(() => import('./features/settings/Settings').then(m => ({ default: m.Settings })))

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
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
    </AuthProvider>
  )
}
