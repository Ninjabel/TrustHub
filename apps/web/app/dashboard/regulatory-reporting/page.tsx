'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'
// SystemBreadcrumb removed; page uses heading instead
import Link from 'next/link'

/**
 * Regulatory Reporting Module - Lista sprawozdań
 * 
 * Features:
 * - Lista wszystkich sprawozdań z filtrowaniem
 * - Export do XLSX/CSV/JSON
 * - Podgląd szczegółów
 * - Przesyłanie nowych sprawozdań
 * - Korekty sprawozdań
 * - Role-based access control
 */

// Typy zgodne z Prisma schema
type RegulatoryReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'RULE_ERROR'
  | 'SYSTEM_ERROR'
  | 'TIMEOUT_ERROR'
  | 'REJECTED_BY_UKNF'

type RegulatoryReportType =
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'AD_HOC'
  | 'CORRECTION'

interface RegulatoryReportListItem {
  id: string
  fileName: string
  entityCode: string
  entityName: string
  period: string
  reportType: RegulatoryReportType
  submittedAt: Date
  status: RegulatoryReportStatus
  validatedAt?: Date | null
  submittedByName: string
  submittedByEmail: string
  isCorrection: boolean
  isArchived: boolean
  validationNotes?: string | null
  correctionCount?: number
}

export default function RegulatoryReportingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - w produkcji użyj trpc.regulatoryReports.list.useQuery()
  const mockData: RegulatoryReportListItem[] = [
    {
      id: '1',
      fileName: 'RIP_Q1_2025_Bank_Przykladowy.xlsx',
      entityCode: 'PL1234567890',
      entityName: 'Bank Przykładowy S.A.',
      period: 'Q1 2025',
      reportType: 'QUARTERLY',
      submittedAt: new Date('2025-04-15'),
      status: 'SUCCESS',
      validatedAt: new Date('2025-04-16'),
      submittedByName: 'Zofia Księgowa',
      submittedByEmail: 'user@bank-przykladowy.test',
      isCorrection: false,
      isArchived: false,
      correctionCount: 0,
    },
    {
      id: '2',
      fileName: 'Roczne_2024_PKO_BP.xlsx',
      entityCode: 'PL9876543210',
      entityName: 'PKO Bank Polski S.A.',
      period: '2024',
      reportType: 'ANNUAL',
      submittedAt: new Date('2025-03-28'),
      status: 'IN_PROGRESS',
      validatedAt: null,
      submittedByName: 'Robert Kowalczyk',
      submittedByEmail: 'admin@pko.test',
      isCorrection: false,
      isArchived: false,
      correctionCount: 0,
    },
    {
      id: '3',
      fileName: 'RIP_Q4_2024_mBank_Korekta.xlsx',
      entityCode: 'PL5555555555',
      entityName: 'mBank S.A.',
      period: 'Q4 2024',
      reportType: 'QUARTERLY',
      submittedAt: new Date('2025-02-10'),
      status: 'RULE_ERROR',
      validatedAt: new Date('2025-02-11'),
      submittedByName: 'Agnieszka Raport',
      submittedByEmail: 'reporting@mbank.test',
      isCorrection: true,
      isArchived: false,
      validationNotes: 'Błąd w pozycji A.1.2 - niezgodność sum kontrolnych',
      correctionCount: 1,
    },
  ]

  const getStatusLabel = (status: RegulatoryReportStatus) => {
    const labels = {
      DRAFT: 'Roboczy',
      SUBMITTED: 'Przekazany',
      IN_PROGRESS: 'W trakcie',
      SUCCESS: 'Zakończony sukcesem',
      RULE_ERROR: 'Błędy walidacji',
      SYSTEM_ERROR: 'Błąd techniczny',
      TIMEOUT_ERROR: 'Przekroczono czas',
      REJECTED_BY_UKNF: 'Zakwestionowane',
    }
    return labels[status] || status
  }

  const getStatusBadgeClass = (status: RegulatoryReportStatus) => {
    const classes = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      SUCCESS: 'bg-green-100 text-green-800',
      RULE_ERROR: 'bg-red-100 text-red-800',
      SYSTEM_ERROR: 'bg-orange-100 text-orange-800',
      TIMEOUT_ERROR: 'bg-orange-100 text-orange-800',
      REJECTED_BY_UKNF: 'bg-purple-100 text-purple-800',
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: RegulatoryReportType) => {
    const labels = {
      QUARTERLY: 'Kwartalne',
      ANNUAL: 'Roczne',
      AD_HOC: 'Ad-hoc',
      CORRECTION: 'Korekta',
    }
    return labels[type] || type
  }

  const columns: Column<RegulatoryReportListItem>[] = [
    {
      key: 'fileName',
      label: 'Nazwa pliku',
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/regulatory-reporting/${item.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {item.fileName}
        </Link>
      ),
    },
    {
      key: 'entityCode',
      label: 'Kod podmiotu',
      sortable: true,
    },
    {
      key: 'entityName',
      label: 'Podmiot',
      sortable: true,
    },
    {
      key: 'period',
      label: 'Okres',
      sortable: true,
    },
    {
      key: 'reportType',
      label: 'Typ',
      sortable: true,
      render: (item) => (
        <span className="text-sm">{getTypeLabel(item.reportType)}</span>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Data przesłania',
      sortable: true,
      render: (item) => new Date(item.submittedAt).toLocaleDateString('pl-PL'),
    },
    {
      key: 'status',
      label: 'Status walidacji',
      sortable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
            item.status
          )}`}
        >
          {getStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'validatedAt',
      label: 'Data walidacji',
      sortable: true,
      render: (item) =>
        item.validatedAt
          ? new Date(item.validatedAt).toLocaleDateString('pl-PL')
          : '—',
    },
    {
      key: 'submittedByName',
      label: 'Złożył',
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium">{item.submittedByName}</div>
          <div className="text-gray-500 text-xs">{item.submittedByEmail}</div>
        </div>
      ),
    },
    {
      key: 'isCorrection',
      label: 'Korekta',
      render: (item) => (
        <span className="text-sm font-medium">
          {item.isCorrection ? 'TAK' : 'NIE'}
        </span>
      ),
    },
    {
      key: 'isArchived',
      label: 'Archiwalne',
      render: (item) => (
        <span className="text-sm">{item.isArchived ? 'TAK' : 'NIE'}</span>
      ),
    },
    {
      key: 'validationNotes',
      label: 'Uwagi/Błędy',
      render: (item) => (
        <div className="text-xs text-gray-600 max-w-xs truncate">
          {item.validationNotes || '—'}
        </div>
      ),
    },
  ]

  const filteredData = mockData.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (typeFilter !== 'all' && item.reportType !== typeFilter) return false
    if (!showArchived && item.isArchived) return false
    if (
      searchTerm &&
      !item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.entityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.entityCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="flex flex-col min-h-screen">
  {/* SystemBreadcrumb removed - heading below serves as context */}
      {/* Breadcrumbs removed - TabNavigation in layout is used for tabs */}

      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Moduł Sprawozdawczości
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Zarządzanie sprawozdaniami regulacyjnymi, walidacja, korekty i
            kalendarz sprawozdawczy
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Wszystkie sprawozdania
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {mockData.length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              W trakcie walidacji
            </div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">
              {mockData.filter((r) => r.status === 'IN_PROGRESS').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Zakończone sukcesem
            </div>
            <div className="mt-1 text-2xl font-semibold text-green-600">
              {mockData.filter((r) => r.status === 'SUCCESS').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Błędy walidacji
            </div>
            <div className="mt-1 text-2xl font-semibold text-red-600">
              {
                mockData.filter(
                  (r) =>
                    r.status === 'RULE_ERROR' ||
                    r.status === 'SYSTEM_ERROR' ||
                    r.status === 'TIMEOUT_ERROR' ||
                    r.status === 'REJECTED_BY_UKNF'
                ).length
              }
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista sprawozdań
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Przeglądaj, filtruj i zarządzaj sprawozdaniami regulacyjnymi
            </p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="DRAFT">Roboczy</option>
                  <option value="SUBMITTED">Przekazany</option>
                  <option value="IN_PROGRESS">W trakcie</option>
                  <option value="SUCCESS">Zakończony sukcesem</option>
                  <option value="RULE_ERROR">Błędy walidacji</option>
                  <option value="SYSTEM_ERROR">Błąd techniczny</option>
                  <option value="TIMEOUT_ERROR">Przekroczono czas</option>
                  <option value="REJECTED_BY_UKNF">Zakwestionowane</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ sprawozdania
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="QUARTERLY">Kwartalne</option>
                  <option value="ANNUAL">Roczne</option>
                  <option value="AD_HOC">Ad-hoc</option>
                  <option value="CORRECTION">Korekta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wyszukiwanie
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nazwa, kod, podmiot..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Pokaż archiwalne
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 py-4">
            <DataTable
              data={filteredData}
              columns={columns}
              searchPlaceholder="Szukaj w sprawozdaniach..."
              onRowClick={(item) => {
                window.location.href = `/dashboard/regulatory-reporting/${item.id}`
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href="/dashboard/regulatory-reporting/upload"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
            >
              + Prześlij sprawozdanie
            </Link>
            <Link
              href="/dashboard/regulatory-reporting/calendar"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              📅 Kalendarz sprawozdawczy
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Export do XLSX')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Eksportuj XLSX
            </button>
            <button
              onClick={() => alert('Export do CSV')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Eksportuj CSV
            </button>
            <button
              onClick={() => alert('Export do JSON')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Eksportuj JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
