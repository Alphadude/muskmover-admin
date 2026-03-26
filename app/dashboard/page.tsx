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
import { companyService } from '@/lib/services/company'
import { equipmentService } from '@/lib/services/equipment'
import { orderService } from '@/lib/services/order'
import { notificationService } from '@/lib/services/notification'
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
  totalOrders: 0,
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
        
        // Fetch all primary data in parallel with individual error handling
        const [companiesRes, allEquipmentRes, ordersRes, notificationsRes] = await Promise.all([
          companyService.getAll().catch(err => { console.error('Companies fetch failed:', err); return []; }),
          equipmentService.getAll().catch(err => { console.error('Equipment fetch failed:', err); return []; }),
          orderService.getAll().catch(err => { console.error('Orders fetch failed:', err); return []; }),
          notificationService.getAll().catch(err => { console.error('Notifications fetch failed:', err); return []; }),
        ])

        // Safely extract arrays (handle potential .data wrapper from backend)
        const companies = Array.isArray(companiesRes) ? companiesRes : (companiesRes as any)?.data || []
        const allEquipment = Array.isArray(allEquipmentRes) ? allEquipmentRes : (allEquipmentRes as any)?.data || []
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || (ordersRes as any)?.orders || []
        const notifications = Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes as any)?.data || []

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        // 1. Calculate Core KPIs
        const totalCompanies = companies.length
        const totalEquipment = allEquipment.length
        const totalOrders = orders.length
        const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'confirmed').length
        const pendingVerifications = companies.filter(c => c.verificationStatus !== 'verified').length
        
        // 2. Calculate Monthly Revenue
        const monthlyRevenue = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt || o.startDate)
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
          })
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0)

        // 3. Calculate Equipment Statuses
        const statusMap = allEquipment.reduce((acc: any, e) => {
          const status = e.availability || 'available'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})

        const equipmentStatus = [
          { name: 'Available', value: statusMap.available || 0, fill: '#00c853' },
          { name: 'Rented', value: statusMap.rented || 0, fill: '#1e90ff' },
          { name: 'Maintenance', value: statusMap.maintenance || statusMap.unavailable || 0, fill: '#ff9800' },
        ]

        // 4. Calculate Category Distribution
        const catMap = allEquipment.reduce((acc: any, e) => {
          const cat = e.category || 'other'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})

        const categoryDistribution = Object.entries(catMap).map(([name, count]) => ({
          name: name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          count: count as number
        })).sort((a, b) => b.count - a.count)

        // 5. Calculate Revenue Trend (Last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const last6Months = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          last6Months.push({
            month: months[d.getMonth()],
            monthIdx: d.getMonth(),
            year: d.getFullYear(),
            revenue: 0,
            orders: 0
          })
        }

        orders.forEach(o => {
          const orderDate = new Date(o.createdAt || o.startDate)
          const m = orderDate.getMonth()
          const y = orderDate.getFullYear()
          const trendItem = last6Months.find(item => item.monthIdx === m && item.year === y)
          if (trendItem) {
            trendItem.revenue += (o.totalPrice || 0)
            trendItem.orders += 1
          }
        })

        const processedStats: DashboardData = {
          totalCompanies,
          totalEquipment,
          totalOrders,
          activeOrders,
          monthlyRevenue,
          pendingVerifications,
          averageRating: companies.reduce((acc, c) => acc + (c.rating || 0), 0) / (companies.length || 1),
          revenueTrend: last6Months.map(({ month, revenue, orders }) => ({ month, revenue, orders })),
          equipmentStatus,
          categoryDistribution,
          utilizationTrend: [], // Placeholder for now
        }

        setStats(processedStats)
        setActivity(notifications)
      } catch (err: any) {
        console.error('Dashboard aggregation error:', err)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-8 h-8" />}
          description="Lease agreements"
          variant="secondary"
          trend={{ value: 15, direction: 'up' }}
        />
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={<ShoppingCart className="w-8 h-8" />}
          description="In progress"
          variant="accent"
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
                {stats.equipmentStatus.map((entry, index) => (
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
