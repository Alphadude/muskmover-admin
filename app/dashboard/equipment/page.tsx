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
import { equipmentService } from '@/lib/services/equipment'
import { companyService } from '@/lib/services/company'
import { Equipment, MarineCompany } from '@/lib/types'
import { useEffect } from 'react'

export default function EquipmentPage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [companies, setCompanies] = useState<MarineCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof Equipment | 'actions'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [equipmentResponse, vesselResponse, companyResponse] = await Promise.all([
          equipmentService.getAll(),
          equipmentService.getAllVessels(),
          companyService.getAll()
        ])
        
        const rawEquipment = Array.isArray(equipmentResponse) 
          ? equipmentResponse 
          : (equipmentResponse as any)?.equipment || (equipmentResponse as any)?.data?.equipment || (equipmentResponse as any)?.data || []
          
        const rawVessels = Array.isArray(vesselResponse) 
          ? vesselResponse 
          : (vesselResponse as any)?.vessels || (vesselResponse as any)?.data?.vessels || (vesselResponse as any)?.data || []
        
        const equipmentArray = (Array.isArray(rawEquipment) ? rawEquipment : [])
          .map((e: any) => ({ ...e, id: String(e.id), _type: 'equipment' }))
        
        const vesselsArray = (Array.isArray(rawVessels) ? rawVessels : [])
          .map((v: any) => ({ 
            ...v, 
            id: String(v.id),
            _type: 'vessel',
            category: v.type || 'vessel',
          }))
          
        const combined = [...equipmentArray, ...vesselsArray]
        
        const companiesArray = Array.isArray(companyResponse) 
          ? companyResponse 
          : (companyResponse as any)?.companies || (companyResponse as any)?.data?.companies || (companyResponse as any)?.data || []
        
        setEquipment(combined)
        setCompanies(Array.isArray(companiesArray) ? companiesArray : [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch equipment data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredEquipment = useMemo(() => {
    const filtered = equipment
      .filter((item) => {
        const name = item.name || ''
        const category = item.category || ''
        const status = (item.status || item.availability || 'available').toLowerCase()
        const matchesSearch = 
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          status.includes(searchTerm.toLowerCase())
        return matchesSearch
      })
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'actions') return 0
      const aValue = a[sortBy as keyof Equipment]
      const bValue = b[sortBy as keyof Equipment]

      if (typeof aValue === 'string') {
        const bStr = bValue as string
        return sortDirection === 'asc'
          ? aValue.localeCompare(bStr)
          : bStr.localeCompare(aValue)
      }
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [equipment, searchTerm, sortBy, sortDirection])

  const handleSort = (key: keyof Equipment | 'actions') => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown'
  }

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) return
    
    try {
      setIsLoading(true)
      if (item._type === 'vessel') {
        await equipmentService.deleteVessel(item.id)
      } else {
        await equipmentService.delete(item.id)
      }
      setEquipment(prev => prev.filter(e => e.id !== item.id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset')
    } finally {
      setIsLoading(false)
    }
  }


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
      key: 'status' as const,
      label: 'Availability',
      sortable: true,
      width: '15%',
      render: (value: string, item: Equipment) => {
        const statusValue = (value || item.availability || 'available').toLowerCase()
        const variants: Record<string, 'default' | 'secondary'> = {
          available: 'default',
          rented: 'secondary',
          maintenance: 'secondary',
          unavailable: 'secondary',
        }
        return <Badge variant={variants[statusValue] || 'secondary'} className="capitalize">{statusValue}</Badge>
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
      key: 'actions' as const,
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
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(item)
              }}
            >
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
          { label: 'Total Items', value: equipment.length, color: 'bg-slate-900' },
          { label: 'Available', value: equipment.filter(e => (e.status || e.availability || '').toLowerCase() === 'available').length, color: 'bg-emerald-500' },
          { label: 'Rented', value: equipment.filter(e => (e.status || e.availability || '').toLowerCase() === 'rented').length, color: 'bg-blue-500' },
          { label: 'Maintenance', value: equipment.filter(e => (e.status || e.availability || '').toLowerCase() === 'maintenance').length, color: 'bg-amber-500' },
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
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading assets...</p>
          </div>
        ) : error ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-destructive rotate-45" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Something went wrong</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{error}</p>
            </div>
            <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-2"
            >
                Try Again
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredEquipment}
            columns={columns}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            totalItems={equipment.length}
            itemsPerPage={10}
            totalPages={Math.ceil(equipment.length / 10)}
            onRowClick={(item) =>
              router.push(`/dashboard/equipment/${item.id}`)
            }
          />
        )}
      </div>

      {/* Maintenance Alert */}
      {equipment.filter((e) => e.availability === 'maintenance').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            <span className="font-bold">{equipment.filter((e) => (e.status || e.availability || '').toLowerCase() === 'maintenance').length} assets</span> are currently under maintenance.
          </p>
        </div>
      )}
    </div>
  )
}
