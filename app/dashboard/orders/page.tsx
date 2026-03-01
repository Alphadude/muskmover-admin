'use client'

import { useState, useMemo } from 'react'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  X,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpDown,
  Download,
  Plus,
  Columns,
} from 'lucide-react'
import { mockOrders, mockEquipment, mockCompanies } from '@/lib/mock-data'
import { Order } from '@/lib/types'

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof Order>('startDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredOrders = useMemo(() => {
    return mockOrders
      .filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.rentedBy.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
        }

        if (typeof aValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue)
        }

        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      })
  }, [searchTerm, sortBy, sortDirection])

  const handleSort = (key: keyof Order) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const getEquipmentName = (equipmentId: string) => {
    return mockEquipment.find((e) => e.id === equipmentId)?.name || 'Unknown'
  }

  const getCompanyName = (companyId: string) => {
    return mockCompanies.find((c) => c.id === companyId)?.name || 'Unknown'
  }

  const statuses = Array.from(new Set(mockOrders.map((o) => o.status)))
  const paymentStatuses = Array.from(
    new Set(mockOrders.map((o) => o.paymentStatus))
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'active':
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const columns = [
    {
      key: 'id' as const,
      label: 'Order ID',
      sortable: true,
      width: '15%',
      render: (value: string) => (
        <span className="font-mono text-sm text-primary">{value}</span>
      ),
    },
    {
      key: 'rentedBy' as const,
      label: 'Rented By',
      sortable: true,
      width: '18%',
      render: (value: string, item: Order) => (
        <div>
          <p className="font-medium text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{item.renterEmail}</p>
        </div>
      ),
    },
    {
      key: 'equipmentId' as const,
      label: 'Equipment',
      width: '20%',
      render: (value: string, item: Order) => (
        <div>
          <p className="font-medium text-foreground">
            {getEquipmentName(value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {getCompanyName(item.companyId)}
          </p>
        </div>
      ),
    },
    {
      key: 'startDate' as const,
      label: 'Duration',
      sortable: true,
      width: '15%',
      render: (value: Date, item: Order) => (
        <div className="text-sm">
          <p className="text-foreground">
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            to {new Date(item.endDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'totalPrice' as const,
      label: 'Total Price',
      sortable: true,
      width: '12%',
      render: (value: number) => (
        <span className="font-semibold text-foreground">
          ₦{value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      width: '12%',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary'> = {
          active: 'default',
          completed: 'default',
          pending: 'secondary',
          confirmed: 'secondary',
          cancelled: 'secondary',
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(value)}
            <Badge variant={variants[value] || 'secondary'}>{value}</Badge>
          </div>
        )
      },
    },
    {
      key: 'paymentStatus' as const,
      label: 'Payment',
      width: '12%',
      render: (value: string) => (
        <Badge
          variant={value === 'paid' ? 'default' : 'secondary'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: '8%',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Print Invoice</DropdownMenuItem>
            <DropdownMenuItem>Send Message</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalPrice, 0)
  const activeOrders = mockOrders.filter((o) => o.status === 'active').length
  const pendingOrders = mockOrders.filter((o) => o.status === 'pending').length
  const completedOrders = mockOrders.filter(
    (o) => o.status === 'completed'
  ).length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders & Transactions</h1>
          <p className="text-slate-400 mt-0.5 text-sm">Manage lease agreements and financial tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-9 px-4 rounded-lg border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button className="gap-2 h-9 px-4 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white text-sm font-medium">
            <Plus className="w-3.5 h-3.5" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: mockOrders.length, color: 'bg-slate-900' },
          { label: 'Total Revenue', value: `₦${(totalRevenue/1000000).toFixed(1)}M`, color: 'bg-emerald-500' },
          { label: 'Active', value: activeOrders, color: 'bg-blue-500' },
          { label: 'Completed', value: completedOrders, color: 'bg-violet-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-5 flex items-start gap-3">
            <div className={`w-1 h-8 rounded-full mt-0.5 ${stat.color}`} />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 rounded-lg bg-slate-50 focus-visible:ring-1 focus-visible:ring-slate-900 shadow-none"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 text-sm font-medium text-slate-500 gap-1.5 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 text-sm font-medium text-slate-500 gap-1.5 hover:bg-slate-50">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredOrders}
          columns={columns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          totalItems={mockOrders.length}
          itemsPerPage={10}
          totalPages={Math.ceil(mockOrders.length / 10)}
          onRowClick={(item) => console.log('Row clicked', item.id)}
        />
      </div>

      {/* Pending Alert */}
      {pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            <span className="font-bold">{pendingOrders} transactions</span> are awaiting payment validation.
          </p>
        </div>
      )}
    </div>
  )
}
