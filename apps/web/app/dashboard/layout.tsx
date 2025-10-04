import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={session.user} />
      <Sidebar userRole={session.user.role} />
      <main className="lg:pl-64">
        <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  )
}
