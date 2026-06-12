'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

interface Customer {
  id: string
  name: string
  email: string
  phoneNumber?: string
  preferredChannel: string
  createdAt: Date
  lastInteraction?: Date
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        // For now, return empty as we need server action
        setCustomers([])
        setIsLoading(false)
      } catch (error) {
        console.error('[v0] Error loading customers:', error)
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Customers Management</h2>
        <p className="mt-2 text-slate-600">View and manage your customer base</p>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Preferred Channel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No customers found. Customers will appear here as they interact with the bot.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {customer.preferredChannel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {customer.lastInteraction
                        ? new Date(customer.lastInteraction).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <p className="text-sm text-blue-900">
          <strong>Total Customers:</strong> {customers.length}
        </p>
      </div>
    </div>
  )
}
