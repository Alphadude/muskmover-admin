'use client'

import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Download,
  TrendingUp,
  Calendar,
} from 'lucide-react'

const revenueData = [
  { month: 'Jan', revenue: 2400000, target: 2500000, growth: 12 },
  { month: 'Feb', revenue: 3100000, target: 2500000, growth: 18 },
  { month: 'Mar', revenue: 2800000, target: 2500000, growth: 15 },
  { month: 'Apr', revenue: 3900000, target: 3500000, growth: 22 },
  { month: 'May', revenue: 3500000, target: 3500000, growth: 20 },
  { month: 'Jun', revenue: 4100000, target: 3500000, growth: 25 },
]

const equipmentUtilization = [
  { week: 'Week 1', utilization: 65, availability: 35 },
  { week: 'Week 2', utilization: 72, availability: 28 },
  { week: 'Week 3', utilization: 68, availability: 32 },
  { week: 'Week 4', utilization: 81, availability: 19 },
]

const companyPerformance = [
  { name: 'Atlantic Marine', revenue: 2450000, orders: 142, rating: 4.8 },
  { name: 'Gulf Cargo', revenue: 1890000, orders: 98, rating: 4.6 },
  { name: 'Deep Sea Exp', revenue: 3120000, orders: 156, rating: 4.9 },
  { name: 'Maritime Safety', revenue: 2180000, orders: 118, rating: 4.7 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">

      {/* Export Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Revenue & Target
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly revenue vs target
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1e90ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1e90ff"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Actual Revenue"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#00c853"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Metrics */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Growth Rate
            </h3>
          </div>
          {revenueData.slice(-3).map((item) => (
            <div
              key={item.month}
              className="flex items-start justify-between p-3 rounded-lg bg-background border border-border/50"
            >
              <div>
                <p className="font-medium text-foreground text-sm">
                  {item.month}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ₦{(item.revenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-500 text-sm">
                  +{item.growth}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Utilization */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Equipment Utilization
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly utilization rate
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={equipmentUtilization}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="utilization" fill="#1e90ff" radius={[8, 8, 0, 0]} />
            <Bar dataKey="availability" fill="#00c853" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Company Performance */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Company Performance
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Top performing vendors
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {companyPerformance.map((company, index) => (
                <tr
                  key={company.name}
                  className="border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{company.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground">
                      ₦{(company.revenue / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground">{company.orders}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {company.rating}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-500 font-semibold">
                      +{15 + index * 5}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
