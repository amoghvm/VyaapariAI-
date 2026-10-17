import { Package, Plus, Search, Filter, Tag, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-in fade-in zoom-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
          <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="btn-secondary px-4">Close</button>
          </div>
        </div>
      </div>
    </>
  )
}

export function Products() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)

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
        <button
          onClick={() => setOpenAdd(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
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
                    <button
                      onClick={() => { setEditProduct(product); setOpenEdit(true) }}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      Edit
                    </button>
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

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Product">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" placeholder="Product name" />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" placeholder="SKU" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input">
                <option>Grains</option>
                <option>Pulses</option>
                <option>Oils</option>
                <option>Snacks</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input">
                <option>kg</option>
                <option>piece</option>
                <option>litre</option>
                <option>packet</option>
                <option>box</option>
              </select>
            </div>
            <div>
              <label className="label">Sale Price</label>
              <input type="number" className="input" placeholder="₹0.00" />
            </div>
            <div>
              <label className="label">Purchase Price</label>
              <input type="number" className="input" placeholder="₹0.00" />
            </div>
            <div>
              <label className="label">Initial Stock</label>
              <input type="number" className="input" placeholder="0" />
            </div>
            <div>
              <label className="label">Reorder Level</label>
              <input type="number" className="input" placeholder="0" />
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
            Product creation form — connect to Products module
          </div>
        </div>
      </Modal>

      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Product">
        {editProduct && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" defaultValue={editProduct.name} />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input" defaultValue={editProduct.sku} />
              </div>
              <div>
                <label className="label">Sale Price</label>
                <input type="number" className="input" defaultValue={editProduct.salePrice} />
              </div>
              <div>
                <label className="label">Purchase Price</label>
                <input type="number" className="input" defaultValue={editProduct.purchasePrice} />
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
              Pre-filled product details — connect to Products module
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
