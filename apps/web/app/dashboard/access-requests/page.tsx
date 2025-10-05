'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'

interface AccessRequest {
  id: string
  entityName: string
  requestType: string
  status: string
  requestedBy: string
  requestedAt: Date
  processedBy?: string
  processedAt?: Date
}

export default function AccessRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Mock data - replace with real tRPC query
  const mockData: AccessRequest[] = [
    {
      id: '1',
      entityName: 'Bank Przykładowy S.A.',
      requestType: 'Dostęp do raportowania',
      status: 'PENDING',
      requestedBy: 'admin@bank-przykladowy.test',
      requestedAt: new Date('2025-03-15'),
    },
    {
      id: '2',
      entityName: 'Instytucja Finansowa XYZ',
      requestType: 'Rozszerzenie uprawnień',
      status: 'APPROVED',
      requestedBy: 'manager@xyz.test',
      requestedAt: new Date('2025-03-10'),
      processedBy: 'admin@uknf.test',
      processedAt: new Date('2025-03-11'),
    },
  ]

  const columns: Column<AccessRequest>[] = [
    {
      key: 'requestedAt',
      label: 'Data wniosku',
      sortable: true,
      render: (item) => new Date(item.requestedAt).toLocaleDateString('pl-PL'),
    },
    {
      key: 'entityName',
      label: 'Podmiot',
      sortable: true,
    },
    {
      key: 'requestType',
      label: 'Typ wniosku',
      sortable: true,
    },
    {
      key: 'requestedBy',
      label: 'Wnioskujący',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => {
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
        }
        const statusLabels = {
          PENDING: 'Oczekuje',
          APPROVED: 'Zatwierdzony',
          REJECTED: 'Odrzucony',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
            {statusLabels[item.status as keyof typeof statusLabels]}
          </span>
        )
      },
    },
  ]

  const filteredData = statusFilter === 'all' 
    ? mockData 
    : mockData.filter(item => item.status === statusFilter)

  return (
    <div className="flex flex-col min-h-full">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      <div className="flex-1 px-6 py-6">
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Wnioski o dostęp do systemu</h2>
            <p className="text-sm text-gray-600 mt-1">
              Zarządzanie wnioskami o dostęp do systemu komunikacji z podmiotami
            </p>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="PENDING">Oczekujące</option>
                <option value="APPROVED">Zatwierdzone</option>
                <option value="REJECTED">Odrzucone</option>
              </select>
            </div>
            
            <DataTable
              data={filteredData}
              columns={columns}
              searchPlaceholder="Szukaj wniosków..."
              onRowClick={(item) => {
                console.log('Selected request:', item)
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Anuluj
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-white bg-red-600 border border-red-600 rounded hover:bg-red-700">
              Odrzuć zaznaczone
            </button>
            <button className="px-4 py-2 text-sm text-white bg-green-600 border border-green-600 rounded hover:bg-green-700">
              Zatwierdź zaznaczone
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
