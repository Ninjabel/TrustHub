'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
  closeable?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  onClose?: (index: number) => void
  children?: React.ReactNode
}

export function Breadcrumbs({ items = [], onClose, children }: BreadcrumbsProps) {
  const [tabs, setTabs] = useState<BreadcrumbItem[]>(items)

  // Keep internal tabs state in sync when parent items change.
  // Only update when items actually differ to avoid causing a render loop
  const prevItemsRef = useRef<BreadcrumbItem[] | null>(null)

  const itemsEqual = (a: BreadcrumbItem[] | null, b: BreadcrumbItem[]) => {
    if (!a) return b.length === 0
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const x = a[i]
      const y = b[i]
      if (x.label !== y.label) return false
      if ((x.href ?? null) !== (y.href ?? null)) return false
      if (!!x.closeable !== !!y.closeable) return false
    }
    return true
  }

  useEffect(() => {
    if (!itemsEqual(prevItemsRef.current, items)) {
      setTabs(items)
      prevItemsRef.current = items
    }
    // only depend on items; prevItemsRef is a mutable ref
  }, [items])

  const handleClose = (index: number) => {
    const newTabs = tabs.filter((_, i) => i !== index)
    setTabs(newTabs)
    onClose?.(index)
  }

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-thin">
          {children ? (
            // If caller passed children (SystemBreadcrumb components), render them directly
            children
          ) : (
            tabs.map((item, index) => (
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
            ))
          )}
        </nav>
      </div>
    </div>
  )
}

// System-level breadcrumb with context info
// SystemBreadcrumb removed - use page-level headings or the Breadcrumbs component instead.

// Backwards-compatible small export: some pages import SystemBreadcrumb.
export function SystemBreadcrumb({
  children,
  system,
  entity,
  module,
}: {
  children?: React.ReactNode
  system?: string
  entity?: string
  module?: string
}) {
  return (
    <div className="py-2 px-4 bg-white">
      <div className="max-w-7xl mx-auto flex items-center gap-4 text-sm text-gray-700">
        {system && <span className="font-medium">{system}</span>}
        {entity && <span>{entity}</span>}
        {module && <span className="text-gray-500">{module}</span>}
        <div className="flex-1" />
        {children}
      </div>
    </div>
  )
}
