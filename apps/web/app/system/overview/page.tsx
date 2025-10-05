'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Activity, Database, Building2, Users, FileText } from 'lucide-react'

export default function SystemOverviewPage() {
  const { data: session, status } = useSession()

  // Redirect if not UKNF_INSTITUTION
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'UKNF_INSTITUTION') {
    redirect('/dashboard')
  }

  const { data: overview, isLoading } = trpc.system.getSystemOverview.useQuery()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Konto instytucjonalne UKNF – tryb systemowy
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel zarządzania automatycznymi operacjami systemowymi
            </p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje systemowe</CardTitle>
          <CardDescription>Dane konta instytucjonalnego</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nazwa konta</dt>
              <dd className="mt-1 text-sm font-semibold">{overview?.systemInfo.accountName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm font-semibold">{overview?.systemInfo.accountEmail}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Uptime systemu</dt>
              <dd className="mt-1 text-sm font-semibold">
                {overview?.systemInfo.uptime ? formatUptime(overview.systemInfo.uptime) : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge variant="success" className="bg-green-600 hover:bg-green-700">
                  Aktywne
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Raporty</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.statistics.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.statistics.processingReports || 0} w trakcie przetwarzania
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Podmioty</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.statistics.totalEntities || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.statistics.activeEntities || 0} aktywnych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.statistics.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Konta użytkowników</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baza danych</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="success" className="bg-green-600 hover:bg-green-700">
                OK
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Połączenie aktywne</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie akcje systemowe</CardTitle>
          <CardDescription>
            10 ostatnich operacji wykonanych przez konto instytucjonalne UKNF
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!overview?.recentActions || overview.recentActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak zarejestrowanych akcji</p>
          ) : (
            <div className="space-y-4">
              {overview.recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {action.action}
                      </Badge>
                      {action.resource && (
                        <span className="text-xs text-muted-foreground">
                          {action.resource} #{action.resourceId?.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    {action.parsedDetails && (
                      <div className="text-xs text-muted-foreground">
                        {action.parsedDetails.actionType && (
                          <span className="font-medium">{action.parsedDetails.actionType}</span>
                        )}
                        {action.parsedDetails.source && (
                          <span className="ml-2">
                            Źródło: <span className="font-medium">{action.parsedDetails.source}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(action.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Uwaga:</strong> To konto systemowe nie może być używane do logowania
            interaktywnego. Wszystkie operacje są wykonywane automatycznie przez system TrustHub w
            imieniu Urzędu Komisji Nadzoru Finansowego (UKNF).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
