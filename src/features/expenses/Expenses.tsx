import { CreditCard, Plus, Search, Filter, Receipt, DollarSign, TrendingUp, Download, Printer } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { cn, formatCurrency } from '@/lib/utils'

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  method: string
  reference: string
}

export function Expenses() {
  const { store } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [printing, setPrinting] = useState(false)

  const expenses: Expense[] = [
    { id: '1', date: '2024-01-15', category: 'Rent', description: 'Shop rent', amount: 15000, method: 'bank_transfer', reference: 'RENT-001' },
    { id: '2', date: '2024-01-14', category: 'Utilities', description: 'Electricity bill', amount: 3500, method: 'upi', reference: 'ELEC-001' },
    { id: '3', date: '2024-01-13', category: 'Transport', description: 'Delivery van fuel', amount: 2500, method: 'cash', reference: '' },
    { id: '4', date: '2024-01-12', category: 'Marketing', description: 'Local newspaper ad', amount: 5000, method: 'card', reference: 'AD-001' },
  ]

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.reference.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || e.category.toLowerCase() === filter
    return matchesSearch && matchesFilter
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference']
    const rows = filteredExpenses.map((e) => [
      e.date,
      e.category,
      e.description,
      e.amount.toString(),
      e.method.replace('_', ' '),
      e.reference || '',
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const storeName = store?.name?.replace(/\s+/g, '_') || 'store'
    const date = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `${storeName}_expenses_${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    setPrinting(true)
    const storeName = store?.name || 'My Store'
    const date = new Date().toLocaleDateString()
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report - ${storeName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 4px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f4f4f5; text-align: left; padding: 8px; border: 1px solid #d1d5db; font-size: 13px; }
            td { padding: 8px; border: 1px solid #d1d5db; font-size: 13px; }
            .total-row { font-weight: bold; background: #f9fafb; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${storeName}</h1>
            <p>Expense Report</p>
            <p>Date: ${date}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses
                .map(
                  (e) => `
                  <tr>
                    <td>${e.date}</td>
                    <td>${e.category}</td>
                    <td>${e.description}</td>
                    <td>${formatCurrency(e.amount)}</td>
                    <td>${e.method.replace('_', ' ')}</td>
                    <td>${e.reference || '-'}</td>
                  </tr>
                `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="3">Total Expenditure</td>
                <td>${formatCurrency(total)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
          <div class="footer">Generated by VyapariAI - ${storeName}</div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `)
    printWindow.document.close()
    setPrinting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="btn-secondary text-sm flex items-center gap-2"
            disabled={printing}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="btn-secondary text-sm flex items-center gap-2"
            disabled={printing}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <NavLink to="/expenses/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Expense
          </NavLink>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expense Count</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Categories</option>
              <option value="rent">Rent</option>
              <option value="utilities">Utilities</option>
              <option value="transport">Transport</option>
              <option value="marketing">Marketing</option>
              <option value="salaries">Salaries</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Reference</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{expense.date}</td>
                  <td className="p-4">
                    <span className="badge badge-info">{expense.category}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-900">{expense.description}</td>
                  <td className="p-4 text-sm font-medium text-red-600">₹{expense.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600 capitalize">{expense.method.replace('_', ' ')}</td>
                  <td className="p-4 text-sm text-gray-600">{expense.reference || '-'}</td>
                  <td className="p-4">
                    <NavLink to={`/expenses/${expense.id}`} className="text-primary-600 hover:text-primary-500 text-sm font-medium">View</NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
