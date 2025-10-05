'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DataTable, type Column } from '@/components/data-table'
// Breadcrumbs removed: prefer TabNavigation in the dashboard layout
import { 
  Download, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  History, 
  FileDown,
  X
} from 'lucide-react'
import { useSession } from 'next-auth/react'

// Types
type LibraryFile = {
  id: string
  title: string
  fileName: string
  description: string | null
  fileUrl: string
  fileSize: number
  mimeType: string
  reportPeriod: 'QUARTERLY' | 'ANNUAL' | 'NONE'
  version: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  uploadedById: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
}

type ModalMode = 'add' | 'edit' | 'view' | 'history' | null

export default function LibraryPage() {
  const { data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [reportPeriodFilter, setReportPeriodFilter] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)

  const isUKNF = session?.user.role === 'UKNF_ADMIN' || session?.user.role === 'UKNF_EMPLOYEE'

  // Query files
  const { data, refetch } = trpc.library.list.useQuery({
    reportPeriod: reportPeriodFilter === 'all' ? undefined : (reportPeriodFilter as 'QUARTERLY' | 'ANNUAL' | 'NONE'),
    isArchived: showArchived,
    limit: 50,
  })

  // Mutations
  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => {
      refetch()
      setModalMode(null)
      setSelectedFile(null)
    },
  })

  const downloadMutation = trpc.library.download.useMutation({
    onSuccess: (data) => {
      // Trigger download
      window.open(data.fileUrl, '_blank')
    },
  })

  const handleDownload = (file: LibraryFile) => {
    downloadMutation.mutate({ id: file.id })
  }

  const handleDelete = () => {
    if (selectedFile) {
      deleteMutation.mutate({ id: selectedFile.id })
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
    // TODO: Implement export functionality
    console.log('Export as:', format)
  }

  // Table columns
  const columns: Column<LibraryFile>[] = [
    {
      key: 'updatedAt',
      label: 'Data aktualizacji',
      sortable: true,
      render: (item) => new Date(item.updatedAt).toLocaleDateString('pl-PL'),
    },
    {
      key: 'title',
      label: 'Nazwa pliku',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-xs text-gray-500">{item.fileName}</div>
        </div>
      ),
    },
    {
      key: 'reportPeriod',
      label: 'Okres sprawozdawczy',
      sortable: true,
      render: (item) => {
        const labels = {
          QUARTERLY: 'Kwartalny',
          ANNUAL: 'Roczny',
          NONE: 'Brak',
        }
        return labels[item.reportPeriod] || item.reportPeriod
      },
    },
    {
      key: 'version',
      label: 'Wersja',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Akcja',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload(item)
          }}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          title="Pobierz plik"
        >
          <Download className="h-3 w-3" />
          Pobierz
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Biblioteka – repozytorium plików
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Zarządzanie i pobieranie plików udostępnianych przez UKNF
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-300 rounded px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Okres sprawozdawczy:</label>
            <select
              value={reportPeriodFilter}
              onChange={(e) => setReportPeriodFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Wszystkie</option>
              <option value="QUARTERLY">Kwartalny</option>
              <option value="ANNUAL">Roczny</option>
              <option value="NONE">Brak</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Pokaż archiwalne</span>
            </label>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-300 rounded">
        <DataTable
          data={data?.files || []}
          columns={columns}
          searchPlaceholder="Szukaj plików..."
          onRowClick={(item) => {
            setSelectedFile(item)
            setModalMode('view')
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          {isUKNF && (
            <button
              onClick={() => setModalMode('add')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Dodaj
            </button>
          )}
          
          {selectedFile && (
            <>
              {isUKNF && (
                <>
                  <button
                    onClick={() => setModalMode('edit')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Modyfikuj
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń
                  </button>
                </>
              )}

              <button
                onClick={() => setModalMode('view')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Podgląd
              </button>

              <button
                onClick={() => setModalMode('history')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <History className="h-4 w-4" />
                Historia
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => handleExport('xlsx')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <FileDown className="h-4 w-4" />
          Eksportuj
        </button>
      </div>

      {/* Modals */}
      {modalMode === 'add' && isUKNF && (
        <AddFileModal
          onClose={() => setModalMode(null)}
          onSuccess={() => {
            refetch()
            setModalMode(null)
          }}
        />
      )}

      {modalMode === 'edit' && selectedFile && isUKNF && (
        <EditFileModal
          file={selectedFile}
          onClose={() => setModalMode(null)}
          onSuccess={() => {
            refetch()
            setModalMode(null)
          }}
        />
      )}

      {modalMode === 'view' && selectedFile && (
        <ViewFileModal
          file={selectedFile}
          onClose={() => setModalMode(null)}
        />
      )}

      {modalMode === 'history' && selectedFile && (
        <HistoryModal
          fileId={selectedFile.id}
          fileName={selectedFile.title}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  )
}

// Modal components will be added in next parts...

// Lightweight modal implementations to avoid runtime errors when referenced
function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-2xl w-full bg-white border border-gray-200 rounded shadow-lg p-6 z-10">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function AddFileModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [title, setTitle] = useState('')
  const [fileName, setFileName] = useState('')
  const [reportPeriod, setReportPeriod] = useState<'QUARTERLY' | 'ANNUAL' | 'NONE'>('NONE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Minimal implementation: call onSuccess if provided and close modal
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <ModalShell title="Dodaj plik" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Nazwa</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Plik</label>
          <input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Nazwa pliku (lokalnie)" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Okres sprawozdawczy</label>
          <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value as 'QUARTERLY' | 'ANNUAL' | 'NONE')} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
            <option value="QUARTERLY">Kwartalny</option>
            <option value="ANNUAL">Roczny</option>
            <option value="NONE">Brak</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded">Anuluj</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Dodaj</button>
        </div>
      </form>
    </ModalShell>
  )
}

function EditFileModal({ file, onClose, onSuccess }: { file: { id: string; title: string }; onClose: () => void; onSuccess?: () => void }) {
  const [title, setTitle] = useState(file?.title || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Minimal implementation: call onSuccess if provided and close modal
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <ModalShell title="Modyfikuj plik" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Nazwa</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded">Anuluj</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Zapisz</button>
        </div>
      </form>
    </ModalShell>
  )
}

function ViewFileModal({ file, onClose }: { file: { id: string; title: string; fileName?: string; version?: string; reportPeriod?: string; createdAt: Date; updatedAt?: Date; mimeType: string }; onClose: () => void }) {
  const downloadMutation = trpc.library.download.useMutation({
    onSuccess: (data) => {
      if (data?.fileUrl) window.open(data.fileUrl, '_blank')
    },
  })

  return (
    <ModalShell title="Podgląd pliku" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-gray-700">
          <div className="font-medium">{file.title}</div>
          <div className="text-xs text-gray-500">{file.fileName}</div>
          <div className="text-xs text-gray-500">Wersja: {file.version}</div>
          <div className="text-xs text-gray-500">Okres: {file.reportPeriod}</div>
          <div className="text-xs text-gray-500">Zaktualizowano: {file.updatedAt ? new Date(file.updatedAt).toLocaleString() : 'N/A'}</div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border rounded">Zamknij</button>
          <button
            onClick={() => downloadMutation.mutate({ id: file.id })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Download className="h-4 w-4" />
            Pobierz
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function HistoryModal({ fileId: _fileId, fileName, onClose }: { fileId: string; fileName: string; onClose: () => void }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Minimal placeholder for history
  return (
    <ModalShell title={`Historia: ${fileName}`} onClose={onClose}>
      <div className="text-sm text-gray-700">
        <p>Brak dostępnej historii dla tego pliku w tej wersji interfejsu.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border rounded">Zamknij</button>
        </div>
      </div>
    </ModalShell>
  )
}
