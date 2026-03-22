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
import { companyService } from '@/lib/services/company'
import { MarineCompany } from '@/lib/types'
import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<MarineCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof MarineCompany | 'actions'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<MarineCompany | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await companyService.getAll()
        
        const rawData = Array.isArray(response) 
          ? response 
          : (response as any)?.companies || (response as any)?.data?.companies || (response as any)?.data || []
        
        const companiesArray = (Array.isArray(rawData) ? rawData : [])
          .map((c: any) => ({
            ...c,
            id: String(c.id),
            contactEmail: c.contactEmail || c.email || '',
            joinedDate: c.joinedDate || c.createdAt || new Date(),
            totalEquipment: c.totalEquipment ?? (Array.isArray(c.equipments) ? c.equipments.length + (Array.isArray(c.vessels) ? c.vessels.length : 0) : 0),
            verificationStatus: c.verificationStatus || 'pending',
            rating: c.rating ?? 0,
            totalOrders: c.totalOrders ?? 0,
            totalRevenue: c.totalRevenue ?? 0,
          }))
        setCompanies(companiesArray)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch companies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const filteredCompanies = useMemo(() => {
    const filtered = companies
      .filter((company) => {
        const name = company.name || ''
        const location = company.location || ''
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'actions') return 0
      const aValue = a[sortBy as keyof MarineCompany]
      const bValue = b[sortBy as keyof MarineCompany]

      if (typeof aValue === 'string') {
        const bValueStr = bValue as string
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValueStr)
          : bValueStr.localeCompare(aValue)
      }
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [companies, searchTerm, sortBy, sortDirection])

  const handleSort = (key: keyof MarineCompany | 'actions') => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const handleDelete = async () => {
    if (!companyToDelete) return
    const toastId = toast.loading('Deleting company...')
    try {
      await companyService.delete(companyToDelete.id)
      setCompanies(companies.filter(c => c.id !== companyToDelete.id))
      toast.success('Company deleted successfully', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete company', { id: toastId })
    } finally {
      setIsDeleteModalOpen(false)
      setCompanyToDelete(null)
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
          verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-100' },
          unverified: { label: 'Unverified', className: 'bg-slate-50 text-slate-700 border-slate-100' },
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.unverified
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(value)}
            <Badge variant="outline" className={`font-bold border ${config.className}`}>
              {config.label}
            </Badge>
          </div>
        )
      },
    },
    {
      key: 'actions' as const,
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
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/companies/${item.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                setCompanyToDelete(item)
                setIsDeleteModalOpen(true)
              }}
            >
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
          { label: 'Total Companies', value: companies.length, color: 'bg-slate-900' },
          { label: 'Verified', value: companies.filter(c => c.verificationStatus === 'verified').length, color: 'bg-emerald-500' },
          { label: 'Pending Review', value: companies.filter(c => c.verificationStatus === 'pending').length, color: 'bg-amber-500' },
          { label: 'Avg Rating', value: companies.length > 0 ? (companies.reduce((s,c) => s + (c.rating || 0), 0) / (companies.filter(c => (c.rating || 0) > 0).length || 1)).toFixed(2) : '0.00', color: 'bg-blue-500' },
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
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading companies...</p>
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
            data={filteredCompanies}
            columns={columns}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            totalItems={companies.length}
            itemsPerPage={10}
            totalPages={Math.ceil(companies.length / 10)}
            onRowClick={(company) =>
              router.push(`/dashboard/companies/${company.id}`)
            }
          />
        )}
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete Company
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{companyToDelete?.name}"</span>? This action is permanent and cannot be undone. All associated equipment and order data might be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold h-11 border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl font-bold h-11 border-0 shadow-lg bg-destructive hover:bg-destructive/90 shadow-destructive/20 transition-transform active:scale-95"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
