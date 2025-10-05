'use client'

import { use } from 'react'
// SystemBreadcrumb removed; page uses heading instead
import Link from 'next/link'

/**
 * Regulatory Report Details Page
 * 
 * Features:
 * - Pełne metadane sprawozdania
 * - Historia statusów (timeline)
 * - Lista korekt (źródło ↔ korekty)
 * - Wątki komunikacji
 * - Download raportu walidacji
 * - Akcje: Prześlij korektę, Usuń (draft)
 */

type RegulatoryReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'RULE_ERROR'
  | 'SYSTEM_ERROR'
  | 'TIMEOUT_ERROR'
  | 'REJECTED_BY_UKNF'

interface StatusHistoryItem {
  id: string
  status: RegulatoryReportStatus
  note?: string
  createdAt: Date
  changedByName?: string
}

interface Comment {
  id: string
  userName: string
  userRole: string
  comment: string
  createdAt: Date
}

interface Correction {
  id: string
  fileName: string
  period: string
  submittedAt: Date
  status: RegulatoryReportStatus
  submittedByName: string
}

interface ReportDetails {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  entityCode: string
  entityName: string
  period: string
  reportType: string
  status: RegulatoryReportStatus
  validatedAt?: Date | null
  validationReportUrl?: string | null
  validationNotes?: string | null
  submittedAt: Date
  submittedByName: string
  submittedByEmail: string
  isCorrection: boolean
  correctedReport?: Correction | null
  corrections: Correction[]
  isArchived: boolean
  statusHistory: StatusHistoryItem[]
  comments: Comment[]
}

export default function RegulatoryReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // Mock data - w produkcji użyj trpc.regulatoryReports.getById.useQuery({ id })
  const report: ReportDetails = {
    id,
    fileName: 'RIP_Q1_2025_Bank_Przykladowy.xlsx',
    fileUrl: '/storage/reports/rip_q1_2025_bank_przykladowy.xlsx',
    fileSize: 1234567,
    entityCode: 'PL1234567890',
    entityName: 'Bank Przykładowy S.A.',
    period: 'Q1 2025',
    reportType: 'QUARTERLY',
    status: 'SUCCESS',
    validatedAt: new Date('2025-04-16T10:30:00'),
    validationReportUrl: '/storage/validation/report_1_validation.pdf',
    validationNotes: 'Walidacja zakończona pomyślnie. Wszystkie kontrole przeszły pozytywnie.',
    submittedAt: new Date('2025-04-15T14:20:00'),
    submittedByName: 'Zofia Księgowa',
    submittedByEmail: 'user@bank-przykladowy.test',
    isCorrection: false,
    correctedReport: null,
    corrections: [],
    isArchived: false,
    statusHistory: [
      {
        id: '1',
        status: 'DRAFT',
        note: 'Sprawozdanie utworzone',
        createdAt: new Date('2025-04-15T14:20:00'),
        changedByName: 'Zofia Księgowa',
      },
      {
        id: '2',
        status: 'SUBMITTED',
        note: 'Przesłane do walidacji',
        createdAt: new Date('2025-04-15T14:25:00'),
        changedByName: 'Zofia Księgowa',
      },
      {
        id: '3',
        status: 'IN_PROGRESS',
        note: 'Rozpoczęto proces walidacji automatycznej',
        createdAt: new Date('2025-04-15T14:26:00'),
      },
      {
        id: '4',
        status: 'SUCCESS',
        note: 'Walidacja zakończona pozytywnie',
        createdAt: new Date('2025-04-16T10:30:00'),
        changedByName: 'Anna Nowak',
      },
    ],
    comments: [
      {
        id: '1',
        userName: 'Anna Nowak',
        userRole: 'UKNF_EMPLOYEE',
        comment:
          'Sprawozdanie przyjęte do dalszego przetwarzania. Wszystkie dane poprawne.',
        createdAt: new Date('2025-04-16T10:35:00'),
      },
    ],
  }

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

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {report.fileName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              ID sprawozdania: {report.id}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={report.fileUrl}
              download
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Pobierz plik
            </a>
            {report.validationReportUrl && (
              <a
                href={report.validationReportUrl}
                download
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-600 rounded hover:bg-blue-100"
              >
                Pobierz raport walidacji
              </a>
            )}
            {report.status !== 'DRAFT' && (
              <Link
                href={`/dashboard/regulatory-reporting/correction/${report.id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded hover:bg-orange-700"
              >
                Prześlij korektę
              </Link>
            )}
            {report.status === 'DRAFT' && (
              <button
                onClick={() => {
                  if (confirm('Czy na pewno chcesz usunąć ten roboczy raport?')) {
                    alert('Usuwanie...')
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded hover:bg-red-50"
              >
                Usuń
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Metadane sprawozdania
                </h2>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Kod podmiotu
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.entityCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Nazwa podmiotu
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.entityName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Okres</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.period}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Typ sprawozdania
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.reportType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Data przesłania
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.submittedAt.toLocaleString('pl-PL')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Rozmiar pliku
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatFileSize(report.fileSize)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Przesłane przez
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div>{report.submittedByName}</div>
                      <div className="text-xs text-gray-500">
                        {report.submittedByEmail}
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </dd>
                  </div>
                  {report.validatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Data walidacji
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {report.validatedAt.toLocaleString('pl-PL')}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Korekta
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.isCorrection ? 'TAK' : 'NIE'}
                    </dd>
                  </div>
                </dl>

                {report.validationNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">
                      Uwagi walidacyjne
                    </dt>
                    <dd className="mt-2 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {report.validationNotes}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Historia statusów
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {report.statusHistory.map((item, idx) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {idx !== report.statusHistory.length - 1 && (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusBadgeClass(
                                  item.status
                                )}`}
                              >
                                {idx + 1}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getStatusLabel(item.status)}
                                </p>
                                {item.note && (
                                  <p className="mt-0.5 text-sm text-gray-500">
                                    {item.note}
                                  </p>
                                )}
                                {item.changedByName && (
                                  <p className="mt-0.5 text-xs text-gray-400">
                                    Zmienił: {item.changedByName}
                                  </p>
                                )}
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={item.createdAt.toISOString()}>
                                  {item.createdAt.toLocaleString('pl-PL')}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Comments/Communication */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Wątki komunikacji
                </h2>
              </div>
              <div className="px-6 py-4">
                {report.comments.length > 0 ? (
                  <div className="space-y-4">
                    {report.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-sm text-gray-900">
                              {comment.userName}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({comment.userRole})
                            </span>
                          </div>
                          <time className="text-xs text-gray-500">
                            {comment.createdAt.toLocaleString('pl-PL')}
                          </time>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Brak komentarzy</p>
                )}

                <div className="mt-4">
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Dodaj komentarz..."
                  />
                  <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                    Dodaj komentarz
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Corrections */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">Korekty</h2>
              </div>
              <div className="px-6 py-4">
                {report.correctedReport && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Korekta dla:
                    </p>
                    <Link
                      href={`/dashboard/regulatory-reporting/${report.correctedReport.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {report.correctedReport.fileName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {report.correctedReport.submittedAt.toLocaleDateString(
                        'pl-PL'
                      )}
                    </p>
                  </div>
                )}

                {report.corrections.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Historia korekt:
                    </p>
                    <ul className="space-y-2">
                      {report.corrections.map((correction) => (
                        <li key={correction.id}>
                          <Link
                            href={`/dashboard/regulatory-reporting/${correction.id}`}
                            className="block p-3 bg-gray-50 rounded hover:bg-gray-100"
                          >
                            <div className="text-sm text-blue-600 hover:text-blue-800">
                              {correction.fileName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {correction.submittedAt.toLocaleDateString(
                                'pl-PL'
                              )}{' '}
                              • {getStatusLabel(correction.status)}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  !report.correctedReport && (
                    <p className="text-sm text-gray-500">Brak korekt</p>
                  )
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Szybkie akcje
                </h2>
              </div>
              <div className="px-6 py-4 space-y-2">
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Eksportuj metadane
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Historia zmian
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Log audytowy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
