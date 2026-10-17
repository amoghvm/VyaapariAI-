import { AlertTriangle, Bell, CheckCircle, XCircle, Clock, Search, Flag, Truck, CreditCard, Users, Package, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Priority = 'High' | 'Urgent' | 'Medium' | 'Low'
type Status = 'Pending' | 'Acknowledged' | 'Dismissed'
type Type = 'inventory' | 'customer' | 'supplier' | 'pattern'

interface Action {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate: string
  type: Type
  route?: string
}

const initialActions: Action[] = [
  { id: '1', title: 'Low Stock: Sunflower Oil 1L', description: 'Only 4 units remaining (reorder level: 5)', priority: 'High', status: 'Pending', dueDate: '2024-01-16', type: 'inventory', route: '/inventory' },
  { id: '2', title: 'Overdue: Sunita Devi', description: '₹12,000 outstanding (credit limit: ₹8,000)', priority: 'Urgent', status: 'Pending', dueDate: '2024-01-15', type: 'customer', route: '/customers' },
  { id: '3', title: 'Reorder: Basmati Rice 1kg', description: 'Current stock: 50, average weekly sale: 30', priority: 'Medium', status: 'Acknowledged', dueDate: '2024-01-20', type: 'inventory', route: '/inventory' },
  { id: '4', title: 'Price Change: Toor Dal', description: 'Supplier increased price from ₹100 to ₹105/kg', priority: 'Medium', status: 'Pending', dueDate: '2024-01-18', type: 'supplier', route: '/suppliers' },
  { id: '5', title: 'Unusual Sale Pattern', description: 'Sale amount 3x average for customer Ramesh Kumar', priority: 'Low', status: 'Dismissed', dueDate: '2024-01-14', type: 'pattern', route: '/sales' },
]

const priorityColors: Record<Priority, string> = {
  Urgent: 'badge-danger',
  High: 'badge-warning',
  Medium: 'badge-info',
  Low: 'badge-gray',
}
const statusColors: Record<Status, string> = {
  Pending: 'badge-warning',
  Acknowledged: 'badge-info',
  Dismissed: 'badge-gray',
}

export function ActionCentre() {
  const [actions, setActions] = useState<Action[]>(initialActions)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const navigate = useNavigate()

  const filtered = actions.filter((a) => a.status !== 'Dismissed' && (a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase())))

  const acknowledge = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a)))
  }
  const dismiss = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Dismissed' } : a)))
    setToast('Action dismissed')
    setTimeout(() => setToast(null), 3000)
  }
  const undo = () => {
    // restore last dismissed? simple: set all dismissed back? We'll just clear toast
    setToast(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Centre</h1>
          <p className="text-gray-600 mt-1">Alerts, reminders and recommendations</p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow flex items-center gap-3 z-50">
          <span>{toast}</span>
          <button onClick={undo} className="text-blue-300 underline text-sm">Undo</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search actions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((action) => (
            <div key={action.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => action.route && navigate(action.route)}>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className={`badge ${priorityColors[action.priority]} capitalize`}>{action.priority}</span>
                    <span className={`badge ${statusColors[action.status]} capitalize`}>{action.status}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due: {action.dueDate}</span>
                  </div>
                  {action.status === 'Pending' && (
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => acknowledge(action.id)} className="btn-secondary text-sm"><CheckCircle className="h-4 w-4" /> Acknowledge</button>
                      <button onClick={() => dismiss(action.id)} className="btn-ghost text-sm text-red-600 hover:text-red-700"><XCircle className="h-4 w-4" /> Dismiss</button>
                    </div>
                  )}
                  {action.status === 'Acknowledged' && (
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => dismiss(action.id)} className="btn-ghost text-sm text-red-600 hover:text-red-700"><XCircle className="h-4 w-4" /> Dismiss</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card-body text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-600">No actions match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
