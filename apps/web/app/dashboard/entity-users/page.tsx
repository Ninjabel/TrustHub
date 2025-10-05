'use client'

import { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  UserCheck, 
  UserX,
  Key,
  Lock,
  Search,
  Filter
} from 'lucide-react'

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
type EntityUserRole = 'ENTITY_ADMIN' | 'ENTITY_USER'

type EntityUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: EntityUserRole
  status: UserStatus
  modules: {
    reports: boolean
    cases: boolean
    messages: boolean
  }
  lastLogin?: Date
  createdAt: Date
}

export default function EntityUsersPage() {
  const [users, setUsers] = useState<EntityUser[]>([
    {
      id: '1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@bank.pl',
      role: 'ENTITY_ADMIN',
      status: 'ACTIVE',
      modules: { reports: true, cases: true, messages: true },
      lastLogin: new Date('2025-10-04'),
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@bank.pl',
      role: 'ENTITY_USER',
      status: 'ACTIVE',
      modules: { reports: true, cases: false, messages: true },
      lastLogin: new Date('2025-10-03'),
      createdAt: new Date('2024-03-20')
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<EntityUserRole | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL')

  const statusLabels: Record<UserStatus, string> = {
    ACTIVE: 'Aktywny',
    INACTIVE: 'Nieaktywny',
    BLOCKED: 'Zablokowany'
  }

  const statusColors: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    BLOCKED: 'bg-red-100 text-red-800'
  }

  const roleLabels: Record<EntityUserRole, string> = {
    ENTITY_ADMIN: 'Administrator',
    ENTITY_USER: 'Pracownik'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleActivate = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'ACTIVE' as UserStatus } : u
    ))
  }

  const handleDeactivate = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'INACTIVE' as UserStatus } : u
    ))
  }

  const handleBlock = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'BLOCKED' as UserStatus } : u
    ))
  }

  const handleResetPassword = (userId: string) => {
    alert(`Wysłano link do resetowania hasła dla pracownika ${userId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Zarządzanie pracownikami podmiotu
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Lista wszystkich pracowników przypisanych do Twojego podmiotu
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Dodaj pracownika
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Szukaj
            </label>
            <input
              type="text"
              placeholder="Imię, nazwisko lub e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="h-4 w-4 inline mr-1" />
              Rola
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as EntityUserRole | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Wszystkie</option>
              <option value="ENTITY_ADMIN">Administrator</option>
              <option value="ENTITY_USER">Pracownik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Wszystkie</option>
              <option value="ACTIVE">Aktywny</option>
              <option value="INACTIVE">Nieaktywny</option>
              <option value="BLOCKED">Zablokowany</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {users.length}
          </div>
          <div className="text-sm text-gray-600">Wszyscy pracownicy</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-gray-600">Aktywni</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'ENTITY_ADMIN').length}
          </div>
          <div className="text-sm text-gray-600">Administratorzy</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'ENTITY_USER').length}
          </div>
          <div className="text-sm text-gray-600">Pracownicy</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pracownik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moduły dostępowe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ostatnie logowanie
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.modules.reports && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Sprawozdawczość
                        </span>
                      )}
                      {user.modules.cases && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          Sprawy
                        </span>
                      )}
                      {user.modules.messages && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          Wiadomości
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pl-PL') : 'Nigdy'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Dezaktywuj"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Aktywuj"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleBlock(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Zablokuj"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Resetuj hasło"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Brak pracowników spełniających kryteria</p>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Informacja o uprawnieniach
        </h3>
          <p className="text-sm text-blue-800">
          Możesz zarządzać tylko pracownikami przypisanymi do Twojego podmiotu.
          Nie masz dostępu do zarządzania pracownikami z innych podmiotów ani użytkownikami UKNF.
        </p>
      </div>
    </div>
  )
}
