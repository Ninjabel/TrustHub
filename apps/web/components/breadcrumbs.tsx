'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
  closeable?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  onClose?: (index: number) => void
}

export function Breadcrumbs({ items, onClose }: BreadcrumbsProps) {
  const [tabs, setTabs] = useState(items)

  const handleClose = (index: number) => {
    const newTabs = tabs.filter((_, i) => i !== index)
    setTabs(newTabs)
    onClose?.(index)
  }

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-thin">
          {tabs.map((item, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm whitespace-nowrap
                ${index === tabs.length - 1 
                  ? 'bg-white border-t-2 border-blue-600 font-medium text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {item.href && index !== tabs.length - 1 ? (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
              
              {item.closeable && (
                <button
                  onClick={() => handleClose(index)}
                  className="ml-1 p-0.5 rounded hover:bg-gray-200 transition-colors"
                  aria-label="Zamknij zakładkę"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

// System-level breadcrumb with context info
export function SystemBreadcrumb({ 
  system, 
  entity, 
  module 
}: { 
  system?: string
  entity?: string
  module?: string
}) {
  return (
    <div className="bg-gray-200 border-b border-gray-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 h-8 text-xs text-gray-700">
          {system && <span className="font-medium">{system}:</span>}
          {entity && (
            <>
              <span>/</span>
              <span className="font-medium">{entity}:</span>
            </>
          )}
          {module && <span>{module}</span>}
          <button className="ml-auto p-1 hover:bg-gray-300 rounded" title="Zmień">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
