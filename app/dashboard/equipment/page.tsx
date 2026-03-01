'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Plus,
  MoreHorizontal,
  Filter,
  X,
  Package,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Columns,
} from 'lucide-react'
import { mockEquipment, mockCompanies } from '@/lib/mock-data'
import { Equipment } from '@/lib/types'

export default function EquipmentPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof Equipment>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredEquipment = useMemo(() => {
    return mockEquipment
      .filter((item) => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.availability.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => {
// ... existing sort logic ...
        const aValue = a[sortBy]
        const bValue = b[sortBy]

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

  const handleSort = (key: keyof Equipment) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const getCompanyName = (companyId: string) => {
    return mockCompanies.find((c) => c.id === companyId)?.name || 'Unknown'
  }

  const categories = Array.from(new Set(mockEquipment.map((e) => e.category)))
  const availabilities = Array.from(new Set(mockEquipment.map((e) => e.availability)))

  const columns = [
    {
      key: 'name' as const,
      label: 'Equipment Name',
      sortable: true,
      width: '25%',
      render: (value: string, item: Equipment) => (
        <div>
          <p className="font-medium text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">
            {getCompanyName(item.companyId)}
          </p>
        </div>
      ),
    },
    {
      key: 'category' as const,
      label: 'Category',
      sortable: true,
      width: '15%',
      render: (value: string) => (
        <Badge variant="secondary">{value.replace('-', ' ')}</Badge>
      ),
    },
    {
      key: 'hourlyRate' as const,
      label: 'Hourly Rate',
      sortable: true,
      width: '12%',
      render: (value: number) => (
        <span className="font-medium text-foreground">
          ₦{value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'availability' as const,
      label: 'Availability',
      sortable: true,
      width: '15%',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary'> = {
          available: 'default',
          rented: 'secondary',
          maintenance: 'secondary',
          unavailable: 'secondary',
        }
        return <Badge variant={variants[value] || 'secondary'}>{value}</Badge>
      },
    },
    {
      key: 'condition' as const,
      label: 'Condition',
      sortable: true,
      width: '12%',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: '15%',
      render: (_: string, item: Equipment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/equipment/${item.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/equipment/${item.id}/edit`}>Edit Equipment</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/equipment/${item.id}/orders`}>View Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Inventory</h1>
          <p className="text-slate-400 mt-0.5 text-sm">Monitor and manage your maritime equipment assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-9 px-4 rounded-lg border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            onClick={() => router.push('/dashboard/equipment/new')}
            className="gap-2 h-9 px-4 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: mockEquipment.length, color: 'bg-slate-900' },
          { label: 'Available', value: mockEquipment.filter(e => e.availability === 'available').length, color: 'bg-emerald-500' },
          { label: 'Rented', value: mockEquipment.filter(e => e.availability === 'rented').length, color: 'bg-blue-500' },
          { label: 'Maintenance', value: mockEquipment.filter(e => e.availability === 'maintenance').length, color: 'bg-amber-500' },
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
              placeholder="Search equipment..."
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
          data={filteredEquipment}
          columns={columns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          totalItems={mockEquipment.length}
          itemsPerPage={10}
          totalPages={Math.ceil(mockEquipment.length / 10)}
          onRowClick={(item) =>
            console.log('Row clicked', item.id)
          }
        />
      </div>

      {/* Maintenance Alert */}
      {mockEquipment.filter((e) => e.availability === 'maintenance').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            <span className="font-bold">{mockEquipment.filter((e) => e.availability === 'maintenance').length} assets</span> are currently under maintenance.
          </p>
        </div>
      )}
    </div>
  )
}
