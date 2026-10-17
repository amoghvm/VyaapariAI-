import { FileText, Upload, X } from 'lucide-react'
import { useState, useRef } from 'react'

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

export function Documents() {
  const [files, setFiles] = useState<any[]>([])
  const [viewFile, setViewFile] = useState<any>(null)
  const [editFile, setEditFile] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const newFiles = Array.from(fileList).map((f) => ({
      id: String(Date.now() + Math.random()),
      name: f.name,
      size: f.size,
      date: new Date().toISOString().slice(0, 10),
      status: 'Uploaded',
      type: f.type,
      blob: f,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const download = (f: any) => {
    const url = URL.createObjectURL(f.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
      <div
        className="card p-8 border-2 border-dashed border-gray-300 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag & drop or click to browse</p>
        <button className="btn-secondary mt-3" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>Browse Files</button>
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.png,.xlsx" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr className="border-b"><th className="text-left p-4">Name</th><th className="text-left p-4">Size</th><th className="text-left p-4">Date</th><th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th></tr></thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="p-4">{f.name}</td>
                <td className="p-4">{f.size}</td>
                <td className="p-4">{f.date}</td>
                <td className="p-4">{f.status}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => setViewFile(f)} className="text-primary-600 text-sm">View</button>
                  <button onClick={() => setEditFile(f)} className="text-primary-600 text-sm">Edit</button>
                  <button onClick={() => download(f)} className="text-primary-600 text-sm">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewFile} onClose={() => setViewFile(null)} title="File Preview">
        {viewFile && (<div className="space-y-2 text-sm"><p>Name: {viewFile.name}</p><p>Size: {viewFile.size}</p><p>Date: {viewFile.date}</p><p>Status: {viewFile.status}</p></div>)}
      </Modal>
      <Modal open={!!editFile} onClose={() => setEditFile(null)} title="Edit File">
        {editFile && (<div className="space-y-2"><label className="label">Type</label><input className="input" defaultValue={editFile.type} /></div>)}
      </Modal>
    </div>
  )
}
