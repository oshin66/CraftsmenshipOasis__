export type Role = 'BUYER' | 'SELLER' | 'ADMIN'
export type GigStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFICATION'
  | 'REQUIREMENTS_PENDING'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: Role
  isSeller: boolean
  sellerBio?: string
  skills?: string
  createdAt: string
}

export interface Gig {
  id: string
  title: string
  description: string
  thumbnail?: string
  category: string
  techStack: string
  status: GigStatus
  basicPrice: number
  basicDesc: string
  standardPrice: number
  standardDesc: string
  premiumPrice: number
  premiumDesc: string
  deliveryDays: number
  totalOrders: number
  rating: number
  sellerId: string
  seller: User
  createdAt: string
}

export interface Order {
  id: string
  package: string
  price: number
  status: OrderStatus
  requirements?: string
  deliveryFile?: string
  deadline?: string
  gigId: string
  gig: Gig
  buyerId: string
  buyer: User
  sellerId: string
  seller: User
  payment?: Payment
  createdAt: string
}

export interface Payment {
  id: string
  amount: number
  transactionId: string
  screenshot?: string
  status: PaymentStatus
  orderId: string
  createdAt: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  orderId: string
  gigId: string
  authorId: string
  author: User
  createdAt: string
}

export interface GigFormData {
  title: string
  description: string
  thumbnail?: File
  category: string
  techStack: string
  basicPrice: number
  basicDesc: string
  standardPrice: number
  standardDesc: string
  premiumPrice: number
  premiumDesc: string
  deliveryDays: number
}
