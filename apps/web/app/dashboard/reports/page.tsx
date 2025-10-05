'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'
// SystemBreadcrumb removed; page uses heading instead
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, Clock } from 'lucide-react'

interface FinancialReport {
  id: string
  reportType: string
  period: string
  year: number
  quarter?: number
  organizationName: string
  submittedBy: string
  submittedAt: Date
  status: string
  validationErrors?: string
}

export default function ReportsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'profit-loss' | 'rip'>('profit-loss')
  
  // Mock data - replace with real tRPC query
  const mockReports: FinancialReport[] = [
    {
      id: '1',
      reportType: 'Rachunek zysków i strat',
      period: 'Q1',
      year: 2025,
      quarter: 1,
      organizationName: 'Bank Przykładowy S.A.',
      submittedBy: 'admin@bank-przykladowy.test',
      submittedAt: new Date('2025-03-20'),
      status: 'SUCCESS',
    },
    {
      id: '2',
      reportType: 'RIP100000_Q1_2025',
      period: 'Q1',
      year: 2025,
      quarter: 1,
      organizationName: 'Instytucja Finansowa XYZ',
      submittedBy: 'user@xyz.test',
      submittedAt: new Date('2025-03-18'),
      status: 'PROCESSING',
    },
    {
      id: '3',
      reportType: 'Rachunek zysków i strat',
      period: 'Q4',
      year: 2024,
      quarter: 4,
      organizationName: 'Bank Przykładowy S.A.',
      submittedBy: 'admin@bank-przykladowy.test',
      submittedAt: new Date('2025-01-15'),
      status: 'RULE_ERROR',
      validationErrors: 'Niezgodność sum kontrolnych w pozycji C (A-B)',
    },
  ]

  const columns: Column<FinancialReport>[] = [
    {
      key: 'submittedAt',
      label: 'Data przesłania',
      sortable: true,
      render: (item) => new Date(item.submittedAt).toLocaleDateString('pl-PL'),
    },
    {
      key: 'organizationName',
      label: 'Podmiot',
      sortable: true,
    },
    {
      key: 'reportType',
      label: 'Typ sprawozdania',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{item.reportType}</span>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Okres',
      sortable: true,
      render: (item) => `${item.period} ${item.year}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => {
        const statusConfig = {
          DRAFT: { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Szkic' },
          PROCESSING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Przetwarzanie' },
          SUCCESS: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Zatwierdzony' },
          RULE_ERROR: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Błąd walidacji' },
          SYSTEM_ERROR: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Błąd systemu' },
        }
        const config = statusConfig[item.status as keyof typeof statusConfig]
        const Icon = config.icon
        
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="h-4 w-4" />
            <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* SystemBreadcrumb removed - heading below serves as context */}

      <div className="flex-1 px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded border border-gray-300 p-4">
            <div className="text-xs text-gray-600 mb-1">Wysłane w tym roku</div>
            <div className="text-2xl font-bold text-gray-900">12</div>
          </div>
          <div className="bg-white rounded border border-gray-300 p-4">
            <div className="text-xs text-gray-600 mb-1">Zatwierdzone</div>
            <div className="text-2xl font-bold text-green-600">10</div>
          </div>
          <div className="bg-white rounded border border-gray-300 p-4">
            <div className="text-xs text-gray-600 mb-1">W trakcie przetwarzania</div>
            <div className="text-2xl font-bold text-yellow-600">1</div>
          </div>
          <div className="bg-white rounded border border-gray-300 p-4">
            <div className="text-xs text-gray-600 mb-1">Z błędami</div>
            <div className="text-2xl font-bold text-red-600">1</div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Sprawozdania finansowe</h2>
            <p className="text-sm text-gray-600 mt-1">
              Przesyłanie rachunków zysków i strat oraz formularzy RIP
            </p>
          </div>
          
          <div className="px-6 py-4">
            <DataTable
              data={mockReports}
              columns={columns}
              searchPlaceholder="Szukaj sprawozdań..."
              onRowClick={(item) => {
                console.log('Selected report:', item)
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Szablon Excel (wariant kalkulacyjny)
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Prześlij sprawozdanie
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Prześlij sprawozdanie finansowe</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ sprawozdania
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUploadType('profit-loss')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        uploadType === 'profit-loss'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Rachunek zysków i strat</div>
                      <div className="text-xs text-gray-600 mt-1">Wariant kalkulacyjny</div>
                    </button>
                    <button
                      onClick={() => setUploadType('rip')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        uploadType === 'rip'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Formularze RIP</div>
                      <div className="text-xs text-gray-600 mt-1">Raportowanie kwartalne</div>
                    </button>
                  </div>
                </div>

                {/* Period Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rok
                    </label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Okres
                    </label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      <option value="Q1">Q1 (styczeń-marzec)</option>
                      <option value="Q2">Q2 (kwiecień-czerwiec)</option>
                      <option value="Q3">Q3 (lipiec-wrzesień)</option>
                      <option value="Q4">Q4 (październik-grudzień)</option>
                      <option value="ANNUAL">Roczne</option>
                    </select>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plik sprawozdania (Excel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Przeciągnij plik Excel tutaj lub kliknij aby wybrać
                    </p>
                    <p className="text-xs text-gray-500">
                      Akceptowane formaty: .xlsx, .xls (max 10 MB)
                    </p>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls"
                      className="hidden" 
                    />
                    <button className="mt-3 px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                      Wybierz plik
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Wskazówki dotyczące przesyłania:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Użyj oficjalnego szablonu Excel (wariant kalkulacyjny)</li>
                    <li>Sprawdź poprawność sum kontrolnych (np. C = A - B)</li>
                    <li>Upewnij się, że wszystkie wymagane pozycje są wypełnione</li>
                    <li>System automatycznie zwaliduje dane po przesłaniu</li>
                  </ul>
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
                  Prześlij i waliduj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

