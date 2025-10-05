'use client'

import { useState } from 'react'
import { 
  Building2, 
  Save, 
  History, 
  MapPin, 
  Phone, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2
} from 'lucide-react'

type EntityData = {
  id: string
  name: string
  uknfCode: string
  lei?: string
  nip?: string
  krs?: string
  street: string
  building: string
  apartment?: string
  postalCode: string
  city: string
  phone: string
  email: string
  lastUpdated: Date
  lastUpdatedBy: string
}

type ChangeRequest = {
  id: string
  date: Date
  field: string
  oldValue: string
  newValue: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedBy: string
}

export default function EntityDataPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  const [entityData, setEntityData] = useState<EntityData>({
    id: '1',
    name: 'Bank Przykładowy S.A.',
    uknfCode: 'BNK001234',
    lei: '529900T8BM49AURSDO55',
    nip: '1234567890',
    krs: '0000123456',
    street: 'ul. Bankowa',
    building: '15',
    apartment: '3',
    postalCode: '00-950',
    city: 'Warszawa',
    phone: '+48 22 123 45 67',
    email: 'kontakt@bank.pl',
    lastUpdated: new Date('2025-09-15'),
    lastUpdatedBy: 'Jan Kowalski'
  })

  const [editedData, setEditedData] = useState<EntityData>(entityData)

  const changeHistory: ChangeRequest[] = [
    {
      id: '1',
      date: new Date('2025-09-15'),
      field: 'Telefon',
      oldValue: '+48 22 123 45 66',
      newValue: '+48 22 123 45 67',
      status: 'APPROVED',
      submittedBy: 'Jan Kowalski'
    },
    {
      id: '2',
      date: new Date('2025-08-10'),
      field: 'E-mail',
      oldValue: 'info@bank.pl',
      newValue: 'kontakt@bank.pl',
      status: 'APPROVED',
      submittedBy: 'Anna Nowak'
    }
  ]

  const statusLabels = {
    PENDING: 'Oczekuje',
    APPROVED: 'Zaakceptowane',
    REJECTED: 'Odrzucone'
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedData(entityData)
    setIsEditing(false)
  }

  const handleSave = () => {
    // W rzeczywistości tutaj byłoby wysłanie zgłoszenia jako sprawy do UKNF
    alert('Zgłoszenie zmiany danych zostało wysłane do UKNF jako nowa sprawa.')
    setEntityData(editedData)
    setIsEditing(false)
  }

  const handleChange = (field: keyof EntityData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Aktualizator danych podmiotu
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Zarządzaj danymi rejestrowym Twojego podmiotu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <History className="h-5 w-5" />
            Historia zmian
          </button>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit2 className="h-5 w-5" />
              Edytuj dane
            </button>
          )}
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Informacja o procesie aktualizacji danych
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Każda zmiana danych rejestrowych jest przesyłana jako zgłoszenie do UKNF. 
              Zmiany wymagają weryfikacji i zatwierdzenia przez UKNF przed ich wprowadzeniem do systemu.
            </p>
          </div>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            Ostatnia aktualizacja: <strong>{entityData.lastUpdated.toLocaleDateString('pl-PL')}</strong>
          </span>
          <span className="text-gray-400">|</span>
          <span>
            Przez: <strong>{entityData.lastUpdatedBy}</strong>
          </span>
        </div>
        {!isEditing && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Dane aktualne
          </span>
        )}
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Dane podstawowe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa podmiotu
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.name : entityData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod UKNF
                </label>
                <input
                  type="text"
                  value={entityData.uknfCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LEI
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.lei : entityData.lei}
                  onChange={(e) => handleChange('lei', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.nip : entityData.nip}
                  onChange={(e) => handleChange('nip', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KRS
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.krs : entityData.krs}
                  onChange={(e) => handleChange('krs', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Adres
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ulica
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.street : entityData.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer budynku
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.building : entityData.building}
                  onChange={(e) => handleChange('building', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer lokalu
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.apartment : entityData.apartment}
                  onChange={(e) => handleChange('apartment', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod pocztowy
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.postalCode : entityData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miejscowość
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.city : entityData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Dane kontaktowe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={isEditing ? editedData.phone : entityData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={isEditing ? editedData.email : entityData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Zapisz i wyślij do UKNF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Historia zmian danych podmiotu
            </h2>
            <div className="space-y-3">
              {changeHistory.map((change) => (
                <div key={change.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">{change.field}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[change.status]}`}>
                          {statusLabels[change.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="text-gray-500">Poprzednia wartość:</span>{' '}
                          <span className="line-through">{change.oldValue}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Nowa wartość:</span>{' '}
                          <span className="font-medium">{change.newValue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{change.date.toLocaleDateString('pl-PL')}</div>
                      <div className="text-xs">{change.submittedBy}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
