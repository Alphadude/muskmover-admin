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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Eye,
  Search,
  Filter,
} from 'lucide-react'
import { mockAdminUsers } from '@/lib/mock-data'
import { AdminUser } from '@/lib/types'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() =>
    mockAdminUsers.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm])

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-[#050B20] text-white',
      manager: 'bg-blue-50 text-blue-700 border border-blue-200',
      viewer: 'bg-slate-100 text-slate-600 border border-slate-200',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[role] || styles.viewer}`}>
        <Shield className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  const getStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-500',
      inactive: 'bg-slate-300',
      suspended: 'bg-red-400',
    }
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} />
        <span className="text-sm text-slate-600 capitalize">{status}</span>
      </div>
    )
  }

  const columns = [
    {
      key: 'name' as const,
      label: 'User',
      width: '30%',
      render: (value: string, item: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-600">{value.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{value}</p>
            <p className="text-xs text-slate-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role' as const,
      label: 'Role',
      width: '18%',
      render: (value: string) => getRoleBadge(value),
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '15%',
      render: (value: string) => getStatusDot(value),
    },
    {
      key: 'lastLogin' as const,
      label: 'Last Login',
      width: '25%',
      render: (value?: Date) => (
        <p className="text-sm text-slate-500">
          {value
            ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
              ' · ' +
              new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : <span className="text-slate-300">Never</span>}
        </p>
      ),
    },
    {
      key: 'id' as const,
      label: '',
      width: '8%',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 text-sm">
              <Eye className="w-3.5 h-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm">
              <Edit className="w-3.5 h-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm text-red-500 focus:text-red-500">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const roleStats = {
    admin: mockAdminUsers.filter(u => u.role === 'admin').length,
    manager: mockAdminUsers.filter(u => u.role === 'manager').length,
    viewer: mockAdminUsers.filter(u => u.role === 'viewer').length,
  }
  const activeUsers = mockAdminUsers.filter(u => u.status === 'active').length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Users</h1>
          <p className="text-slate-400 mt-0.5 text-sm">Manage team access and permission levels.</p>
        </div>
        <Button className="gap-2 h-9 px-4 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white text-sm font-medium">
          <Plus className="w-3.5 h-3.5" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: mockAdminUsers.length, color: 'bg-slate-900' },
          { label: 'Administrators', value: roleStats.admin, color: 'bg-[#050B20]' },
          { label: 'Managers', value: roleStats.manager, color: 'bg-blue-500' },
          { label: 'Active Now', value: activeUsers, color: 'bg-emerald-500' },
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
              placeholder="Search users..."
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
          </div>
        </div>

        <DataTable
          data={filteredUsers}
          columns={columns}
          totalItems={mockAdminUsers.length}
          itemsPerPage={10}
          totalPages={Math.ceil(mockAdminUsers.length / 10)}
        />
      </div>

      {/* Role Permissions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Role Permissions</p>
        <div className="space-y-1.5 text-sm">
          {[
            { role: 'Admin', desc: 'Full access to all features and settings' },
            { role: 'Manager', desc: 'Can manage companies, equipment, and orders' },
            { role: 'Viewer', desc: 'Read-only access to all sections' },
          ].map(({ role, desc }) => (
            <div key={role} className="flex gap-2">
              <span className="font-semibold text-slate-600 w-16 shrink-0">{role}:</span>
              <span className="text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
