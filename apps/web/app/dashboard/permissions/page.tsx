'use client'

import { useState } from 'react'
import { DataTable, type Column } from '@/components/data-table'
import { Breadcrumbs, SystemBreadcrumb } from '@/components/breadcrumbs'

interface UserPermission {
  id: string
  userName: string
  email: string
  role: string
  entity?: string
  permissions: string[]
  active: boolean
  lastLogin?: Date
}

export default function PermissionsPage() {
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Mock data
  const mockData: UserPermission[] = [
    {
      id: '1',
      userName: 'Jan Kowalski',
      email: 'admin@uknf.test',
      role: 'UKNF_ADMIN',
      permissions: ['all'],
      active: true,
      lastLogin: new Date('2025-03-20'),
    },
    {
      id: '2',
      userName: 'Anna Nowak',
      email: 'pracownik@uknf.test',
      role: 'UKNF_EMPLOYEE',
      permissions: ['read_reports', 'read_entities', 'create_bulletins'],
      active: true,
      lastLogin: new Date('2025-03-19'),
    },
    {
      id: '3',
      userName: 'Piotr Admin',
      email: 'admin@bank-przykladowy.test',
      role: 'ENTITY_ADMIN',
      entity: 'Bank Przykładowy S.A.',
      permissions: ['manage_entity', 'submit_reports'],
      active: true,
      lastLogin: new Date('2025-03-18'),
    },
  ]

  const columns: Column<UserPermission>[] = [
    {
      key: 'userName',
      label: 'Nazwa użytkownika',
      sortable: true,
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rola',
      sortable: true,
      render: (item) => {
        const roleLabels = {
          UKNF_ADMIN: 'Administrator UKNF',
          UKNF_EMPLOYEE: 'Pracownik UKNF',
          ENTITY_ADMIN: 'Administrator podmiotu',
          ENTITY_USER: 'Użytkownik podmiotu',
        }
        return roleLabels[item.role as keyof typeof roleLabels] || item.role
      },
    },
    {
      key: 'entity',
      label: 'Podmiot',
      render: (item) => item.entity || '—',
    },
    {
      key: 'permissions',
      label: 'Uprawnienia',
      render: (item) => (
        <div className="text-xs">
          {item.permissions.length} uprawnień
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.active ? 'Aktywny' : 'Nieaktywny'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Ostatnie logowanie',
      sortable: true,
      render: (item) => item.lastLogin ? new Date(item.lastLogin).toLocaleDateString('pl-PL') : '—',
    },
  ]

  const filteredData = roleFilter === 'all' 
    ? mockData 
    : mockData.filter(item => item.role === roleFilter)

  return (
    <div className="flex flex-col min-h-screen">
      <SystemBreadcrumb 
        system="System" 
        entity="UKNF" 
        module="Zarządzanie uprawnieniami" 
      />
      
      <Breadcrumbs
        items={[
          { label: 'Pulpit użytkownika', href: '/dashboard' },
          { label: 'Linia uprawnień', closeable: true },
        ]}
      />

      <div className="flex-1 px-6 py-6">
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Zarządzanie uprawnieniami użytkowników</h2>
            <p className="text-sm text-gray-600 mt-1">
              Przegląd i zarządzanie uprawnieniami użytkowników systemu
            </p>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Rola:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="UKNF_ADMIN">Administrator UKNF</option>
                <option value="UKNF_EMPLOYEE">Pracownik UKNF</option>
                <option value="ENTITY_ADMIN">Administrator podmiotu</option>
                <option value="ENTITY_USER">Użytkownik podmiotu</option>
              </select>
            </div>
            
            <DataTable
              data={filteredData}
              columns={columns}
              searchPlaceholder="Szukaj użytkowników..."
              onRowClick={(item) => {
                console.log('Selected user:', item)
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700">
            + Dodaj użytkownika
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Eksportuj
            </button>
            <button className="px-4 py-2 text-sm text-white bg-gray-700 border border-gray-700 rounded hover:bg-gray-800">
              Edytuj uprawnienia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
