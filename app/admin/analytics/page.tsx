'use client'

import { useEffect, useState } from 'react'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: string
  averageOrderValue: string
  conversionRate: string
  topServices: Array<{ name: string; count: number }>
  channelDistribution: Array<{ channel: string; count: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 'SAR 0',
    averageOrderValue: 'SAR 0',
    conversionRate: '0%',
    topServices: [
      { name: 'Building Construction', count: 5 },
      { name: 'Interior Finishing', count: 3 },
      { name: 'Maintenance Services', count: 2 },
    ],
    channelDistribution: [
      { channel: 'Web', count: 45 },
      { channel: 'WhatsApp', count: 30 },
      { channel: 'Telegram', count: 25 },
    ],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load analytics data
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Analytics & Reports</h2>
        <p className="mt-2 text-slate-600">Key metrics and insights about your business</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Orders', value: analytics.totalOrders, color: 'blue' },
          { label: 'Total Revenue', value: analytics.totalRevenue, color: 'green' },
          { label: 'Avg Order Value', value: analytics.averageOrderValue, color: 'purple' },
          { label: 'Conversion Rate', value: analytics.conversionRate, color: 'yellow' },
        ].map((metric, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Services */}
        <div className="rounded-lg bg-white shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Top Services</h3>
          </div>
          <div className="p-6 space-y-4">
            {analytics.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-slate-900">{service.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(service.count / Math.max(...analytics.topServices.map((s) => s.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-8 text-right">{service.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="rounded-lg bg-white shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Channel Distribution</h3>
          </div>
          <div className="p-6 space-y-4">
            {analytics.channelDistribution.map((channel, index) => {
              const total = analytics.channelDistribution.reduce((sum, c) => sum + c.count, 0)
              const percentage = ((channel.count / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-sm text-slate-900">{channel.channel}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          index === 0
                            ? 'bg-blue-500'
                            : index === 1
                              ? 'bg-green-500'
                              : 'bg-purple-500'
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: 'Daily Report', description: 'Get today\'s summary' },
            { title: 'Weekly Report', description: 'Last 7 days overview' },
            { title: 'Monthly Report', description: 'This month\'s performance' },
          ].map((report, index) => (
            <button
              key={index}
              className="rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 transition"
            >
              <p className="font-medium text-slate-900">{report.title}</p>
              <p className="text-sm text-slate-600">{report.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
