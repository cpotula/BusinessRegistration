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

export interface Product {
  id: number
  name: string
  description: string | null
  price: number | null
  isActive: boolean
  images: string[]
  videos: { id: number; url: string; title: string | null }[]
}

export interface ProductSearchItem {
  id: number
  name: string
  description: string | null
  price: number | null
  imageUrl: string | null
  businessId: number
  businessName: string
  businessSlug: string
}

export interface ProductDetailInfo {
  id: number
  name: string
  description: string | null
  price: number | null
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
