import { Package, Search, Filter, AlertTriangle, ArrowUpDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export function Inventory() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const inventory = [
    { id: '1', product: 'Basmati Rice 1kg', sku: 'RICE-001', unit: 'kg', currentStock: 50, reorderLevel: 10, status: 'ok', lastMovement: '2024-01-15', value: 4250 },
    { id: '2', product: 'Toor Dal 1kg', sku: 'DAL-001', unit: 'kg', currentStock: 30, reorderLevel: 5, status: 'ok', lastMovement: '2024-01-14', value: 3600 },
    { id: '3', product: 'Sunflower Oil 1L', sku: 'OIL-001', unit: 'litre', currentStock: 4, reorderLevel: 5, status: 'low', lastMovement: '2024-01-13', value: 580 },
    { id: '4', product: 'Biscuits Packet', sku: 'BISC-001', unit: 'packet', currentStock: 100, reorderLevel: 20, status: 'ok', lastMovement: '2024-01-15', value: 2500 },
  ]

  const lowStockItems = inventory.filter((i) => i.status === 'low').length
  const totalValue = inventory.reduce((sum, i) => sum + i.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Track stock levels and movements</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-600" />
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
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="ok">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Product</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">SKU</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Unit</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Current Stock</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Reorder Level</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Stock Value</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Last Movement</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{item.product}</td>
                  <td className="p-4 text-sm text-gray-600">{item.sku}</td>
                  <td className="p-4 text-sm text-gray-600">{item.unit}</td>
                  <td className="p-4">
                    <span className={item.currentStock <= item.reorderLevel ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.reorderLevel}</td>
                  <td className="p-4">
                    <span className={`badge ${item.status === 'ok' ? 'badge-success' : item.status === 'low' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.status === 'ok' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">₹{item.value.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600">{item.lastMovement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}