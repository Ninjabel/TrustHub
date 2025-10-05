'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Archive,
  Share2,
  Filter,
  Calendar
} from 'lucide-react'

type CategoryFilter = 'ALL' | 'TEMPLATE' | 'REGULATION' | 'GUIDE' | 'REPORT' | 'OTHER'

export default function LibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const { data, isLoading } = trpc.library.list.useInfiniteQuery(
    {
      limit: 50,
      ...(categoryFilter !== 'ALL' && { category: categoryFilter }),
      ...(showArchived && { includeArchived: true }),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const files = data?.pages.flatMap((page) => page.files) ?? []

  const getCategoryLabel = (category: string) => {
    const labels = {
      TEMPLATE: 'Szablon',
      REGULATION: 'Regulamin',
      GUIDE: 'Instrukcja',
      REPORT: 'Raport',
      OTHER: 'Inne',
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      TEMPLATE: 'bg-blue-100 text-blue-800',
      REGULATION: 'bg-purple-100 text-purple-800',
      GUIDE: 'bg-green-100 text-green-800',
      REPORT: 'bg-amber-100 text-amber-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getAccessTypeLabel = (accessType: string) => {
    const labels = {
      ALL: 'Wszyscy',
      SELECTED_GROUPS: 'Wybrane grupy',
      SELECTED_USERS: 'Wybrani użytkownicy',
    }
    return labels[accessType as keyof typeof labels] || accessType
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Biblioteka – repozytorium plików
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Zarządzanie dokumentami i plikami systemu
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Dodaj plik
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Wszystkie pliki</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {files.filter(f => !f.isArchived).length}
          </div>
        </div>
        {(['TEMPLATE', 'REGULATION', 'GUIDE', 'REPORT'] as const).map((cat) => (
          <div key={cat} className="bg-white shadow rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">{getCategoryLabel(cat)}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {files.filter(f => f.category === cat && !f.isArchived).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtruj:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'TEMPLATE', 'REGULATION', 'GUIDE', 'REPORT', 'OTHER'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Wszystkie' : getCategoryLabel(cat)}
                </button>
              )
            )}
          </div>
          <div className="ml-auto">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Pokaż zarchiwizowane
            </label>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Brak plików spełniających kryteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Okres sprawozdawczy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data aktualizacji
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wersja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uprawnienia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rozmiar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className={`hover:bg-gray-50 ${
                      file.isArchived ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.title}
                          </div>
                          {file.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {file.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(
                          file.category
                        )}`}
                      >
                        {getCategoryLabel(file.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.period || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(file.updatedAt).toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getAccessTypeLabel(file.accessType)}
                      </span>
                      {file.accessType !== 'ALL' && (
                        <div className="text-xs text-gray-500">
                          {file.accessList.length} obiektów
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Pobierz"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Udostępnij"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          className="text-amber-600 hover:text-amber-900"
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {file.isArchived ? (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Przywróć"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Zarchiwizuj"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add File Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Dodaj plik</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa pliku
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Wprowadź nazwę pliku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Wybierz kategorię</option>
                    <option value="TEMPLATE">Szablon</option>
                    <option value="REGULATION">Regulamin</option>
                    <option value="GUIDE">Instrukcja</option>
                    <option value="REPORT">Raport</option>
                    <option value="OTHER">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Okres sprawozdawczy
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="np. Q1 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plik
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Opcjonalny opis pliku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dostęp dla
                  </label>
                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="ALL">Wszyscy</option>
                    <option value="SELECTED_GROUPS">Wybrane grupy</option>
                    <option value="SELECTED_USERS">Wybrani użytkownicy</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Dodaj plik
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
