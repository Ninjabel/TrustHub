'use client'

import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { Building2, ArrowLeft, Save } from 'lucide-react'
import { OrganizationStatus } from '@prisma/client'
import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'
import { toast } from 'sonner'
import { useState } from 'react'

export default function EntityEditPage() {
  const params = useParams()
  const entityId = params.id as string
  const { navigateTo } = useTabNavigation()
  const [isSaving, setIsSaving] = useState(false)

  const { data: entity, isLoading } = trpc.entities.getById.useQuery({ id: entityId })

  const updateMutation = trpc.entities.update.useMutation({
    onSuccess: () => {
      // Clear saving state and navigate to view
      setIsSaving(false)
  toast.success('Dane podmiotu zostały zaktualizowane')
  navigateTo(`/dashboard/entities/${entityId}/view`)
    },
    onError: (error) => {
      // Ensure saving state is cleared
      setIsSaving(false)

      // Try to detect common Prisma unique constraint error for uknfCode
      const message = (error as { message?: string })?.message ?? String(error)
      console.error(error)

      if (typeof message === 'string' && message.includes('Unique constraint failed') && message.includes('uknfCode')) {
        toast.error('Kod UKNF jest już używany przez inny podmiot. Wprowadź unikalny kod.')
        return
      }

      // Fallback generic message
      toast.error('Błąd podczas aktualizacji danych')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!entity) return

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    updateMutation.mutate({
      id: entity.id,
      name: formData.get('name') as string,
      uknfCode: formData.get('uknfCode') as string || undefined,
      status: formData.get('status') as OrganizationStatus,
    })
  }

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
              onClick={() => navigateTo(`/dashboard/entities/${entity.id}/view`)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Edycja: {entity.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Edytuj dane podmiotu</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nazwa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={entity.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="uknfCode" className="block text-sm font-medium text-gray-700">
                Kod UKNF
              </label>
              <input
                type="text"
                id="uknfCode"
                name="uknfCode"
                defaultValue={entity.uknfCode || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={entity.status}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="ACTIVE">Aktywny</option>
                <option value="SUSPENDED">Zawieszony</option>
                <option value="INACTIVE">Nieaktywny</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Uwaga:</strong> Zmiana danych podmiotu zostanie zapisana w dzienniku audytu.
                Bardziej zaawansowane zmiany (adres, dane rejestrowe) wymagają pełnego formularza edycji.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => navigateTo(`/dashboard/entities/${entity.id}/view`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
