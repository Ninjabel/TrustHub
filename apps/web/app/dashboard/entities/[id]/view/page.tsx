'use client'

import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { Building2, MapPin, ArrowLeft } from 'lucide-react'
import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'

export default function EntityViewPage() {
  const params = useParams()
  const entityId = params.id as string
  const { navigateTo } = useTabNavigation()

  const { data: entity, isLoading } = trpc.entities.getById.useQuery({ id: entityId })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych podmiotu...</p>
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/dashboard/entities')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{entity.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Szczegóły podmiotu</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigateTo(`/dashboard/entities/${entity.id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Edytuj
          </button>
          <button
            onClick={() => navigateTo(`/dashboard/entities/${entity.id}/history`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Historia zmian
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Podstawowe informacje */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Podstawowe informacje</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500">Nazwa</dt>
                  <dd className="text-sm font-medium text-gray-900">{entity.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Kod UKNF</dt>
                  <dd className="text-sm font-mono text-gray-900">{entity.uknfCode || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">LEI</dt>
                  <dd className="text-sm font-mono text-gray-900">{entity.lei || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">NIP</dt>
                  <dd className="text-sm font-mono text-gray-900">{entity.nip || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">KRS</dt>
                  <dd className="text-sm font-mono text-gray-900">{entity.krs || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      entity.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      entity.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entity.status === 'ACTIVE' && 'Aktywny'}
                      {entity.status === 'SUSPENDED' && 'Zawieszony'}
                      {entity.status === 'INACTIVE' && 'Nieaktywny'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Klasyfikacja */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Klasyfikacja</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500">Typ</dt>
                  <dd className="text-sm text-gray-900">{entity.type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Kategoria</dt>
                  <dd className="text-sm text-gray-900">{entity.category || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Sektor</dt>
                  <dd className="text-sm text-gray-900">{entity.sector || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Podsektor</dt>
                  <dd className="text-sm text-gray-900">{entity.subsector || '-'}</dd>
                </div>
              </dl>
            </div>

            {/* Adres i kontakt */}
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Adres i kontakt</h4>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Adres
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {entity.street && entity.building ? (
                      <>
                        {entity.street} {entity.building}
                        {entity.apartment && `/${entity.apartment}`}
                        <br />
                        {entity.postalCode} {entity.city}
                      </>
                    ) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Kontakt</dt>
                  <dd className="text-sm text-gray-900 mt-1">Brak danych kontaktowych</dd>
                  <p className="text-xs text-gray-500 mt-2">Dane kontaktowe dostępne w pełnym profilu podmiotu</p>
                </div>
              </dl>
            </div>

            {/* Statystyki */}
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Statystyki</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-500">Sprawozdania</dt>
                  <dd className="text-2xl font-semibold text-gray-900 mt-1">{entity._count?.reports || 0}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-500">Sprawy</dt>
                  <dd className="text-2xl font-semibold text-gray-900 mt-1">{entity._count?.cases || 0}</dd>
                </div>
              </div>
            </div>

            {/* Daty */}
            <div className="col-span-2">
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-gray-500">Utworzono</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(entity.createdAt).toLocaleString('pl-PL')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Ostatnia aktualizacja</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(entity.updatedAt).toLocaleString('pl-PL')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
