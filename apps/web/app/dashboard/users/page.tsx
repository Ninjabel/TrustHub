"use client"

import { trpc } from '@/lib/trpc/client'
import { Users as UsersIcon, Mail, Shield, Calendar, Edit, Trash2 } from 'lucide-react'

export default function UsersPage() {
  const { data, isLoading } = trpc.users.list.useQuery({})

  const users = data?.users || []

  const getRoleBadge = (role: string) => {
    const roleColors = {
      UKNF_ADMIN: 'bg-purple-100 text-purple-800',
      UKNF_EMPLOYEE: 'bg-blue-100 text-blue-800',
      ENTITY_ADMIN: 'bg-green-100 text-green-800',
      ENTITY_USER: 'bg-gray-100 text-gray-800',
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      UKNF_ADMIN: 'Administrator UKNF',
      UKNF_EMPLOYEE: 'Pracownik UKNF',
      ENTITY_ADMIN: 'Administrator podmiotu',
      ENTITY_USER: 'Pracownik podmiotu',
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Użytkownicy i role</h1>
          <p className="mt-2 text-sm text-gray-700">Zarządzanie użytkownikami systemu i ich uprawnieniami</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Wszyscy użytkownicy</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{users?.length || 0}</div>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Administratorzy UKNF</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{users?.filter(u => u.role === 'UKNF_ADMIN').length || 0}</div>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Pracownicy UKNF</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{users?.filter(u => u.role === 'UKNF_EMPLOYEE').length || 0}</div>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Pracownicy podmiotów</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{users?.filter(u => u.role === 'ENTITY_ADMIN' || u.role === 'ENTITY_USER').length || 0}</div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie...</div>
        ) : !users || users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Brak użytkowników</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Użytkownik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rola</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data utworzenia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ostatnie logowanie</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UsersIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        <Shield className="h-3 w-3" />
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktywny</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(user as Record<string, unknown>).lastLoginAt ? new Date((user as Record<string, unknown>).lastLoginAt as string).toLocaleDateString('pl-PL') : 'Nigdy'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3"><Edit className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

