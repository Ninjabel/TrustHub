'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Building2, Search, Plus, Eye, Edit, History } from 'lucide-react'
import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'
import type { Organization, OrganizationStatus } from '@prisma/client'

type EntityWithCounts = Organization & {
  _count: {
    memberships: number
    reports: number
    cases: number
  }
}

export default function EntitiesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { navigateTo } = useTabNavigation()

  const { data, isLoading } = trpc.entities.list.useQuery({
    limit: 100,
    status: statusFilter === 'all' ? undefined : statusFilter as OrganizationStatus,
  })

  const handleView = (entity: EntityWithCounts) => {
    navigateTo(`/dashboard/entities/${entity.id}/view`)
  }

  const handleEdit = (entity: EntityWithCounts) => {
    navigateTo(`/dashboard/entities/${entity.id}/edit`)
  }

  const handleHistory = (entity: EntityWithCounts) => {
    navigateTo(`/dashboard/entities/${entity.id}/history`)
  }

  const filteredEntities = data?.entities.filter((entity) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entity.name.toLowerCase().includes(query) ||
      entity.uknfCode?.toLowerCase().includes(query) ||
      entity.nip?.toLowerCase().includes(query) ||
      entity.krs?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Baza podmiotów</h1>
          <p className="mt-2 text-sm text-gray-700">
            Zarządzaj podmiotami nadzorowanymi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Dodaj podmiot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Wszystkie podmioty</dt>
                  <dd className="text-lg font-medium text-gray-900">{data?.entities.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Aktywne</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.entities.filter((e) => e.status === 'ACTIVE').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Zawieszone</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.entities.filter((e) => e.status === 'SUSPENDED').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Nieaktywne</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.entities.filter((e) => e.status === 'INACTIVE').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow sm:rounded-lg p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po nazwie, kodzie UKNF, NIP, KRS..."
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="ACTIVE">Aktywne</option>
            <option value="SUSPENDED">Zawieszone</option>
            <option value="INACTIVE">Nieaktywne</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista podmiotów
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod UKNF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sektor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data aktualizacji</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Ładowanie...
                    </td>
                  </tr>
                ) : filteredEntities?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Brak podmiotów
                    </td>
                  </tr>
                ) : (
                  filteredEntities?.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{entity.uknfCode || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                        {entity.lei && (
                          <div className="text-xs text-gray-500">LEI: {entity.lei}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entity.type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entity.sector || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            entity.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : entity.status === 'SUSPENDED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {entity.status === 'ACTIVE' && 'Aktywny'}
                          {entity.status === 'SUSPENDED' && 'Zawieszony'}
                          {entity.status === 'INACTIVE' && 'Nieaktywny'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entity.updatedAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleView(entity)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Podgląd
                          </button>
                          <button
                            onClick={() => handleEdit(entity)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleHistory(entity)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                          >
                            <History className="h-4 w-4" />
                            Historia
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
