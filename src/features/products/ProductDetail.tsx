import { NavLink, useParams } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const editPath = id ? '/products/' + id + '/edit' : '/products'
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavLink to="/products" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></NavLink>
          <div><h1 className="text-2xl font-bold">Product Details</h1><p className="text-gray-600 mt-1">ID: {id}</p></div>
        </div>
        <NavLink to={editPath} className="btn-secondary"><Edit className="h-4 w-4" /> Edit</NavLink>
      </div>
      <div className="card"><div className="card-body"><p className="text-gray-600">Details placeholder</p></div></div>
    </div>
  )
}
