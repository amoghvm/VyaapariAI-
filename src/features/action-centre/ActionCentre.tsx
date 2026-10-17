import { AlertTriangle, Bell, CheckCircle, XCircle, Clock, Filter, Search, Flag, Truck, CreditCard, Users, Package, DollarSign } from 'lucide-react'
import { useState } from 'react'

export function ActionCentre() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const actions = [
    { id: '1', type: 'low_stock', title: 'Low Stock: Sunflower Oil 1L', description: 'Only 4 units remaining (reorder level: 5)', priority: 'high', status: 'pending', relatedType: 'product', relatedId: '3', dueDate: '2024-01-16' },
    { id: '2', type: 'overdue_payment', title: 'Overdue: Sunita Devi', description: '₹12,000 outstanding (credit limit: ₹8,000)', priority: 'urgent', status: 'pending', relatedType: 'customer', relatedId: '4', dueDate: '2024-01-15' },
    { id: '3', type: 'reorder_recommendation', title: 'Reorder: Basmati Rice 1kg', description: 'Current stock: 50, average weekly sale: 30', priority: 'medium', status: 'acknowledged', relatedType: 'product', relatedId: '1', dueDate: '2024-01-20' },
    { id: '4', type: 'price_change', title: 'Price Change: Toor Dal', description: 'Supplier increased price from ₹100 to ₹105/kg', priority: 'medium', status: 'pending', relatedType: 'supplier', relatedId: '2', dueDate: '2024-01-18' },
    { id: '5', type: 'unusual_transaction', title: 'Unusual Sale Pattern', description: 'Sale amount 3x average for customer Ramesh Kumar', priority: 'low', status: 'dismissed', relatedType: 'sale', relatedId: '2', dueDate: '2024-01-14' },
  ]

  const typeIcons: Record<string, React.ReactNode> = {
    low_stock: <AlertTriangle className="h-4 w-4" />,
    overdue_payment: <CreditCard className="h-4 w-4" />,
    reorder_recommendation: <Truck className="h-4 w-4" />,
    price_change: <DollarSign className="h-4 w-4" />,
    unusual_transaction: <Flag className="h-4 w-4" />,
  }

  const priorityColors: Record<string, string> = {
    urgent: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-gray',
  }

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    acknowledged: 'badge-info',
    in_progress: 'badge-info',
    resolved: 'badge-success',
    dismissed: 'badge-gray',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Centre</h1>
          <p className="text-gray-600 mt-1">Alerts, reminders and recommendations</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Actions</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {actions.map((action) => (
            <div key={action.id} className="p-4 hover:bg-gray-50">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  {typeIcons[action.type] || <Bell className="h-5 w-5 text-yellow-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className={`badge ${priorityColors[action.priority]} capitalize`}>{action.priority}</span>
                        <span className={`badge ${statusColors[action.status]} capitalize`}>{action.status.replace('_', ' ')}</span>
                        {action.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {action.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {action.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button className="btn-secondary text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Acknowledge
                      </button>
                      <button className="btn-ghost text-sm text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {actions.length === 0 && (
          <div className="card-body text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-600">No actions found</p>
          </div>
        )}
      </div>
    </div>
  )
}