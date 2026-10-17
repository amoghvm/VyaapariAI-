import { NavLink, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4"><NavLink to="/expenses" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink><div><h1 className="text-2xl font-bold">Expense Details</h1><p className="text-gray-600 mt-1">ID: {id}</p></div></div>
      <div className="card"><div className="card-body"><p className="text-gray-600">Details placeholder</p></div></div>
    </div>
  )
}
