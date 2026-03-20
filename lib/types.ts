/* Marine Marketplace Admin Dashboard Types */

export type CompanyVerificationStatus = 'verified' | 'pending' | 'unverified'
export type EquipmentCategory = 'vessels' | 'cargo-equipment' | 'diving-gear' | 'navigation' | 'safety' | 'propulsion' | 'other'
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor'
export type EquipmentAvailability = 'available' | 'rented' | 'maintenance' | 'unavailable'
export type OrderStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
export type UserRole = 'admin' | 'manager' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface MarineCompany {
  id: string
  name: string
  location: string
  country: string
  contactEmail: string
  phone: string
  logo?: string
  banner?: string
  verificationStatus: CompanyVerificationStatus
  rating: number
  totalEquipment: number
  totalOrders: number
  totalRevenue: number
  joinedDate: Date
  description?: string
}

export interface Equipment {
  id: string
  companyId: string
  name: string
  category: EquipmentCategory
  description: string
  condition: EquipmentCondition
  availability: EquipmentAvailability
  hourlyRate: number
  dailyRate: number
  monthlyRate: number
  images: string[]
  specifications: Record<string, string>
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  yearManufactured?: number
  maintenanceDate?: Date
  createdAt: Date
}

export interface Order {
  id: string
  equipmentId: string
  companyId: string
  rentedBy: string
  renterEmail: string
  renterPhone?: string
  startDate: Date
  endDate: Date
  status: OrderStatus
  totalPrice: number
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  notes?: string
  createdAt: Date
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  lastLogin?: Date
  createdAt: Date
  avatar?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  companyId: string
  subject: string
  body: string
  isRead: boolean
  createdAt: Date
  attachments?: string[]
}

export interface Dashboard {
  totalCompanies: number
  totalEquipment: number
  activeOrders: number
  monthlyRevenue: number
  pendingVerifications: number
  averageRating: number
}

export interface PlatformSettings {
  name: string
  email: string
  phone: string
  commissionRate: number
  minOrderValue: number
  verificationRequirements: string[]
  sessionTimeout: number
  maxLoginAttempts: number
  require2FA: boolean
}
