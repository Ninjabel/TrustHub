'use client'

import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { Building2, ArrowLeft, Clock, User } from 'lucide-react'
import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'

export default function EntityHistoryPage() {
  const params = useParams()
  const entityId = params.id as string
  const { navigateTo } = useTabNavigation()

  const { data: entity, isLoading: entityLoading } = trpc.entities.getById.useQuery({ id: entityId })
  const { data: auditData, isLoading: logsLoading } = trpc.audit.list.useQuery({
    resource: 'ENTITY',
    resourceId: entityId,
  })

  const auditLogs = auditData?.logs || []

  const isLoading = entityLoading || logsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie historii zmian...</p>
        </div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nie znaleziono podmiotu</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Utworzono',
      UPDATE: 'Zaktualizowano',
      DELETE: 'Usunięto',
      ACCESS: 'Dostęp',
      APPROVE: 'Zatwierdzono',
      REJECT: 'Odrzucono',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'text-green-700 bg-green-50 border-green-200',
      UPDATE: 'text-blue-700 bg-blue-50 border-blue-200',
      DELETE: 'text-red-700 bg-red-50 border-red-200',
      ACCESS: 'text-gray-700 bg-gray-50 border-gray-200',
      APPROVE: 'text-green-700 bg-green-50 border-green-200',
      REJECT: 'text-red-700 bg-red-50 border-red-200',
    }
    return colors[action] || 'text-gray-700 bg-gray-50 border-gray-200'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(`/dashboard/entities/${entity.id}/view`)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Historia: {entity.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Dziennik zmian i aktywności</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        {auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak zapisanych zmian</p>
            <p className="text-sm text-gray-500 mt-1">
              Historia zmian będzie widoczna po pierwszej modyfikacji danych podmiotu
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {auditLogs.map((log, logIdx) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {logIdx !== auditLogs.length - 1 && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 ring-8 ring-white">
                          <Clock className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {log.userId ? (
                                <span className="inline-flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Użytkownik ID: {log.userId}
                                </span>
                              ) : (
                                'System'
                              )}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                        <div className="mt-2">
                          <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </div>
                          {log.details && (
                            <div className="mt-2 rounded-md bg-gray-50 px-3 py-2">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                {typeof log.details === 'string'
                                  ? log.details
                                  : JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Informacja:</strong> W dzienniku audytu rejestrowane są wszystkie zmiany danych podmiotu,
          przyznania i cofnięcia uprawnień, oraz inne istotne zdarzenia. Wszystkie wpisy są nieusuwalne
          i zawierają informację o użytkowniku wykonującym operację.
        </p>
      </div>
    </div>
  )
}
