'use client'

import { Header } from '@/components/header'
import { StatsCard } from '@/components/stats-card'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  Star,
} from 'lucide-react'
import { dashboardService, DashboardData } from '@/lib/services/dashboard'
import { useEffect, useState } from 'react'

const revenueData = [
  { month: 'Jan', revenue: 2400000, orders: 24 },
  { month: 'Feb', revenue: 3100000, orders: 35 },
  { month: 'Mar', revenue: 2800000, orders: 28 },
  { month: 'Apr', revenue: 3900000, orders: 42 },
  { month: 'May', revenue: 3500000, orders: 38 },
  { month: 'Jun', revenue: 4100000, orders: 45 },
]

const equipmentUsageData = [
  { name: 'Available', value: 8, fill: '#00c853' },
  { name: 'Rented', value: 2, fill: '#1e90ff' },
  { name: 'Maintenance', value: 2, fill: '#ff9800' },
]

const categoryData = [
  { name: 'Vessels', count: 8 },
  { name: 'Cargo Equipment', count: 12 },
  { name: 'Diving Gear', count: 14 },
  { name: 'Navigation', count: 6 },
  { name: 'Safety', count: 8 },
]

const EMPTY_STATS: DashboardData = {
  totalCompanies: 0,
  totalEquipment: 0,
  activeOrders: 0,
  monthlyRevenue: 0,
  pendingVerifications: 0,
  averageRating: 0,
  revenueTrend: [],
  equipmentStatus: [
    { name: 'Available', value: 0, fill: '#00c853' },
    { name: 'Rented', value: 0, fill: '#1e90ff' },
    { name: 'Maintenance', value: 0, fill: '#ff9800' },
  ],
  categoryDistribution: [],
  utilizationTrend: [],
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData>(EMPTY_STATS)
  const [activity, setActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(),
        ])
        
        // Ensure all properties used in charts are arrays
        const processedStats = {
          ...EMPTY_STATS,
          ...statsData,
          revenueTrend: Array.isArray(statsData?.revenueTrend) ? statsData.revenueTrend : [],
          equipmentStatus: Array.isArray(statsData?.equipmentStatus) ? statsData.equipmentStatus : EMPTY_STATS.equipmentStatus,
          categoryDistribution: Array.isArray(statsData?.categoryDistribution) ? statsData.categoryDistribution : [],
          utilizationTrend: Array.isArray(statsData?.utilizationTrend) ? statsData.utilizationTrend : [],
        }
        setStats(processedStats)
        
        const activityArray = Array.isArray(activityData) ? activityData : (activityData as any)?.activity || (activityData as any)?.data || []
        setActivity(activityArray)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">Loading dashboard analytics...</p>
      </div>
    )
  }

  // We no longer return early on error to allow the page to show empty stats


  return (
    <div className="space-y-6">
      {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={<Users className="w-8 h-8" />}
          description="Active marketplace vendors"
          variant="default"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatsCard
          title="Equipment Listed"
          value={stats.totalEquipment}
          icon={<Package className="w-8 h-8" />}
          description="Across all categories"
          variant="accent"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={<ShoppingCart className="w-8 h-8" />}
          description="In progress"
          variant="secondary"
          trend={{ value: 24, direction: 'up' }}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatNaira(stats.monthlyRevenue)}
          icon={<TrendingUp className="w-8 h-8" />}
          description="Current month"
          variant="default"
          trend={{ value: 15, direction: 'up' }}
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerifications}
          icon={<AlertCircle className="w-8 h-8" />}
          description="Action required"
          variant="secondary"
          trend={{ value: 5, direction: 'down' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 p-6 shadow-soft transition-all hover:shadow-md glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Revenue & Orders Trend
            </h3>
            <p className="text-sm font-medium text-slate-500/80 mt-1">
              Last 6 months performance
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0070f3"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Usage */}
        <div className="bg-white rounded-2xl border border-border/50 p-6 shadow-soft transition-all hover:shadow-md glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Equipment Status
            </h3>
            <p className="text-sm font-medium text-slate-500/80 mt-1">
              Current availability
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.equipmentStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                cornerRadius={10}
              >
                {equipmentUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {stats.equipmentStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Category */}
        <div className="bg-white rounded-2xl border border-border/50 p-6 shadow-soft transition-all hover:shadow-md glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Equipment by Category
            </h3>
            <p className="text-sm font-medium text-slate-500/80 mt-1">
              Distribution across types
            </p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                }}
              />
              <Bar dataKey="count" fill="#0070f3" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-border/50 p-6 shadow-soft transition-all hover:shadow-md glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Messages
            </h3>
            <p className="text-sm font-medium text-slate-500/80 mt-1">
              Latest communications
            </p>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {item.title || item.senderName}
                    </p>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                      {item.description || item.subject}
                    </p>
                  </div>
                  {(item.isRead === false || item.unread) && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 text-xs font-bold uppercase tracking-wider h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">
            View All Messages
          </Button>
        </div>
      </div>
    </div>
  )
}
