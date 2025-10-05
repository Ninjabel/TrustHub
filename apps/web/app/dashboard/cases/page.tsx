'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { 
  FileText, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  History, 
  Download,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
} from 'lucide-react'
import { CaseStatus, CasePriority } from '@prisma/client'

type CaseCategory = 'REPORTING' | 'REGISTRY_DATA' | 'ACCESS' | 'OTHER'

export default function CasesPage() {
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<CaseCategory | ''>('')
  const [showNewCaseModal, setShowNewCaseModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list')

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.cases.list.useInfiniteQuery(
    {
      limit: 20,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const cases = data?.pages.flatMap((page) => page.cases) ?? []

  // Filter by search query and category (client-side)
  const filteredCases = cases.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const getStatusConfig = (status: CaseStatus) => {
    switch (status) {
      case 'NEW':
        return { label: 'Nowa', color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
      case 'IN_PROGRESS':
        return { label: 'W toku', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'DONE':
        return { label: 'Zakończona', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
      case 'CANCELLED':
        return { label: 'Anulowana', color: 'bg-gray-100 text-gray-800', icon: XCircle }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  const getPriorityConfig = (priority: CasePriority) => {
    switch (priority) {
      case 'LOW':
        return { label: 'Niski', color: 'text-gray-600' }
      case 'MEDIUM':
        return { label: 'Średni', color: 'text-yellow-600' }
      case 'HIGH':
        return { label: 'Wysoki', color: 'text-orange-600' }
      case 'URGENT':
        return { label: 'Pilny', color: 'text-red-600' }
      default:
        return { label: priority, color: 'text-gray-600' }
    }
  }

  const toggleCaseSelection = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    )
  }

  const handleViewDetails = (caseId: string) => {
    setSelectedCase(caseId)
    setViewMode('details')
  }

  if (viewMode === 'details' && selectedCase) {
    return <CaseDetailsView caseId={selectedCase} onBack={() => {
      setViewMode('list')
      setSelectedCase(null)
    }} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sprawy</h1>
        <p className="mt-2 text-sm text-gray-700">
          Zarządzanie korespondencją formalną z UKNF
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Wyszukaj sprawy po tytule lub treści..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtry:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Wszystkie statusy</option>
              <option value="NEW">Nowa</option>
              <option value="IN_PROGRESS">W toku</option>
              <option value="DONE">Zakończona</option>
              <option value="CANCELLED">Anulowana</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CasePriority | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Wszystkie priorytety</option>
              <option value="LOW">Niski</option>
              <option value="MEDIUM">Średni</option>
              <option value="HIGH">Wysoki</option>
              <option value="URGENT">Pilny</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CaseCategory | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Wszystkie kategorie</option>
              <option value="REPORTING">Sprawozdawczość</option>
              <option value="REGISTRY_DATA">Dane rejestrowe</option>
              <option value="ACCESS">Dostępy</option>
              <option value="OTHER">Inne</option>
            </select>

            {(statusFilter || priorityFilter || categoryFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('')
                  setPriorityFilter('')
                  setCategoryFilter('')
                  setSearchQuery('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="w-12 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCases(filteredCases.map((c) => c.id))
                      } else {
                        setSelectedCases([])
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numer sprawy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tytuł
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorytet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data utworzenia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ostatnia aktualizacja
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prowadzący
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Użytkownik
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <Clock className="animate-spin h-6 w-6 text-gray-400 mr-3" />
                      Ładowanie spraw...
                    </div>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="font-medium">Brak spraw</p>
                    <p className="mt-1">Nie znaleziono spraw spełniających kryteria wyszukiwania.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => {
                  const statusConfig = getStatusConfig(caseItem.status)
                  const priorityConfig = getPriorityConfig(caseItem.priority)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr 
                      key={caseItem.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(caseItem.id)}
                    >
                      <td 
                        className="px-3 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(caseItem.id)}
                          onChange={() => toggleCaseSelection(caseItem.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caseItem.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{caseItem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${priorityConfig.color}`}>
                          <Flag className="h-4 w-4" />
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(caseItem.createdAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(caseItem.updatedAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.assignedTo?.name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.createdBy.name}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(caseItem.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Podgląd"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasNextPage && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button
              onClick={() => fetchNextPage()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Załaduj więcej
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedCases.length > 0 && (
                <span>Zaznaczono: <span className="font-semibold">{selectedCases.length}</span></span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewCaseModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
                Nowa sprawa
              </button>
              
              {selectedCases.length > 0 && (
                <>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4" />
                    Podgląd
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Dodaj wiadomość
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <History className="h-4 w-4" />
                    Historia
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4" />
                    Eksportuj
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <NewCaseModal onClose={() => setShowNewCaseModal(false)} />
      )}

      {/* Padding for fixed action bar */}
      <div className="h-20" />
    </div>
  )
}

// Case Details View Component
function CaseDetailsView({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'attachments' | 'history'>('details')
  
  const { data: caseData, isLoading } = trpc.cases.getById.useQuery({ id: caseId })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Clock className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nie znaleziono sprawy</h3>
      </div>
    )
  }

  const statusConfig = {
    NEW: { label: 'Nowa', color: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'W toku', color: 'bg-yellow-100 text-yellow-800' },
    DONE: { label: 'Zakończona', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Anulowana', color: 'bg-gray-100 text-gray-800' },
  }[caseData.status]

  const priorityConfig = {
    LOW: { label: 'Niski', color: 'text-gray-600' },
    MEDIUM: { label: 'Średni', color: 'text-yellow-600' },
    HIGH: { label: 'Wysoki', color: 'text-orange-600' },
    URGENT: { label: 'Pilny', color: 'text-red-600' },
  }[caseData.priority]

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            ← Powrót
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <p className="mt-1 text-sm text-gray-500">Numer sprawy: {caseData.id.slice(0, 12)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className={`text-sm font-medium ${priorityConfig.color}`}>
            <Flag className="inline h-4 w-4 mr-1" />
            {priorityConfig.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', label: 'Szczegóły', icon: FileText },
            { id: 'messages', label: 'Wiadomości', icon: MessageSquare },
            { id: 'attachments', label: 'Załączniki', icon: Download },
            { id: 'history', label: 'Historia', icon: History },
            ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'details' | 'messages' | 'attachments' | 'history')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tytuł sprawy
                </label>
                <p className="text-sm text-gray-900">{caseData.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorytet
                </label>
                <span className={`text-sm font-medium ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podmiot
                </label>
                <p className="text-sm text-gray-900">{caseData.organization?.name || '—'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Użytkownik założyciel
                </label>
                <p className="text-sm text-gray-900">{caseData.createdBy.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prowadzący z UKNF
                </label>
                <p className="text-sm text-gray-900">{caseData.assignedTo?.name || 'Nie przypisano'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data utworzenia
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(caseData.createdAt).toLocaleString('pl-PL')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data ostatniej aktualizacji
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(caseData.updatedAt).toLocaleString('pl-PL')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis sprawy
              </label>
              <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-900 whitespace-pre-wrap">
                {caseData.description}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Zmień status
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Edytuj dane
              </button>
              <button className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50">
                Zamknij sprawę
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Funkcja wiadomości zostanie wkrótce dodana</p>
            <p className="text-sm mt-2">Synchronizacja z modułem komunikacyjnym</p>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="text-center py-12 text-gray-500">
            <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Brak załączników</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              + Dodaj załącznik
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {caseData.timeline && caseData.timeline.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {caseData.timeline.map((event, idx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {idx !== caseData.timeline.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <History className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{event.event}</p>
                              {event.details && (
                                <p className="mt-1 text-sm text-gray-500">{event.details}</p>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(event.createdAt).toLocaleString('pl-PL')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Brak historii</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// New Case Modal Component
function NewCaseModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CaseCategory>('OTHER')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<CasePriority>('MEDIUM')

  const utils = trpc.useContext()
  const createMutation = trpc.cases.create.useMutation({
    onSuccess: () => {
      utils.cases.list.invalidate()
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, description, priority })
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Nowa sprawa</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł sprawy <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Np. Pytanie o walidację sprawozdania Q3 2025"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CaseCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="REPORTING">Sprawozdawczość</option>
              <option value="REGISTRY_DATA">Dane rejestrowe</option>
              <option value="ACCESS">Dostępy</option>
              <option value="OTHER">Inne</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priorytet
            </label>
            <div className="flex gap-4">
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => (
                <label key={p} className="flex items-center">
                  <input
                    type="radio"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(e.target.value as CasePriority)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {p === 'LOW' ? 'Niski' : p === 'MEDIUM' ? 'Średni' : p === 'HIGH' ? 'Wysoki' : 'Pilny'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Opis <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Szczegółowy opis sprawy..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Zapisywanie...' : 'Zapisz i wyślij'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
