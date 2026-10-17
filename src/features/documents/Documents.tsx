import { FileText, Plus, Search, Filter, Upload, Download, Eye, Edit, Trash2, AlertTriangle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function Documents() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [dragActive, setDragActive] = useState(false)

  const documents = [
    { id: '1', name: 'invoice_001.pdf', type: 'supplier_invoice', size: '2.4 MB', status: 'extracted', supplier: 'Metro Wholesale', date: '2024-01-15' },
    { id: '2', name: 'purchase_order_002.pdf', type: 'purchase_order', size: '1.1 MB', status: 'reviewed', supplier: 'Fresh Foods Ltd', date: '2024-01-14' },
    { id: '3', name: 'delivery_note_003.jpg', type: 'delivery_note', size: '856 KB', status: 'processing', supplier: 'Global Traders', date: '2024-01-13' },
    { id: '4', name: 'statement_jan.pdf', type: 'statement', size: '512 KB', status: 'uploaded', supplier: 'Metro Wholesale', date: '2024-01-12' },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file upload
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: React.ReactNode; class: string }> = {
      uploaded: { icon: <Clock className="h-3 w-3" />, class: 'badge-info' },
      processing: { icon: <Loader2 className="h-3 w-3 animate-spin" />, class: 'badge-warning' },
      extracted: { icon: <Eye className="h-3 w-3" />, class: 'badge-info' },
      reviewed: { icon: <CheckCircle className="h-3 w-3" />, class: 'badge-success' },
      matched: { icon: <CheckCircle className="h-3 w-3" />, class: 'badge-success' },
      posted: { icon: <CheckCircle className="h-3 w-3" />, class: 'badge-success' },
      failed: { icon: <XCircle className="h-3 w-3" />, class: 'badge-danger' },
    }
    const badge = badges[status] || badges.uploaded
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage supplier invoices and documents</p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Drag & drop documents here</h3>
        <p className="text-gray-600 mt-1">Supports PDF, JPG, PNG, XLSX (Max 10MB)</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn-primary">
            <Upload className="h-4 w-4" />
            Browse Files
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="all">All Types</option>
              <option value="supplier_invoice">Supplier Invoices</option>
              <option value="purchase_order">Purchase Orders</option>
              <option value="delivery_note">Delivery Notes</option>
              <option value="statement">Statements</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Document</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Supplier</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Size</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{doc.name}</td>
                  <td className="p-4">
                    <span className="badge badge-info">{doc.type.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{doc.supplier}</td>
                  <td className="p-4 text-sm text-gray-600">{doc.size}</td>
                  <td className="p-4">{getStatusBadge(doc.status)}</td>
                  <td className="p-4 text-sm text-gray-600">{doc.date}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="View"><Eye className="h-4 w-4" /></button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Edit"><Edit className="h-4 w-4" /></button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Download"><Download className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-body flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {documents.length} documents</p>
        </div>
      </div>
    </div>
  )
}