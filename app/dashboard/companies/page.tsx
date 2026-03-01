'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Eye,
  Edit,
  Trash2,
  Star,
  Check,
  Clock,
  ArrowUpDown,
  Download,
  Columns,
  Filter,
} from 'lucide-react'
import { mockCompanies } from '@/lib/mock-data'
import { MarineCompany } from '@/lib/types'

export default function CompaniesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof MarineCompany>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredCompanies = useMemo(() => {
    return mockCompanies
      .filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
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

  const handleSort = (key: keyof MarineCompany) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />
      default:
        return null
    }
  }

  const columns = [
    {
      key: 'name' as const,
      label: 'Company Name',
      sortable: true,
      width: '25%',
      render: (value: string, item: MarineCompany) => (
        <div>
          <p className="font-medium text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{item.contactEmail}</p>
        </div>
      ),
    },
    {
      key: 'location' as const,
      label: 'Location',
      sortable: true,
      width: '15%',
    },
    {
      key: 'totalEquipment' as const,
      label: 'Equipment',
      sortable: true,
      width: '12%',
      render: (value: number) => (
        <span className="font-medium text-foreground">{value} items</span>
      ),
    },
    {
      key: 'totalOrders' as const,
      label: 'Orders',
      sortable: true,
      width: '10%',
      render: (value: number) => (
        <span className="text-foreground">{value}</span>
      ),
    },
    {
      key: 'rating' as const,
      label: 'Rating',
      sortable: true,
      width: '12%',
      render: (value: number, item: MarineCompany) => (
        <div className="flex items-center gap-2">
          {item.verificationStatus === 'pending' ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <>
              <span className="font-medium text-foreground">{value}</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </>
          )}
        </div>
      ),
    },
    {
      key: 'verificationStatus' as const,
      label: 'Status',
      width: '15%',
      render: (value: string) => {
        const statusConfig = {
          verified: { label: 'Verified', variant: 'default' as const },
          pending: { label: 'Pending', variant: 'secondary' as const },
          unverified: { label: 'Unverified', variant: 'secondary' as const },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(value)}
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        )
      },
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: '11%',
      render: (value: string, item: MarineCompany) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/companies/${item.id}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Marine Companies</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor your maritime business partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-9 px-4 rounded-lg border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/companies/new')}
            className="gap-2 h-9 px-4 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: mockCompanies.length, color: 'bg-slate-900' },
          { label: 'Verified', value: mockCompanies.filter(c => c.verificationStatus === 'verified').length, color: 'bg-emerald-500' },
          { label: 'Pending Review', value: mockCompanies.filter(c => c.verificationStatus === 'pending').length, color: 'bg-amber-500' },
          { label: 'Avg Rating', value: (mockCompanies.reduce((s,c) => s + c.rating, 0) / mockCompanies.filter(c => c.rating > 0).length).toFixed(2), color: 'bg-blue-500' },
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

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 rounded-lg text-sm font-medium focus:ring-slate-900 shadow-none"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button variant="outline" size="sm" className="h-10 px-3 rounded-lg border-slate-200 font-bold text-slate-600 gap-2 whitespace-nowrap">
              <span className="text-slate-400 font-medium">Show</span> 10 Row
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </Button>
            
            <Button variant="outline" size="sm" className="h-10 px-3 rounded-lg border-slate-200 font-bold text-slate-600 gap-2 whitespace-nowrap">
              Manage Columns <Columns className="w-4 h-4 text-slate-400" />
            </Button>

            <Button variant="outline" size="sm" className="h-10 px-3 rounded-lg border-slate-200 font-bold text-slate-600 gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>

            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg border-slate-200">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredCompanies}
          columns={columns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          totalItems={mockCompanies.length}
          itemsPerPage={10}
          totalPages={Math.ceil(mockCompanies.length / 10)}
          onRowClick={(company) =>
            router.push(`/dashboard/companies/${company.id}`)
          }
        />
      </div>
    </div>
  )
}
