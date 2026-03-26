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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { dashboardService, CompanyPerformance, DashboardData } from '@/lib/services/dashboard'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { companyService } from '@/lib/services/company'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TrendingUp, Download } from 'lucide-react'

const EMPTY_ANALYTICS_DATA: DashboardData = {
  totalCompanies: 0,
  totalEquipment: 0,
  totalOrders: 0,
  activeOrders: 0,
  monthlyRevenue: 0,
  pendingVerifications: 0,
  averageRating: 0,
  revenueTrend: [],
  equipmentStatus: [],
  categoryDistribution: [],
  utilizationTrend: [],
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData>(EMPTY_ANALYTICS_DATA)
  const [companies, setCompanies] = useState<CompanyPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch raw data in parallel
        const [ordersRes, allEquipmentRes, companiesRes] = await Promise.all([
          orderService.getAll().catch(() => []),
          equipmentService.getAll().catch(() => []),
          companyService.getAll().catch(() => []),
        ])

        // Robust unwrapping (handling .data or direct array)
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || (ordersRes as any)?.orders || []
        const allEquipment = Array.isArray(allEquipmentRes) ? allEquipmentRes : (allEquipmentRes as any)?.data || (allEquipmentRes as any)?.equipment || []
        const allCompanies = Array.isArray(companiesRes) ? companiesRes : (companiesRes as any)?.data || (companiesRes as any)?.companies || []

        // 1. Calculate Revenue Trend (Last 6 months)
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
            orders: 0,
            target: 1000000, // Synthetic target for visualization
            growth: 0
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

        // Calculate MoM Growth
        last6Months.forEach((item, idx) => {
          if (idx > 0 && last6Months[idx-1].revenue > 0) {
            item.growth = Math.round(((item.revenue - last6Months[idx-1].revenue) / last6Months[idx-1].revenue) * 100)
          } else if (idx > 0) {
            item.growth = item.revenue > 0 ? 100 : 0
          }
        })

        // 2. Equipment Utilization & Status
        const statusMap = allEquipment.reduce((acc: any, e) => {
          const status = (e.status || e.availability || 'available').toLowerCase()
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})

        const equipmentStatus = [
          { name: 'Available', value: statusMap.available || 0, fill: '#00c853' },
          { name: 'Rented', value: statusMap.rented || 0, fill: '#1e90ff' },
          { name: 'Maintenance', value: statusMap.maintenance || statusMap.unavailable || 0, fill: '#ff9800' },
        ]

        // 3. Category Distribution
        const catMap = allEquipment.reduce((acc: any, e) => {
          const cat = e.category || 'other'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})

        const categoryDistribution = Object.entries(catMap).map(([name, count]) => ({
          name: name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          count: count as number
        })).sort((a, b) => b.count - a.count)

        const rentedCount = allEquipment.filter(e => {
          const s = (e.status || e.availability || '').toLowerCase()
          return s === 'rented' || s === 'unavailable'
        }).length
        const availableCount = allEquipment.filter(e => (e.status || e.availability || '').toLowerCase() === 'available').length
        const totalCount = allEquipment.length || 1
        
        const utilizationTrend = [
          { week: 'Current', utilization: Math.round((rentedCount/totalCount)*100), availability: Math.round((availableCount/totalCount)*100) }
        ]

        // 4. Company Performance Matrix
        const performance: CompanyPerformance[] = allCompanies.map(c => {
          const companyEquip = allEquipment.filter(e => Number(e.companyId) === Number(c.id))
          const equipIds = companyEquip.map(e => Number(e.id))
          const companyOrders = orders.filter(o => {
            const eqId = Number(o.equipmentId)
            const vId = Number(o.vesselId)
            return (eqId > 0 && equipIds.includes(eqId)) || (vId > 0 && equipIds.includes(vId))
          })
          
          const revenue = companyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
          
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          let currentMonthRev = 0
          let prevMonthRev = 0
          
          companyOrders.forEach(o => {
            const d = new Date(o.createdAt || o.startDate || Date.now())
            const m = d.getMonth()
            const y = d.getFullYear()
            
            if (y === currentYear && m === currentMonth) {
              currentMonthRev += (o.totalPrice || 0)
            } else if ((m === currentMonth - 1 && y === currentYear) || (currentMonth === 0 && m === 11 && y === currentYear - 1)) {
              prevMonthRev += (o.totalPrice || 0)
            }
          })
          
          let growth = 0
          if (prevMonthRev > 0) {
            growth = Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100)
          } else if (currentMonthRev > 0) {
            growth = 100
          }
          
          return {
            name: c.name,
            revenue: revenue,
            orders: companyOrders.length,
            rating: Number(c.rating || 4.5),
            growth: growth
          }
        }).sort((a, b) => b.revenue - a.revenue)

        setData({
          ...EMPTY_ANALYTICS_DATA,
          totalCompanies: allCompanies.length,
          totalEquipment: allEquipment.length,
          activeOrders: orders.filter(o => o.status === 'active' || o.status === 'confirmed').length,
          monthlyRevenue: last6Months[5].revenue,
          revenueTrend: last6Months,
          equipmentStatus,
          categoryDistribution,
          utilizationTrend: utilizationTrend
        })
        
        setCompanies(performance)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
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
        <p className="text-sm font-medium text-muted-foreground">Generating reports...</p>
      </div>
    )
  }

  // No longer returning early on error to show empty analytics charts


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
            <AreaChart data={data.revenueTrend}>
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
                isAnimationActive={false}
                type="monotone"
                dataKey="revenue"
                stroke="#1e90ff"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Actual Revenue"
              />
              {data.revenueTrend.some(r => r.target) && (
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="target"
                  stroke="#00c853"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target Revenue"
                />
              )}
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
          {data.revenueTrend.slice(-3).reverse().map((item) => (
            <div
              key={item.month}
              className="flex items-start justify-between p-3 rounded-lg bg-background border border-border/50"
            >
              <div>
                <p className="font-medium text-foreground text-sm">
                  {item.month}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-bold">
                  {formatNaira(item.revenue)}
                </p>
              </div>
              {item.growth !== undefined && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-500 text-sm">
                    +{item.growth}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status Distribution */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-soft glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Equipment Status
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Real-time availability distribution
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={data.equipmentStatus || []}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                cornerRadius={10}
              >
                {data.equipmentStatus?.map((entry, index) => (
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
          <div className="grid grid-cols-3 gap-2 mt-4">
            {data.equipmentStatus?.map((item) => (
              <div key={item.name} className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold text-foreground text-lg">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment by Category */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-soft glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Equipment by Category
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Distribution across asset types
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                }}
              />
              <Bar isAnimationActive={false} dataKey="count" fill="#0070f3" radius={[8, 8, 0, 0]} barSize={40} name="Units" />
            </BarChart>
          </ResponsiveContainer>
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
          <BarChart data={data.utilizationTrend || []}>
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
            <Bar isAnimationActive={false} dataKey="utilization" fill="#1e90ff" radius={[8, 8, 0, 0]} name="In Use %" />
            <Bar isAnimationActive={false} dataKey="availability" fill="#00c853" radius={[8, 8, 0, 0]} name="Available %" />
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground text-left">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground text-left">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground text-left">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground text-left">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.name}
                  className="border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground text-left">{company.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground text-left font-medium">
                      {formatNaira(company.revenue)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground text-left">{company.orders}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold text-left ${company.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {company.growth > 0 ? '+' : ''}{company.growth}%
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
