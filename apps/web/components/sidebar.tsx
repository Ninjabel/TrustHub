'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Folder, 
  Megaphone,
  BookOpen, 
  HelpCircle, 
  Building2, 
  Settings,
  ClipboardList,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const iconMap = {
  home: LayoutDashboard,
  document: FileText,
  chat: MessageSquare,
  briefcase: Folder,
  megaphone: Megaphone,
  book: BookOpen,
  question: HelpCircle,
  building: Building2,
  cog: Settings,
  bulletins: ClipboardList,
}

const uknfNavigation = [
  { name: 'Moje podmioty', href: '/dashboard/entities', icon: 'building' },
  { name: 'Wnioski o dostęp', href: '/dashboard/access-requests', icon: 'document' },
  { name: 'Biblioteka - repozytorium plików', href: '/dashboard/library', icon: 'book' },
  { name: 'Wiadomości', href: '/dashboard/messages', icon: 'chat' },
  { name: 'Sprawy', href: '/dashboard/cases', icon: 'briefcase' },
  { name: 'Linia uprawnień', href: '/dashboard/permissions', icon: 'cog' },
  { name: 'Wysyłka dokumentów', href: '/dashboard/documents', icon: 'megaphone' },
  { name: 'Sprawozdawczość', href: '/dashboard/reports', icon: 'document' },
  { name: 'Moje pytania', href: '/dashboard/faq', icon: 'question' },
  { name: 'Baza wiedzy', href: '/dashboard/knowledge', icon: 'book' },
]

const entityNavigation = [
  { name: 'Biblioteka - repozytorium plików', href: '/dashboard/library', icon: 'book' },
  { name: 'Wnioski o dostęp', href: '/dashboard/access-requests', icon: 'document' },
  { name: 'Sprawy', href: '/dashboard/cases', icon: 'briefcase' },
  { name: 'Sprawozdawczość', href: '/dashboard/reports', icon: 'document' },
  { name: 'Moje pytania', href: '/dashboard/faq', icon: 'question' },
  { name: 'Baza wiedzy', href: '/dashboard/knowledge', icon: 'book' },
]

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Use userRole prop if available, otherwise fall back to session
  const effectiveRole = userRole || session?.user?.role
  const isUKNF = effectiveRole === 'UKNF_ADMIN' || effectiveRole === 'UKNF_EMPLOYEE'
  const navigation = isUKNF ? uknfNavigation : entityNavigation

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg"
      >
        <ChevronRight className={`h-6 w-6 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 lg:top-[64px] bottom-0 left-0 z-40 w-64 bg-gray-50 border-r border-gray-300 
        transform transition-transform lg:translate-x-0
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Menu header */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-300">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <div className="h-0.5 bg-gray-700" />
                <div className="h-0.5 bg-gray-700" />
                <div className="h-0.5 bg-gray-700" />
              </div>
              <span>MENU</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = iconMap[item.icon as keyof typeof iconMap]
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${
                      isActive
                        ? 'bg-white text-gray-900 font-medium border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-white border-l-4 border-transparent'
                    }
                  `}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  <span className="flex-1">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-3 bg-gray-800 text-white">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full text-left text-xs py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Zwiń menu
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
