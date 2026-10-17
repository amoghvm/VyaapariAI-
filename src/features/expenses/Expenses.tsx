import { CreditCard, Plus, Search, Filter, Receipt, DollarSign, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function Expenses() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const expenses = [
    { id: '1', date: '2024-01-15', category: 'Rent', description: 'Shop rent', amount: 15000, method: 'bank_transfer', reference: 'RENT-001' },
    { id: '2', date: '2024-01-14', category: 'Utilities', description: 'Electricity bill', amount: 3500, method: 'upi', reference: 'ELEC-001' },
    { id: '3', date: '2024-01-13', category: 'Transport', description: 'Delivery van fuel', amount: 2500, method: 'cash', reference: '' },
    { id: '4', date: '2024-01-12', category: 'Marketing', description: 'Local newspaper ad', amount: 5000, method: 'card', reference: 'AD-001' },
  ]

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track business expenses</p>
        </div>
        <NavLink to="/expenses/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Expense
        </NavLink>
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
                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
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
              {expenses.map((expense) => (
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