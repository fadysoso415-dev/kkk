/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Restaurant {
  id: string;
  ownerUid: string;
  slug: string;
  name: string;
  nameEn?: string;
  logo: string;
  cover: string;
  phoneNumber: string;
  currency: string;
  currencyEn?: string;
  address: string;
  addressEn?: string;
  subscriptionType: 'free' | 'premium' | 'enterprise';
  welcomeTitle?: string;
  welcomeTitleEn?: string;
  welcomeSubtitle?: string;
  welcomeSubtitleEn?: string;
  viewsCount: number;
  whatsappOrdersCount: number;
  createdAt: string;
  primaryColor?: string;
  backgroundColor?: string;
  themePreset?: 'amber' | 'emerald' | 'rose' | 'indigo' | 'slate' | 'violet' | 'dark' | 'autumn' | 'coffee';
  enableEnglish?: boolean;
  whatsappNumber?: string;
  whatsappLinkType?: 'api' | 'web' | 'wa_me';
  whatsappGreetingText?: string;
  whatsappGreetingTextEn?: string;
  whatsappUseCustomNumber?: boolean;
  enableAutoInventory?: boolean;
  enableQuickFilters?: boolean;
  qf1Active?: boolean;
  qf1Name?: string;
  qf1Icon?: string;
  qf1Keywords?: string;
  qf2Active?: boolean;
  qf2Name?: string;
  qf2Icon?: string;
  qf2Keywords?: string;
  qf3Active?: boolean;
  qf3Name?: string;
  qf3Icon?: string;
  qf3Keywords?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  isActive: boolean;
}

export interface ProductSize {
  id: string;
  name: string;
  nameEn?: string;
  priceAdded: number; // extra cost added to base price
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  isDiscounted?: boolean;
  discountPrice?: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  badge?: string; // e.g., "HOT", "NEW", "MUST_TRY"
  badgeEn?: string;
  order: number;
  discountLabel?: string;
  discountExpiry?: string;
  sizes?: ProductSize[];
  trackInventory?: boolean;
  stockQuantity?: number;
  alertLowStock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedSize?: ProductSize;
}

export interface ContactMessage {
  name: string;
  email: string;
  restaurantName?: string;
  message: string;
  submittedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string; // selected size name
}

export interface Order {
  id?: string;
  tableName: string;
  items: OrderItem[];
  totalPrice: number;
  notes?: string;
  timestamp: string; // ISO string timestamps
  createdAt: string;
  status?: 'pending' | 'preparing' | 'completed';
  isSettled?: boolean;
  settledAt?: string;
}

export interface ViewLog {
  id?: string;
  timestamp: string;
  device: 'iPhone' | 'Android' | 'Desktop' | 'Other';
  userAgent: string;
  referrer: string;
}

export interface Shift {
  id?: string;
  closedAt: string;
  totalOrders: number;
  totalSales: number;
  settledSales: number;
  unsettledSales: number;
  employeeName?: string;
}
