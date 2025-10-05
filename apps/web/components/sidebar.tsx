'use client'

import { useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Megaphone,
  BookOpen, 
  HelpCircle, 
  Calendar,
  Building2, 
  Settings,
  ClipboardList,
  ChevronRight,
  Users,
  BarChart3,
  FolderOpen,
  Briefcase
} from 'lucide-react'
import { useState } from 'react'
import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessiblePaths } from '@/lib/tabs/tab-access-map'
import { UserRole } from '@prisma/client'

const iconMap = {
  home: LayoutDashboard,
  document: FileText,
  chat: MessageSquare,
  briefcase: Briefcase,
  calendar: Calendar,
  megaphone: Megaphone,
  book: BookOpen,
  question: HelpCircle,
  building: Building2,
  cog: Settings,
  bulletins: ClipboardList,
  users: Users,
  reports: BarChart3,
  library: FolderOpen,
}

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { navigateTo } = useTabNavigation()
  const router = useRouter()
  
  // Use userRole prop if available, otherwise fall back to session
  const effectiveRole = (userRole || session?.user?.role) as UserRole | undefined
  
  // Get accessible navigation items based on user role
  const accessiblePaths = effectiveRole ? getAccessiblePaths(effectiveRole) : []
  
  // Map accessible paths to navigation items
  const navigation = accessiblePaths.map(config => ({
    name: config.title,
    href: config.path,
    icon: config.icon || 'home',
  }))

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
                <button
                  key={item.name}
                  onClick={() => {
                    // Prefer the simplified navigateTo which performs access checks
                    const ok = navigateTo(item.href)
                    if (!ok) return
                    // If navigateTo succeeded, router will navigate. If it returned true but didn't push, ensure push.
                    try {
                      router.push(item.href)
                    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
                      // noop
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative
                  `}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  <span className="flex-1 text-left">{item.name}</span>

                  {/* Underline / active indicator on the left */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600" />
                  )}
                </button>
              )
            })}
          </nav>
          
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
