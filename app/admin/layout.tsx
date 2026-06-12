'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUser } from '@/app/actions/auth'

interface User {
  id: string
  email: string
  name: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getUser()
        if (!currentUser) {
          router.push('/sign-in')
          return
        }

        setUser(currentUser as User)
        setIsLoading(false)
      } catch (error) {
        router.push('/sign-in')
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Admin Panel</h2>
          <p className="text-sm text-slate-600">مجموعة العزب</p>
        </div>

        <nav className="space-y-2 p-4">
          <a
            href="/admin"
            className="block rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            Dashboard
          </a>
          <a
            href="/admin/orders"
            className="block rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            Orders
          </a>
          <a
            href="/admin/conversations"
            className="block rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            Conversations
          </a>
          <a
            href="/admin/customers"
            className="block rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            Customers
          </a>
          <a
            href="/admin/analytics"
            className="block rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            Analytics
          </a>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="text-xs text-slate-600">
            <p className="font-medium text-slate-900">{user?.name}</p>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <a
                href="/chat"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Chat
              </a>
              <a
                href="/api/auth/signout"
                className="text-sm text-slate-600 hover:text-slate-700 font-medium"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
