'use client'

import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { OrganizationSwitcher } from './organization-switcher'
import { UserRole } from '@prisma/client'
import { Eye, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

type UserFromSession = Session['user'] & {
  id?: string
  role?: UserRole
  memberships?: any[]
  currentOrgId?: string | null
}

export function Header({ user }: { user: UserFromSession | null }) {
  const isEntityUser = user?.role === 'ENTITY_ADMIN' || user?.role === 'ENTITY_USER'
  const isUKNF = user?.role === 'UKNF_ADMIN' || user?.role === 'UKNF_EMPLOYEE'
  
  const [mounted, setMounted] = useState(false)
  const [fontSize, setFontSize] = useState(1) // 0: small, 1: medium, 2: large
  const [highContrast, setHighContrast] = useState(false)
  const [sessionTime, setSessionTime] = useState('12:46')

  // Ensure component is mounted before running client-side effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Session timer countdown
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(now.getTime() + 12 * 60 * 1000 + 46 * 1000)
      const mins = Math.floor((end.getTime() - now.getTime()) / 60000)
      const secs = Math.floor(((end.getTime() - now.getTime()) % 60000) / 1000)
      setSessionTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const roleLabels = {
    UKNF_ADMIN: 'Administrator UKNF',
    UKNF_EMPLOYEE: 'Pracownik UKNF',
    ENTITY_ADMIN: 'Administrator podmiotu',
    ENTITY_USER: 'Użytkownik podmiotu',
  }

  const handleFontSize = () => {
    const newSize = (fontSize + 1) % 3
    setFontSize(newSize)
    const sizes = ['text-sm', 'text-base', 'text-lg']
    document.documentElement.style.fontSize = newSize === 0 ? '14px' : newSize === 1 ? '16px' : '18px'
  }

  return (
    <header className="bg-white border-b border-gray-300">
      {/* Top bar with logo and utilities */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo UKNF */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-[#003D7A] font-bold text-2xl">UKNF</div>
                <div className="border-l border-gray-400 h-10" />
                <div className="text-xs leading-tight text-gray-700 max-w-[180px]">
                  <div className="font-semibold">URZĄD</div>
                  <div className="font-semibold">KOMISJI NADZORU</div>
                  <div className="font-semibold">FINANSOWEGO</div>
                </div>
              </div>
              <div className="hidden lg:block ml-8">
                <div className="text-base font-normal text-gray-900">
                  System Komunikacji z Podmiotami
                </div>
              </div>
            </div>

            {/* Right utilities */}
            <div className="flex items-center gap-3">
              {/* Font size */}
              <button
                onClick={handleFontSize}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                title="Zmień rozmiar czcionki"
              >
                <span className={fontSize === 0 ? 'font-bold' : ''}>A</span>
                <span className={fontSize === 1 ? 'font-bold text-lg' : 'text-lg'}>A</span>
                <span className={fontSize === 2 ? 'font-bold text-xl' : 'text-xl'}>A</span>
              </button>

              {/* High contrast */}
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`p-2 rounded ${highContrast ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Wysoki kontrast"
              >
                <Eye className="h-5 w-5" />
              </button>

              {/* Session timer */}
              {isEntityUser && (
                <div className="flex items-center gap-2 text-sm text-gray-700 border-l pl-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Koniec sesji za: <strong>{sessionTime}</strong></span>
                </div>
              )}

              {/* User info */}
              <div className="flex items-center gap-3 border-l pl-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {isUKNF ? 'Użytkownik UKNF' : 'Użytkownik podmiotu'}
                  </div>
                </div>
                {isEntityUser && <OrganizationSwitcher />}
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                className="px-3 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
