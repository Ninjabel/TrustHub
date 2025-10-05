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
        {/* Make the inner dashboard area a fixed-height, scrollable container
            so individual views scroll themselves instead of the whole page. */}
        <div className="bg-gray-50 h-[calc(100vh-64px)] overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
