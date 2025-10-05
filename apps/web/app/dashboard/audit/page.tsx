'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Clock, User, FileText, Filter } from 'lucide-react'

export default function AuditPage() {
  const [resourceFilter, setResourceFilter] = useState<string>('')
  const [userFilter] = useState<string>('')

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.audit.list.useInfiniteQuery(
    {
      limit: 100,
      ...(resourceFilter && { resource: resourceFilter }),
      ...(userFilter && { userId: userFilter }),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const logs = data?.pages.flatMap((page) => page.logs) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audyt systemu</h1>
        <p className="mt-2 text-sm text-gray-700">
          Historia działań użytkowników w systemie
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtry:</span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resource" className="sr-only">
                Zasób
              </label>
              <select
                id="resource"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Wszystkie zasoby</option>
                <option value="AccessRequest">Wnioski o dostęp</option>
                <option value="User">Użytkownicy</option>
                <option value="Organization">Podmioty</option>
                <option value="Case">Sprawy</option>
                <option value="Bulletin">Komunikaty</option>
                <option value="Report">Sprawozdania</option>
                <option value="LibraryFile">Biblioteka</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Brak wyników spełniających kryteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data i czas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Użytkownik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zasób
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Szczegóły
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {new Date(log.createdAt).toLocaleString('pl-PL')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {log.user?.name || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.action === 'CREATE'
                            ? 'bg-green-100 text-green-800'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'DELETE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {log.resource}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                      {log.details || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => fetchNextPage()}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Załaduj więcej
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Wszystkie wpisy</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{logs.length}+</div>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Aktywni użytkownicy (dziś)</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {new Set(
              logs
                .filter(
                  (log) =>
                    new Date(log.createdAt).toDateString() === new Date().toDateString()
                )
                .map((log) => log.userId)
            ).size}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Akcje dziś</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {
              logs.filter(
                (log) =>
                  new Date(log.createdAt).toDateString() === new Date().toDateString()
              ).length
            }
          </div>
        </div>
      </div>
    </div>
  )
}
