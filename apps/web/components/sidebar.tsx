'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home' },
  { name: 'Reports', href: '/dashboard/reports', icon: 'document' },
  { name: 'Messages', href: '/dashboard/messages', icon: 'chat' },
  { name: 'Cases', href: '/dashboard/cases', icon: 'briefcase' },
  { name: 'Announcements', href: '/dashboard/announcements', icon: 'megaphone' },
  { name: 'Library', href: '/dashboard/library', icon: 'book' },
  { name: 'FAQ', href: '/dashboard/faq', icon: 'question' },
  { name: 'Entities', href: '/dashboard/entities', icon: 'building' },
  { name: 'Admin', href: '/dashboard/admin', icon: 'cog' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">TrustHub</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
