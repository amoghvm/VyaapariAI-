import { NavLink } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function InventoryMovementList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NavLink to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5"/></NavLink>
        <div><h1 className="text-2xl font-bold">Inventory Movements</h1><p className="text-gray-600 mt-1">Movement history</p></div>
      </div>
      <div className="card"><div className="card-body"><p className="text-gray-600">Movement history placeholder - integrate with inventory_movements.</p></div></div>
    </div>
  )
}
