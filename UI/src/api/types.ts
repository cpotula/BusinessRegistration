export interface Category {
  id: number
  name: string
  slug: string
}

export interface BusinessSummary {
  id: number
  name: string
  slug: string
  categoryName: string
  description: string | null
  city: string | null
  logoUrl: string | null
  isActive: boolean
  subscriptionExpiresOn: string | null
}

export interface Testimonial {
  id: number
  customerName: string
  rating: number
  reviewText: string | null
  createdAt: string
  isVerified: boolean
}

export interface BusinessDetail {
  id: number
  name: string
  slug: string
  categoryName: string
  description: string | null
  contactPhone: string | null
  contactWhatsApp: string | null
  contactEmail: string | null
  address: string | null
  city: string | null
  logoUrl: string | null
  coverUrl: string | null
  websiteUrl: string | null
  businessHours: string | null
  isPublished: boolean
  isActive: boolean
  subscriptionExpiresOn: string | null
  averageRating: number
  productCount: number
  testimonials: Testimonial[]
}

export interface ProductReview {
  id: number
  customerName: string
  rating: number
  reviewText: string | null
  createdAt: string
  isVerified: boolean
}

export interface ProductReviewsResult {
  averageRating: number
  total: number
  reviews: ProductReview[]
}

export interface ReviewEligibility {
  eligible: boolean
  reason: string | null
  deliveredCount: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number | null
  isActive: boolean
  isApproved: boolean
  stockQuantity: number
  images: string[]
  videos: { id: number; url: string; title: string | null }[]
  averageRating: number
  reviewCount: number
}

export interface ProductSearchItem {
  id: number
  name: string
  description: string | null
  price: number | null
  stockQuantity: number
  imageUrl: string | null
  businessId: number
  businessName: string
  businessSlug: string
  averageRating: number
  reviewCount: number
}

export interface ProductDetailInfo {
  id: number
  name: string
  description: string | null
  price: number | null
  stockQuantity: number
  images: string[]
  videos: { id: number; url: string; title: string | null }[]
  businessId: number
  businessName: string
  businessSlug: string
  categoryName: string
  city: string | null
  logoUrl: string | null
  contactPhone: string | null
  contactWhatsApp: string | null
}

export interface Plan {
  name: string
  months: number
  amount: number
  description: string
  productLimit?: number | null
}

export interface Subscription {
  id: number
  businessId: number
  businessName: string
  planName: string
  amount: number
  paymentMethod: string | null
  paymentStatus: string
  startDate: string
  endDate: string
  transactionRef: string | null
  notes: string | null
}

export interface Enquiry {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
  businessName: string
}

export interface Announcement {
  id: number
  title: string
  message: string | null
  audience: string | null
  createdAt: string
}

export interface AdminDashboard {
  totalUsers: number
  totalBusinesses: number
  activeBusinesses: number
  pendingBusinesses: number
  pendingProducts: number
  pendingTestimonials: number
  unreadEnquiries: number
  activeSubscriptions: number
  expiringSoon: number
  expiredListings: number
  pendingPayments: number
  monthlyRevenue: number
}

export interface AdminBusinessListItem {
  id: number
  name: string
  slug: string
  categoryName: string
  ownerEmail: string
  city: string | null
  isActive: boolean
  isPublished: boolean
  subscriptionExpiresOn: string | null
  createdAt: string
}

export interface AdminProductListItem {
  id: number
  name: string
  description: string | null
  price: number | null
  imageUrl: string | null
  businessId: number
  businessName: string
  ownerEmail: string
  isActive: boolean
  isApproved: boolean
  createdAt: string
}

export interface ExpiringBusiness {
  id: number
  name: string
  categoryName: string
  city: string | null
  ownerEmail: string
  subscriptionExpiresOn: string | null
  daysLeft: number
}

export interface PendingPayment {
  id: number
  businessId: number
  businessName: string
  ownerEmail: string
  planName: string
  amount: number
  startDate: string
  endDate: string
  createdAt: string
}

export interface OrderItemInfo {
  id: number
  productId: number
  productName: string
  businessId: number
  businessName: string
  unitPrice: number
  quantity: number
  imageUrl: string | null
  reviewedByMe: boolean
}

export interface OrderInfo {
  id: number
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  deliveryName: string | null
  deliveryPhone: string | null
  deliveryAddress: string | null
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItemInfo[]
}

export interface NotificationInfo {
  id: number
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface SoldPerProduct {
  productId: number
  productName: string
  imageUrl: string | null
  soldToday: number
  soldThisMonth: number
  soldThisYear: number
  revenueToday: number
  revenueThisMonth: number
  revenueThisYear: number
}

export interface SoldSummary {
  soldToday: number
  soldThisMonth: number
  soldThisYear: number
  revenueToday: number
  revenueThisMonth: number
  revenueThisYear: number
  products: SoldPerProduct[]
}

export interface SoldPeriodPoint {
  key: string
  units: number
  revenue: number
}

export interface SoldByPeriod {
  monthly: SoldPeriodPoint[]
  quarterly: SoldPeriodPoint[]
  yearly: SoldPeriodPoint[]
}
