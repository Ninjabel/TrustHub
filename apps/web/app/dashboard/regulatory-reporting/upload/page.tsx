'use client'

import { useState } from 'react'
// SystemBreadcrumb removed; page uses heading instead
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Upload Regulatory Report Page
 * 
 * Features:
 * - Upload pliku XLSX
 * - Formularz metadanych (typ, okres)
 * - Walidacja po stronie klienta
 * - Podłączenie do tRPC create mutation
 */

type RegulatoryReportType =
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'AD_HOC'

export default function UploadReportPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reportType, setReportType] = useState<RegulatoryReportType>('QUARTERLY')
  const [period, setPeriod] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock organizationId - w produkcji pobierz z session/context
  const _organizationId = 'org-123' // eslint-disable-line @typescript-eslint/no-unused-vars
  const organizationName = 'Bank Przykładowy S.A.'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls')
      ) {
        setError('Tylko pliki Excel (.xlsx, .xls) są dozwolone')
        return
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Plik jest zbyt duży. Maksymalny rozmiar to 50MB')
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError('Proszę wybrać plik')
      return
    }

    if (!period) {
      setError('Proszę podać okres sprawozdania')
      return
    }

    setIsUploading(true)

    try {
      // W produkcji:
      // 1. Upload pliku do S3/storage
      // 2. Wywołaj trpc.regulatoryReports.create.mutate()
      // 3. Przekieruj do szczegółów sprawozdania

      // Mock upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Symuluj sukces
      alert(
        `Sprawozdanie przesłane!\nPlik: ${selectedFile.name}\nTyp: ${reportType}\nOkres: ${period}`
      )

      // Przekieruj do listy
      router.push('/dashboard/regulatory-reporting')
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Błąd podczas przesyłania pliku. Spróbuj ponownie.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Prześlij nowe sprawozdanie
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Wybierz plik XLSX i podaj informacje o sprawozdaniu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dane sprawozdania
                </h2>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Organization Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Sprawozdanie dla:
                  </p>
                  <p className="text-base font-semibold text-blue-700 mt-1">
                    {organizationName}
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plik sprawozdania <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {!selectedFile ? (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Wybierz plik</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">lub przeciągnij tutaj</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            XLSX, XLS do 50MB
                          </p>
                        </>
                      ) : (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="h-8 w-8 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div>
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)}{' '}
                                MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Usuń plik
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ sprawozdania <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) =>
                      setReportType(e.target.value as RegulatoryReportType)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="QUARTERLY">Kwartalne</option>
                    <option value="ANNUAL">Roczne</option>
                    <option value="AD_HOC">Ad-hoc</option>
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okres sprawozdania <span className="text-red-500">*</span>
                  </label>
                  {reportType === 'QUARTERLY' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={period.split(' ')[0] || ''}
                        onChange={(e) => {
                          const quarter = e.target.value
                          const year = period.split(' ')[1] || new Date().getFullYear()
                          setPeriod(`${quarter} ${year}`)
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Wybierz kwartał</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                      <select
                        value={period.split(' ')[1] || ''}
                        onChange={(e) => {
                          const quarter = period.split(' ')[0] || 'Q1'
                          const year = e.target.value
                          setPeriod(`${quarter} ${year}`)
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Wybierz rok</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                  ) : (
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Wybierz rok</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  )}
                  {period && (
                    <p className="mt-1 text-sm text-gray-500">
                      Okres: <strong>{period}</strong>
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-300 bg-gray-50 flex justify-between">
                <Link
                  href="/dashboard/regulatory-reporting"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Anuluj
                </Link>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile || !period}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Przesyłanie...' : 'Prześlij sprawozdanie'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Info */}
          <div className="space-y-6">
            {/* Guidelines */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">
                  Wytyczne
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Format pliku
                  </h3>
                  <p className="text-gray-600">
                    Akceptowane formaty: .xlsx, .xls
                    <br />
                    Maksymalny rozmiar: 50 MB
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Szablon</h3>
                  <p className="text-gray-600 mb-2">
                    Użyj oficjalnego szablonu dostępnego w Bibliotece
                  </p>
                  <Link
                    href="/dashboard/library"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Pobierz szablon →
                  </Link>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Walidacja</h3>
                  <p className="text-gray-600">
                    Po przesłaniu plik przejdzie automatyczną walidację.
                    Otrzymasz raport z wynikami w ciągu kilku minut.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Korekty</h3>
                  <p className="text-gray-600">
                    W przypadku błędów możesz przesłać korektę sprawozdania.
                  </p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Potrzebujesz pomocy?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Sprawdź dokumentację lub skontaktuj się z pomocą techniczną
              </p>
              <div className="space-y-2">
                <Link
                  href="/dashboard/faq"
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  FAQ →
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Wyślij wiadomość →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
