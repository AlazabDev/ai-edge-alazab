'use client'

import { useEffect, useState } from 'react'
import { getOrders, getConversations } from '@/app/actions/data'
import { neon_run_sql } from '@/lib/db'

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: Date
  totalAmount: string
}

interface Conversation {
  id: string
  title: string
  status: string
  createdAt: Date
  lastMessageAt: Date
}

interface Stats {
  totalOrders: number
  totalConversations: number
  pendingOrders: number
  activeConversations: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalConversations: 0,
    pendingOrders: 0,
    activeConversations: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load orders
        const orders = await getOrders()
        const conversations = await getConversations()

        setRecentOrders(orders?.slice(0, 5) || [])

        setStats({
          totalOrders: orders?.length || 0,
          totalConversations: conversations?.length || 0,
          pendingOrders: orders?.filter((o: any) => o.status === 'pending')?.length || 0,
          activeConversations: conversations?.filter((c: any) => c.status === 'active')?.length || 0,
        })

        setIsLoading(false)
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome to Admin Dashboard</h2>
        <p className="mt-2 text-slate-600">Overview of your services and customer interactions</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendingOrders}</p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Conversations</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalConversations}</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Conversations */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Conversations</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.activeConversations}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-white shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{order.totalAmount || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-6 py-4">
          <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all orders →
          </a>
        </div>
      </div>
    </div>
  )
}
