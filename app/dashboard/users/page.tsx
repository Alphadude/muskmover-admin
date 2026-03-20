'use client'

import { useState, useMemo, useEffect } from 'react'
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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Eye,
  Search,
  Filter,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { userService } from '@/lib/services/user'
import { AdminUser, UserRole, UserStatus } from '@/lib/types'
import { toast } from 'sonner'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager' as UserRole,
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await userService.getAll()
        const usersArray = Array.isArray(data) ? data : (data as any)?.users || (data as any)?.data || []
        setUsers(usersArray)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleEditUser = (user: AdminUser) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsAddingUser(true)
      const data: any = await userService.create({
        ...newUser,
        status: 'active' as UserStatus,
      })
      
      const createdUser = data.admin || data.data || data
      setUsers(prev => [...prev, createdUser])
      setIsAddUserOpen(false)
      setNewUser({ name: '', email: '', password: '', role: 'manager' })
      toast.success('User created successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user')
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      setIsUpdating(true)
      await userService.update(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status,
      })
      
      const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u)
      setUsers(updatedUsers)
      setIsEditDialogOpen(false)
      toast.success('User updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm])

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
      key: 'actions' as const,
      label: '',
      width: '8%',
      render: (_: any, item: AdminUser) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              className="gap-2 text-sm"
              onClick={() => router.push(`/dashboard/users/${item.id}`)}
            >
              <Eye className="w-3.5 h-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-sm"
              onClick={() => handleEditUser(item)}
            >
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
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    viewer: users.filter(u => u.role === 'viewer').length,
  }
  const activeUsers = users.filter(u => u.status === 'active').length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Users</h1>
          <p className="text-slate-400 mt-0.5 text-sm">Manage team access and permission levels.</p>
        </div>
        <Button 
          onClick={() => setIsAddUserOpen(true)}
          className="gap-2 h-9 px-4 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white text-sm font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-slate-900' },
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

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading team members...</p>
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
            data={filteredUsers}
            columns={columns}
            totalItems={users.length}
            itemsPerPage={10}
            totalPages={Math.ceil(users.length / 10)}
          />
        )}
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

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new administrator account with specific roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full Name</Label>
              <Input
                id="new-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="e.g. Samuel Adekunle"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="samuel@muskmover.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Initial Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <p className="text-[10px] text-muted-foreground">User can change this after their first login.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">System Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="manager">Manager (Operations)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingUser}>
                {isAddingUser ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value: UserStatus) => setEditingUser({ ...editingUser, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
