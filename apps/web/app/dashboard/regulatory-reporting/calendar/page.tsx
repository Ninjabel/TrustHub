'use client'

import { useState } from 'react'
// SystemBreadcrumb removed; page uses heading instead
import Link from 'next/link'

/**
 * Reporting Calendar Page
 * 
 * Features:
 * - Lista terminów sprawozdawczych
 * - Wskaźnik kompletności (ile podmiotów złożyło)
 * - Monity o zbliżających się terminach
 * - Filtry po roku i typie
 */

type RegulatoryReportType =
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'AD_HOC'
  | 'CORRECTION'

interface CalendarItem {
  id: string
  period: string
  reportType: RegulatoryReportType
  dueDate: Date
  description?: string
  isActive: boolean
  completionRate: number
  totalOrganizations: number
  submittedReports: number
}

export default function ReportingCalendarPage() {
  const [yearFilter, setYearFilter] = useState('2025')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Mock data - w produkcji użyj trpc.regulatoryReports.getCalendar.useQuery()
  const mockCalendar: CalendarItem[] = [
    {
      id: '1',
      period: 'Q1 2025',
      reportType: 'QUARTERLY',
      dueDate: new Date('2025-04-30'),
      description: 'Sprawozdanie kwartalne za I kwartał 2025',
      isActive: true,
      completionRate: 75.5,
      totalOrganizations: 150,
      submittedReports: 113,
    },
    {
      id: '2',
      period: 'Q2 2025',
      reportType: 'QUARTERLY',
      dueDate: new Date('2025-07-31'),
      description: 'Sprawozdanie kwartalne za II kwartał 2025',
      isActive: true,
      completionRate: 0,
      totalOrganizations: 150,
      submittedReports: 0,
    },
    {
      id: '3',
      period: 'Q3 2025',
      reportType: 'QUARTERLY',
      dueDate: new Date('2025-10-31'),
      description: 'Sprawozdanie kwartalne za III kwartał 2025',
      isActive: true,
      completionRate: 0,
      totalOrganizations: 150,
      submittedReports: 0,
    },
    {
      id: '4',
      period: '2024',
      reportType: 'ANNUAL',
      dueDate: new Date('2025-03-31'),
      description: 'Sprawozdanie roczne za rok 2024',
      isActive: true,
      completionRate: 95.3,
      totalOrganizations: 150,
      submittedReports: 143,
    },
    {
      id: '5',
      period: '2025',
      reportType: 'ANNUAL',
      dueDate: new Date('2026-03-31'),
      description: 'Sprawozdanie roczne za rok 2025',
      isActive: true,
      completionRate: 0,
      totalOrganizations: 150,
      submittedReports: 0,
    },
  ]

  const getTypeLabel = (type: RegulatoryReportType) => {
    const labels = {
      QUARTERLY: 'Kwartalne',
      ANNUAL: 'Roczne',
      AD_HOC: 'Ad-hoc',
      CORRECTION: 'Korekta',
    }
    return labels[type] || type
  }

  const getTypeBadgeClass = (type: RegulatoryReportType) => {
    const classes = {
      QUARTERLY: 'bg-blue-100 text-blue-800',
      ANNUAL: 'bg-purple-100 text-purple-800',
      AD_HOC: 'bg-yellow-100 text-yellow-800',
      CORRECTION: 'bg-orange-100 text-orange-800',
    }
    return classes[type] || 'bg-gray-100 text-gray-800'
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diff = dueDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const getUrgencyClass = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-600 font-semibold' // Przeterminowane
    if (daysUntil <= 7) return 'text-orange-600 font-semibold' // Mniej niż tydzień
    if (daysUntil <= 30) return 'text-yellow-600' // Mniej niż miesiąc
    return 'text-gray-700'
  }

  const getCompletionBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500'
    if (rate >= 70) return 'bg-blue-500'
    if (rate >= 50) return 'bg-yellow-500'
    if (rate > 0) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  const filteredCalendar = mockCalendar.filter((item) => {
    const itemYear = item.dueDate.getFullYear().toString()
    if (yearFilter !== 'all' && itemYear !== yearFilter) return false
    if (typeFilter !== 'all' && item.reportType !== typeFilter) return false
    return item.isActive
  })

  // Upcoming deadlines (next 30 days)
  const upcomingDeadlines = filteredCalendar
    .filter((item) => {
      const days = getDaysUntilDue(item.dueDate)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return (
    <div className="flex flex-col min-h-screen">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      {/* Breadcrumbs removed - TabNavigation in layout is used for tabs */}

      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Kalendarz sprawozdawczy
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Przegląd terminów i kompletności sprawozdań regulacyjnych
          </p>
        </div>

        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Zbliżające się terminy
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {upcomingDeadlines.map((item) => (
                      <li key={item.id}>
                        <strong>{item.period}</strong> (
                        {getTypeLabel(item.reportType)}) -{' '}
                        {item.dueDate.toLocaleDateString('pl-PL')} (
                        {getDaysUntilDue(item.dueDate)} dni) - Kompletność:{' '}
                        {item.completionRate.toFixed(1)}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Aktywne terminy
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {mockCalendar.filter((c) => c.isActive).length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Średnia kompletność
            </div>
            <div className="mt-1 text-2xl font-semibold text-blue-600">
              {(
                mockCalendar.reduce((sum, c) => sum + c.completionRate, 0) /
                mockCalendar.length
              ).toFixed(1)}
              %
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Zbliżające się (30 dni)
            </div>
            <div className="mt-1 text-2xl font-semibold text-orange-600">
              {upcomingDeadlines.length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Całkowita liczba podmiotów
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {mockCalendar[0]?.totalOrganizations || 0}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">
              Terminy sprawozdawcze
            </h2>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rok
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ sprawozdania
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="QUARTERLY">Kwartalne</option>
                  <option value="ANNUAL">Roczne</option>
                  <option value="AD_HOC">Ad-hoc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar List */}
          <div className="divide-y divide-gray-200">
            {filteredCalendar.map((item) => {
              const daysUntil = getDaysUntilDue(item.dueDate)
              const isOverdue = daysUntil < 0

              return (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.period}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(
                            item.reportType
                          )}`}
                        >
                          {getTypeLabel(item.reportType)}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Przeterminowane
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Termin: </span>
                          <span className={getUrgencyClass(daysUntil)}>
                            {item.dueDate.toLocaleDateString('pl-PL')}
                            {!isOverdue && ` (za ${daysUntil} dni)`}
                            {isOverdue && ` (${Math.abs(daysUntil)} dni temu)`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Złożonych: </span>
                          <span className="font-medium">
                            {item.submittedReports} / {item.totalOrganizations}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 w-48">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          Kompletność
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCompletionBarColor(
                            item.completionRate
                          )}`}
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredCalendar.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                Brak terminów sprawozdawczych dla wybranych filtrów
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/dashboard/regulatory-reporting"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Powrót do listy sprawozdań
          </Link>
          <button
            onClick={() => alert('Eksport kalendarza')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Eksportuj kalendarz
          </button>
        </div>
      </div>
    </div>
  )
}
