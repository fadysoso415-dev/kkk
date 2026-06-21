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
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  isActive: boolean;
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
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
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
}

export interface ViewLog {
  id?: string;
  timestamp: string;
  device: 'iPhone' | 'Android' | 'Desktop' | 'Other';
  userAgent: string;
  referrer: string;
}
