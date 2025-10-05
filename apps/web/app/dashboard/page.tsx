import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { 
  Building2, 
  FileText, 
  Bell, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  const isUKNFAdmin = session.user.role === 'UKNF_ADMIN'
  const isUKNFEmployee = session.user.role === 'UKNF_EMPLOYEE'
  const isEntityAdmin = session.user.role === 'ENTITY_ADMIN'
  const isEntityUser = session.user.role === 'ENTITY_USER'

  // Real data from database
  const entitiesCount = await prisma.organization.count()

  // Conditional stats based on role
  const stats = isEntityAdmin || isEntityUser ? {
    // Stats for ENTITY_ADMIN
    myReports: [
      { id: '1', name: 'Sprawozdanie Q3 2025', period: 'Q3 2025', status: 'SUCCESS', date: '2025-10-04', validator: 'Robocze' },
      { id: '2', name: 'Sprawozdanie finansowe', period: 'Q2 2025', status: 'PROCESSING', date: '2025-09-30', validator: 'W walidacji' },
      { id: '3', name: 'Raport ryzyka', period: 'Q2 2025', status: 'ERROR', date: '2025-09-28', validator: 'Błędy walidacji' },
      { id: '4', name: 'Sprawozdanie Q1 2025', period: 'Q1 2025', status: 'SUCCESS', date: '2025-06-30', validator: 'Zakończone sukcesem' },
      { id: '5', name: 'Raport kapitałowy', period: 'Q1 2025', status: 'SUCCESS', date: '2025-06-28', validator: 'Zakończone sukcesem' },
    ],
    accessRequests: {
      new: 3,
      pending: 2,
      approved: 15
    },
    unreadMessages: 7,
    cases: {
      new: 2,
      inProgress: 5,
      completed: 23
    },
    entityUsers: 12,
    bulletins: {
      unread: 4,
      highPriority: 1
    }
  } : {
    // Stats for UKNF roles
    entities: entitiesCount,
    accessRequests: {
      new: 12,
      inProgress: 8,
      approved: 156
    },
    unreadMessages: 5,
    recentReports: [
      { id: '1', entity: 'PKO Bank Polski', status: 'SUCCESS', date: '2025-10-04', type: 'Q3 2025' },
      { id: '2', entity: 'Santander', status: 'PROCESSING', date: '2025-10-04', type: 'Q3 2025' },
      { id: '3', entity: 'mBank', status: 'ERROR', date: '2025-10-03', type: 'Q3 2025' },
      { id: '4', entity: 'ING Bank Śląski', status: 'SUCCESS', date: '2025-10-03', type: 'Q3 2025' },
      { id: '5', entity: 'BNP Paribas', status: 'SUCCESS', date: '2025-10-02', type: 'Q3 2025' },
    ],
    recentActivity: [
      { id: '1', action: 'Nowy wniosek o dostęp', user: 'Jan Kowalski', time: '10 minut temu' },
      { id: '2', action: 'Zaktualizowano dane podmiotu', user: 'System', time: '1 godzinę temu' },
      { id: '3', action: 'Nowe sprawozdanie', user: 'PKO BP', time: '2 godziny temu' },
      { id: '4', action: 'Dodano użytkownika', user: 'Admin UKNF', time: '3 godziny temu' },
      { id: '5', action: 'Opublikowano komunikat', user: 'Admin UKNF', time: '4 godziny temu' },
    ]
  }

  const recentActivityEntity = [
    { id: '1', action: 'Wysłano sprawozdanie Q3 2025', user: 'Jan Kowalski', time: '2 godziny temu' },
    { id: '2', action: 'Nowa wiadomość od UKNF', user: 'UKNF', time: '5 godzin temu' },
    { id: '3', action: 'Zaktualizowano dane podmiotu', user: 'Anna Nowak', time: '1 dzień temu' },
    { id: '4', action: 'Zaakceptowano wniosek o dostęp', user: 'Jan Kowalski', time: '2 dni temu' },
    { id: '5', action: 'Utworzono nową sprawę', user: 'Jan Kowalski', time: '3 dni temu' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600'
      case 'PROCESSING': return 'text-yellow-600'
      case 'ERROR': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'PROCESSING': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'ERROR': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEntityAdmin ? 'Pulpit administratora podmiotu' : 
           isEntityUser ? 'Pulpit użytkownika' :
           isUKNFAdmin ? 'Pulpit UKNF Administratora' : 'Pulpit'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Witaj, {session.user.name}! Dzisiaj jest {new Date().toLocaleDateString('pl-PL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {isEntityAdmin && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>Bank Przykładowy S.A.</span>
          </div>
        )}
      </div>

      {/* Stats Grid - Entity Admin/User */}
      {(isEntityAdmin || isEntityUser) && 'myReports' in stats && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Nowe wiadomości i powiadomienia */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Bell className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Nowe wiadomości i powiadomienia
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Ostatnia: dziś o 14:30
                  </p>
                  <Link href="/dashboard/messages" className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block">
                    Zobacz nieprzeczytane →
                  </Link>
                </div>
              </div>
            </div>

            {/* Sprawozdania */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sprawozdania
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.myReports?.length || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Robocze</div>
                    <div className="font-semibold text-gray-600">
                      {stats.myReports?.filter((r: { validator?: string }) => r.validator === 'Robocze').length || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Błędy</div>
                    <div className="font-semibold text-red-600">
                      {stats.myReports?.filter((r: { status?: string }) => r.status === 'ERROR').length || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Sukces</div>
                    <div className="font-semibold text-green-600">
                      {stats.myReports?.filter((r: { status?: string }) => r.status === 'SUCCESS').length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sprawy */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sprawy
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {(stats.cases?.new || 0) + (stats.cases?.inProgress || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Nowe</div>
                    <div className="font-semibold text-blue-600">{stats.cases?.new || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">W toku</div>
                    <div className="font-semibold text-yellow-600">{stats.cases?.inProgress || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Zamknięte</div>
                    <div className="font-semibold text-gray-600">{stats.cases?.completed || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Wnioski o dostęp */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Wnioski o dostęp
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {(stats.accessRequests?.new || 0) + (stats.accessRequests?.pending || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Nowe</div>
                    <div className="font-semibold text-blue-600">{stats.accessRequests?.new || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Oczekujące</div>
                    <div className="font-semibold text-yellow-600">{stats.accessRequests?.pending || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Zatw.</div>
                    <div className="font-semibold text-green-600">{stats.accessRequests?.approved || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Komunikaty */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Bell className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Komunikaty
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.bulletins?.unread || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-600">
                      {stats.bulletins?.highPriority || 0} wysokiego priorytetu
                    </span>
                  </div>
                  <Link href="/dashboard/bulletins" className="text-sm text-red-600 hover:text-red-800">
                    Zobacz wszystkie →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bezpieczeństwo / Logowania */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bezpieczeństwo
                      </dt>
                    </dl>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Ostatnie logowanie</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(Date.now() - 86400000).toLocaleString('pl-PL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ostatnia zmiana hasła</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(Date.now() - 86400000 * 45).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ostatnie sprawozdania */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Ostatnie sprawozdania
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nazwa
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Okres
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.myReports?.slice(0, 5).map((report: { id: string; date?: string; name?: string; status?: string; validator?: string; period?: string }) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {report.date}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            <div className="max-w-xs truncate">{report.name}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              report.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                              report.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.validator}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {report.period}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/regulatory-reporting" className="text-sm text-blue-600 hover:text-blue-800">
                    Zobacz wszystkie sprawozdania →
                  </Link>
                </div>
              </div>
            </div>

            {/* Ostatnie sprawy */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Ostatnie sprawy
                </h3>
                <div className="space-y-3">
                  {[
                    { id: '1', number: '2025/001', title: 'Pytanie o walidację', status: 'Nowa', priority: 'Wysoki', date: '2025-10-04' },
                    { id: '2', number: '2025/002', title: 'Zmiana danych podmiotu', status: 'W toku', priority: 'Średni', date: '2025-10-03' },
                    { id: '3', number: '2025/003', title: 'Problem z dostępem', status: 'W toku', priority: 'Niski', date: '2025-10-02' },
                    { id: '4', number: '2025/004', title: 'Konsultacja sprawozdania', status: 'Zakończona', priority: 'Średni', date: '2025-10-01' },
                    { id: '5', number: '2025/005', title: 'Zapytanie ogólne', status: 'Zakończona', priority: 'Niski', date: '2025-09-30' },
                  ].map((caseItem) => (
                    <div key={caseItem.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{caseItem.number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            caseItem.status === 'Nowa' ? 'bg-blue-100 text-blue-800' :
                            caseItem.status === 'W toku' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {caseItem.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{caseItem.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{caseItem.date}</p>
                      </div>
                      <span className={`text-xs font-medium ml-3 ${
                        caseItem.priority === 'Wysoki' ? 'text-red-600' :
                        caseItem.priority === 'Średni' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {caseItem.priority}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/cases" className="text-sm text-blue-600 hover:text-blue-800">
                    Zobacz wszystkie sprawy →
                  </Link>
                </div>
              </div>
            </div>

            {/* Ostatnie wnioski o dostęp */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Ostatnie wnioski o dostęp
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Imię i nazwisko
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { id: '1', name: 'Jan Kowalski', status: 'Zaakceptowany', date: '2025-10-04' },
                        { id: '2', name: 'Anna Nowak', status: 'Nowy', date: '2025-10-03' },
                        { id: '3', name: 'Piotr Wiśniewski', status: 'W trakcie', date: '2025-10-02' },
                        { id: '4', name: 'Maria Lewandowska', status: 'Zaakceptowany', date: '2025-10-01' },
                        { id: '5', name: 'Tomasz Kamiński', status: 'Odrzucony', date: '2025-09-30' },
                      ].map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                            {request.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              request.status === 'Zaakceptowany' ? 'bg-green-100 text-green-800' :
                              request.status === 'Nowy' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'W trakcie' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {request.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/access-requests" className="text-sm text-blue-600 hover:text-blue-800">
                    Zobacz wszystkie wnioski →
                  </Link>
                </div>
              </div>
            </div>

            {/* Tablica ogłoszeń (komunikaty) */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  Tablica ogłoszeń
                </h3>
                <div className="space-y-3">
                  {[
                    { id: '1', title: 'Zmiany w regulaminie sprawozdawczości', priority: 'Wysoki', date: '2025-10-04', unread: true },
                    { id: '2', title: 'Planowana przerwa techniczna', priority: 'Średni', date: '2025-10-03', unread: true },
                    { id: '3', title: 'Nowe szablony formularzy', priority: 'Niski', date: '2025-10-01', unread: false },
                  ].map((bulletin) => (
                    <div key={bulletin.id} className={`p-3 rounded-lg border cursor-pointer ${
                      bulletin.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    } hover:shadow-sm transition-shadow`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {bulletin.unread && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Nowe
                              </span>
                            )}
                            <span className={`text-xs font-medium ${
                              bulletin.priority === 'Wysoki' ? 'text-red-600' :
                              bulletin.priority === 'Średni' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {bulletin.priority}
                            </span>
                          </div>
                          <p className={`text-sm ${bulletin.unread ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {bulletin.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {bulletin.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/bulletins" className="text-sm text-blue-600 hover:text-blue-800">
                    Zobacz wszystkie komunikaty →
                  </Link>
                </div>
              </div>
            </div>

            {/* Panel aktywności (timeline) - Entity */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Do zrobienia / Ostatnia aktywność
                </h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivityEntity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== recentActivityEntity.length - 1 ? (
                            <span
                              className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {activity.action}{' '}
                                  <span className="font-medium text-gray-900">
                                    {activity.user}
                                  </span>
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                {activity.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Entity Admin */}
          {isEntityAdmin && (
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Szybkie akcje
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/dashboard/reports?action=new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Nowe sprawozdanie</span>
                  </Link>
                  <Link href="/dashboard/cases?action=new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Nowa sprawa</span>
                  </Link>
                  <Link href="/dashboard/access-requests?action=new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Nowy wniosek</span>
                  </Link>
                  <Link href="/dashboard/entity-data" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                    <Building2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Dane podmiotu</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Security info */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Wskaźniki bezpieczeństwa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Ostatnie logowanie</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(Date.now() - 86400000).toLocaleString('pl-PL')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Ostatnia zmiana hasła</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(Date.now() - 86400000 * 45).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stats Grid - UKNF Admin/Employee */}
      {(isUKNFAdmin || isUKNFEmployee) && 'entities' in stats && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Dostępne podmioty */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Dostępne podmioty
                      </dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.entities}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/entities" className="text-sm text-blue-600 hover:text-blue-800">
                Zobacz wszystkie →
              </Link>
            </div>
          </div>
        </div>

        {/* Wnioski o dostęp */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Wnioski o dostęp
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.accessRequests.new}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Nowe</div>
                <div className="font-semibold text-red-600">{stats.accessRequests.new}</div>
              </div>
              <div>
                <div className="text-gray-500">W toku</div>
                <div className="font-semibold text-yellow-600">{stats.accessRequests.inProgress}</div>
              </div>
              <div>
                <div className="text-gray-500">Zatw.</div>
                <div className="font-semibold text-green-600">{stats.accessRequests.approved}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nowe wiadomości i komunikaty */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Nieprzeczytane
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/bulletins" className="text-sm text-purple-600 hover:text-purple-800">
                Zobacz komunikaty →
              </Link>
            </div>
          </div>
        </div>

        {/* Statusy sprawozdań */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sprawozdania dziś
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.recentReports?.filter(r => r.date === '2025-10-04').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/reports" className="text-sm text-green-600 hover:text-green-800">
                Zobacz wszystkie →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statusy sprawozdań - Recent 5 */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ostatnie sprawozdania
            </h3>
            <div className="space-y-3">
              {stats.recentReports?.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(report.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.entity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.type} • {report.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ostatnia aktywność
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentActivity?.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== (stats.recentActivity?.length || 0) - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <Users className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">
                              {activity.action}{' '}
                              <span className="font-medium text-gray-900">
                                {activity.user}
                              </span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (UKNF Admin only) */}
      {isUKNFAdmin && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Szybkie akcje
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/bulletins?action=new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Bell className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Nowy komunikat</span>
              </a>
              <a
                href="/dashboard/entities?action=new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Building2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Dodaj podmiot</span>
              </a>
              <a
                href="/dashboard/users?action=new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Dodaj użytkownika</span>
              </a>
              <a
                href="/dashboard/library?action=new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Dodaj plik</span>
              </a>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
