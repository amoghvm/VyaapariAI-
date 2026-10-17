import { Package, Plus, Search, Filter, Truck, CreditCard, AlertTriangle, Phone, Mail } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function Suppliers() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const suppliers = [
    { id: '1', name: 'Metro Wholesale', contact: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@metro.com', address: 'Industrial Area', gst: '29ABCDE1234F1Z5', paymentTerms: 30, outstanding: 25000, status: 'active' },
    { id: '2', name: 'Fresh Foods Ltd', contact: 'Anita Singh', phone: '9876543211', email: 'anita@freshfoods.com', address: 'Market Road', gst: '29BCDEF2345G2Z6', paymentTerms: 15, outstanding: 0, status: 'active' },
    { id: '3', name: 'Global Traders', contact: 'Mohammed Ali', phone: '9876543212', email: '', address: 'Trade Center', gst: '29CDEFG3456H3Z7', paymentTerms: 45, outstanding: 15000, status: 'active' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage supplier relationships and purchases</p>
        </div>
        <NavLink to="/suppliers/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Supplier
        </NavLink>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Suppliers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Supplier</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">GST Number</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Payment Terms</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Outstanding</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">{supplier.contact}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="h-4 w-4" /> {supplier.phone}
                    </div>
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail className="h-4 w-4" /> {supplier.email}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{supplier.gst}</td>
                  <td className="p-4 text-sm text-gray-600">{supplier.paymentTerms} days</td>
                  <td className="p-4">
                    <span className={supplier.outstanding > 0 ? 'text-gray-900 font-medium' : 'text-green-600'}>
                      {supplier.outstanding > 0 ? '₹' + supplier.outstanding.toLocaleString() : 'Clear'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <NavLink to={`/suppliers/${supplier.id}`} className="text-primary-600 hover:text-primary-500 text-sm font-medium">View</NavLink>
                      <NavLink to={`/suppliers/${supplier.id}/purchase`} className="text-green-600 hover:text-green-500 text-sm font-medium">New Purchase</NavLink>
                    </div>
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