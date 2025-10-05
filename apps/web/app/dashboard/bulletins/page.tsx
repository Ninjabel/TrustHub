'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'
// SystemBreadcrumb removed; page uses heading instead
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Bulletin {
  id: string
  title: string
  priority: string
  publishedAt: Date | null
  isRead: boolean
  requireReadReceipt: boolean
  readCount: number
  author: {
    name: string
  }
}

export default function BulletinsPage() {
  const [showUnreadOnly] = useState(false)
  
  const { data, isLoading } = trpc.bulletins.list.useQuery({
    unreadOnly: showUnreadOnly,
    limit: 50,
  })

  const markAsRead = trpc.bulletins.markAsRead.useMutation()

  const columns: Column<Bulletin>[] = [
    {
      key: 'publishedAt',
      label: 'Data publikacji',
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {item.publishedAt ? format(new Date(item.publishedAt), 'yyyy-MM-dd', { locale: pl }) : '—'}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Temat',
      sortable: true,
      render: (item) => (
        <div className="flex items-start gap-2 text-sm">
          <span className={!item.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}>
            {item.title}
          </span>
        </div>
      ),
    },
  ]

  const handleRowClick = async (bulletin: Bulletin) => {
    if (!bulletin.isRead) {
      await markAsRead.mutateAsync({ bulletinId: bulletin.id })
    }
    // Navigate to detail view
    window.location.href = `/dashboard/bulletins/${bulletin.id}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      <div className="flex-1 px-6 py-6">
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Komunikaty</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Wyszukiwanie</h3>
            </div>
            
            <DataTable
              data={data?.items || []}
              columns={columns}
              searchPlaceholder="Wyszukiwanie"
              onRowClick={handleRowClick}
              onExport={(format) => {
                console.log(`Export as ${format}`)
                // Implement export logic
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Podgląd
          </button>
          <button className="px-4 py-2 text-sm text-white bg-gray-700 border border-gray-700 rounded hover:bg-gray-800">
            <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Eksportuj
          </button>
        </div>
      </div>
    </div>
  )
}
