export type Department =
  | 'mobiles-tablets'
  | 'laptops-computing'
  | 'mobile-accessories'
  | 'audio-wearables'
  | 'heating-cooling'
  | 'home-kitchen';

export type ProductType = 'smartphone' | 'laptop' | 'accessory' | 'appliance';

export interface ProductVariant {
  ramStorage: string;
  color: string;
  price: number;
  stock: number;
}

export interface TechSpecs {
  display?: string;
  processor?: string;
  gpu?: string;
  rearCamera?: string;
  frontCamera?: string;
  battery?: string;
  os?: string;
  supports5G?: boolean;
  isGaming?: boolean;
}

export interface CustomSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brandSlug: string;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  department: Department;
  productType: ProductType;
  basePrice: number;
  originalPrice?: number;
  inStock: boolean;
  isFeatured?: boolean;
  emiAvailable?: boolean;
  imageUrl?: string;
  warrantyInfo?: string;
  summary?: string;
  variants?: ProductVariant[];
  specs?: TechSpecs;
  customSpecs?: CustomSpec[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type MobileBrandTier = 'global-leaders' | 'budget-emerging' | 'niche-gaming';
export type LaptopBrandTier = 'major-global' | 'gaming' | 'budget-niche';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  deviceTypes: ('mobile' | 'laptop' | 'electronics')[];
  tier?: MobileBrandTier;
  subBrands?: string;
  laptopTier?: LaptopBrandTier;
  laptopLineups?: string;
  gamingDivisionName?: string;
  gamingLineups?: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  department: Department;
  description?: string;
  sortOrder: number;
}

export type PostType = 'Tech News' | 'Review' | 'Buying Guide' | 'Price List';

export interface Post {
  id: string;
  title: string;
  slug: string;
  postType: PostType;
  status: 'draft' | 'published';
  authorName?: string;
  readTime?: string;
  featuredImageUrl?: string;
  excerpt?: string;
  content: string;
  relatedProductSlugs?: string[];
  publishedAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  imageUrl?: string;
  variantIndex?: number;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
}

export type PaymentMethod = 'esewa' | 'khalti' | 'bank_transfer' | 'cod';

export interface OrderItem {
  productId: string;
  title: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryZone: 'kathmandu-valley' | 'outside-valley';
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentRef?: string;
  createdAt?: unknown;
}

export interface ExchangeRequest {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  currentDevice: string;
  condition: 'Mint / Like New' | 'Good (Minor Wear)' | 'Fair (Visible Scratches)';
  targetProductSlug?: string;
  estimatedValue?: number;
  status: 'pending' | 'reviewed' | 'approved' | 'completed';
  createdAt?: unknown;
}

export interface SiteSettings {
  id: string;
  storeName: string;
  announcementBar?: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroCtaLink?: string;
  whatsappNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'store-manager' | 'editor';
}
