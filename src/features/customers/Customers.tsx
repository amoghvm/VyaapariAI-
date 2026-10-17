import { Users, Plus, Search, Filter, CreditCard, Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function Customers() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const customers = [
    { id: '1', name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@example.com', address: '123 Main St', creditLimit: 10000, outstanding: 3500, status: 'active' },
    { id: '2', name: 'Priya Sharma', phone: '9876543211', email: 'priya@example.com', address: '456 Oak Ave', creditLimit: 5000, outstanding: 890, status: 'active' },
    { id: '3', name: 'Amit Patel', phone: '9876543212', email: 'amit@example.com', address: '789 Pine Rd', creditLimit: 15000, outstanding: 0, status: 'active' },
    { id: '4', name: 'Sunita Devi', phone: '9876543213', email: '', address: '321 Elm St', creditLimit: 8000, outstanding: 12000, status: 'overdue' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer records and credit</p>
        </div>
        <NavLink to="/customers/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Customer
        </NavLink>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Credit Limit</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Outstanding</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" /> {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4" /> {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">₹{customer.creditLimit.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={customer.outstanding > customer.creditLimit ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      ₹{customer.outstanding.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {customer.status === 'active' ? 'Active' : 'Overdue'}
                    </span>
                  </td>
                  <td className="p-4">
                    <NavLink to={`/customers/${customer.id}`} className="text-primary-600 hover:text-primary-500 text-sm font-medium">View</NavLink>
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