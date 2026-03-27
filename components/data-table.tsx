import * as React from 'react'
import { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | 'actions'
  label: string
  render?: (value: any, item: T) => ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  sortBy?: keyof T | 'actions'
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: keyof T | 'actions') => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  sortBy,
  sortDirection = 'asc',
  onSort,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(new Set())

  const toggleAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((item) => item.id)))
    }
  }

  const toggleRow = (id: string | number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null
    if (sortBy !== col.key) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-slate-800" />
      : <ChevronDown className="w-3.5 h-3.5 text-slate-800" />
  }

  const startItem = data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Build visible page numbers with ellipsis
  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = []
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="w-[44px] pl-4 pr-2 py-3">
                <Checkbox
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="rounded-[4px] border-slate-300 data-[state=checked]:bg-[#050B20] data-[state=checked]:border-[#050B20]"
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50/80 whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-slate-700 transition-colors group"
                    >
                      <span>{col.label}</span>
                      <SortIcon col={col} />
                    </button>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-400 text-sm font-medium">No records found</p>
                    <p className="text-slate-300 text-xs">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-slate-100 transition-all duration-150 cursor-pointer',
                    'hover:bg-slate-50',
                    selectedRows.has(item.id) && 'bg-[#050B20]/[0.03]',
                    idx === data.length - 1 && 'border-b-0'
                  )}
                >
                  <TableCell className="pl-4 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(item.id)}
                      onCheckedChange={() => toggleRow(item.id)}
                      aria-label={`Select row ${item.id}`}
                      className="rounded-[4px] border-slate-300 data-[state=checked]:bg-[#050B20] data-[state=checked]:border-[#050B20]"
                    />
                  </TableCell>
                   {columns.map((col) => {
                     const value = col.key === 'actions' ? undefined : (item as any)[col.key]
                     return (
                       <td key={String(col.key)} className="px-4 py-3.5">
                         <div className="text-sm text-slate-700">
                           {col.render
                             ? col.render(value, item)
                             : String(value ?? '')}
                         </div>
                       </td>
                     )
                   })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400 font-medium order-2 sm:order-1">
          Showing <span className="text-slate-600 font-semibold">{startItem}–{endItem}</span> of <span className="text-slate-600 font-semibold">{totalItems}</span> results
          {selectedRows.size > 0 && (
            <span className="ml-2 text-[#050B20] font-semibold">· {selectedRows.size} selected</span>
          )}
        </p>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {pageNumbers().map((page, i) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-1.5 text-slate-300 text-sm select-none">···</span>
            ) : (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => onPageChange?.(page as number)}
                className={cn(
                  'h-8 w-8 rounded-lg text-sm font-semibold transition-all',
                  currentPage === page
                    ? 'bg-[#050B20] text-white hover:bg-[#050B20]/90'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                )}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
