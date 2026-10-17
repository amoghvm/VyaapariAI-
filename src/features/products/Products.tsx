import { Package, Plus, Search, Filter, Tag, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function Products() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const products = [
    { id: '1', name: 'Basmati Rice 1kg', sku: 'RICE-001', category: 'Grains', unit: 'kg', salePrice: 85, purchasePrice: 70, stock: 50, reorderLevel: 10, status: 'active' },
    { id: '2', name: 'Toor Dal 1kg', sku: 'DAL-001', category: 'Pulses', unit: 'kg', salePrice: 120, purchasePrice: 100, stock: 30, reorderLevel: 5, status: 'active' },
    { id: '3', name: 'Sunflower Oil 1L', sku: 'OIL-001', category: 'Oils', unit: 'litre', salePrice: 145, purchasePrice: 130, stock: 20, reorderLevel: 5, status: 'low' },
    { id: '4', name: 'Biscuits Packet', sku: 'BISC-001', category: 'Snacks', unit: 'packet', salePrice: 25, purchasePrice: 20, stock: 100, reorderLevel: 20, status: 'active' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalogue</p>
        </div>
        <NavLink to="/products/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </NavLink>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input w-auto"
              >
                <option value="">All Categories</option>
                <option value="grains">Grains</option>
                <option value="pulses">Pulses</option>
                <option value="oils">Oils</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Product</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">SKU</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Unit</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Sale Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Purchase Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.sku}</td>
                  <td className="p-4">
                    <span className="badge badge-info">{product.category}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.unit}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">₹{product.salePrice}</td>
                  <td className="p-4 text-sm text-gray-600">₹{product.purchasePrice}</td>
                  <td className="p-4">
                    <span className={product.stock <= product.reorderLevel ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {product.stock}
                    </span>
                    {product.stock <= product.reorderLevel && (
                      <span title="Low stock" className="ml-1">
                        <AlertTriangle className="h-4 w-4 inline text-red-500" />
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <NavLink to={`/products/${product.id}`} className="text-primary-600 hover:text-primary-500 text-sm font-medium">Edit</NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-body flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {products.length} products</p>
        </div>
      </div>
    </div>
  )
}