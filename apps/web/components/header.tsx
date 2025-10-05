"use client"

import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { UserRole } from '@prisma/client'
import { useState } from 'react'
import { toast } from 'sonner'

type UserFromSession = Session['user'] & {
  id?: string
  role?: UserRole
  memberships?: Array<{ orgId: string; role: string }>
  currentOrgId?: string | null
}

export function Header({ user }: { user: UserFromSession | null }) {
  const [fontSize, setFontSize] = useState(1) // 0: small, 1: medium, 2: large

  const roleLabels = {
    UKNF_ADMIN: 'Administrator UKNF',
    UKNF_EMPLOYEE: 'Pracownik UKNF',
    ENTITY_ADMIN: 'Administrator podmiotu',
    ENTITY_USER: 'Pracownik podmiotu',
  }

  const handleFontSize = () => {
    const newSize = (fontSize + 1) % 3
    setFontSize(newSize)
    document.documentElement.style.fontSize = newSize === 0 ? '14px' : newSize === 1 ? '16px' : '18px'
  }

  const handleSignOut = () => {
    try {
      console.log('[Header] handleSignOut called')
      toast('Wylogowywanie...', { icon: '🔒' })
      // Remove any persisted tab storage so tabs don't reappear after next login
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('trusthub-tabs-storage')
        }
      } catch (e) {
        console.warn('Failed to remove persisted tabs from localStorage', e)
      }
    } finally {
      // Finally, call signOut to end the session and redirect
      signOut({ callbackUrl: '/signin' })
    }
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

              {/* User info */}
              <div className="flex items-center gap-3 border-l pl-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role ? roleLabels[user.role as keyof typeof roleLabels] : 'Użytkownik'}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleSignOut}
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
