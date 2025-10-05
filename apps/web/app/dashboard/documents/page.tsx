'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'
// SystemBreadcrumb removed; page uses heading instead
import { Upload, FileText, Send } from 'lucide-react'

interface DocumentBatch {
  id: string
  title: string
  documentType: string
  recipientCount: number
  sentBy: string
  sentAt: Date
  status: string
  priority: string
}

export default function DocumentsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Mock data
  const mockData: DocumentBatch[] = [
    {
      id: '1',
      title: 'Komunikat o zmianach w raportowaniu Q1 2025',
      documentType: 'Komunikat',
      recipientCount: 45,
      sentBy: 'Jan Kowalski',
      sentAt: new Date('2025-03-15'),
      status: 'SENT',
      priority: 'HIGH',
    },
    {
      id: '2',
      title: 'Instrukcja wypełniania formularzy RIP',
      documentType: 'Instrukcja',
      recipientCount: 120,
      sentBy: 'Anna Nowak',
      sentAt: new Date('2025-03-10'),
      status: 'SENT',
      priority: 'NORMAL',
    },
  ]

  const columns: Column<DocumentBatch>[] = [
    {
      key: 'sentAt',
      label: 'Data wysyłki',
      sortable: true,
      render: (item) => new Date(item.sentAt).toLocaleDateString('pl-PL'),
    },
    {
      key: 'title',
      label: 'Tytuł dokumentu',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span>{item.title}</span>
        </div>
      ),
    },
    {
      key: 'documentType',
      label: 'Typ',
      sortable: true,
    },
    {
      key: 'recipientCount',
      label: 'Liczba odbiorców',
      sortable: true,
      render: (item) => `${item.recipientCount} podmiotów`,
    },
    {
      key: 'sentBy',
      label: 'Wysłał',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priorytet',
      sortable: true,
      render: (item) => {
        const colors = {
          LOW: 'bg-gray-100 text-gray-800',
          NORMAL: 'bg-blue-100 text-blue-800',
          HIGH: 'bg-red-100 text-red-800',
        }
        const labels = {
          LOW: 'Niski',
          NORMAL: 'Normalny',
          HIGH: 'Wysoki',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[item.priority as keyof typeof colors]}`}>
            {labels[item.priority as keyof typeof labels]}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_item) => ( // eslint-disable-line @typescript-eslint/no-unused-vars
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          Wysłano
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      {/* Breadcrumbs removed - TabNavigation in layout is used for tabs */}

      <div className="flex-1 px-6 py-6">
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Wysyłka dokumentów do podmiotów</h2>
            <p className="text-sm text-gray-600 mt-1">
              Masowa wysyłka dokumentów, komunikatów i instrukcji do podmiotów nadzorowanych
            </p>
          </div>
          
          <div className="px-6 py-4">
            <DataTable
              data={mockData}
              columns={columns}
              searchPlaceholder="Szukaj wysłanych dokumentów..."
              onRowClick={(item) => {
                console.log('Selected document batch:', item)
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Historia wysyłek
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Nowa wysyłka dokumentów
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nowa wysyłka dokumentów</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł wysyłki
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="np. Komunikat o zmianach w raportowaniu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ dokumentu
                  </label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option>Komunikat</option>
                    <option>Instrukcja</option>
                    <option>Formularz</option>
                    <option>Ogłoszenie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorytet
                  </label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="NORMAL">Normalny</option>
                    <option value="HIGH">Wysoki</option>
                    <option value="LOW">Niski</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plik dokumentu
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Przeciągnij plik tutaj lub kliknij aby wybrać
                    </p>
                    <input type="file" className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odbiorcy
                  </label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option>Wszystkie podmioty</option>
                    <option>Banki</option>
                    <option>Instytucje finansowe</option>
                    <option>Wybrane podmioty...</option>
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700">
                  Wyślij dokumenty
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
