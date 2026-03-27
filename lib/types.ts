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
  email?: string
  phone: string
  logo?: string
  banner?: string
  postalCode?: string
  verificationStatus: CompanyVerificationStatus
  createdAt: string
  updatedAt: string
}

export interface Equipment {
  id: number
  companyId: number
  status: string
  condition: string
  name: string
  category: string
  details: string
  weight: number
  yearManufactured: number
  hourlyRate: number
  dailyRate: number
  monthlyRate: number
  images: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  id: number
  orderNumber: string
  renterName: string
  renterEmail: string
  phone?: string
  company?: string
  contactPerson?: string
  industrySector?: string
  projectLocation?: string
  totalDuration?: string
  crewRequested?: boolean
  equipmentId: number
  vesselId: number
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt?: string
  updatedAt?: string
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
  totalOrders: number
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
