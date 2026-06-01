/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Restaurant {
  id: string;
  ownerUid: string;
  slug: string;
  name: string;
  logo: string;
  cover: string;
  phoneNumber: string;
  currency: string;
  address: string;
  subscriptionType: 'free' | 'premium' | 'enterprise';
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  viewsCount: number;
  whatsappOrdersCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isDiscounted?: boolean;
  discountPrice?: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  badge?: string; // e.g., "HOT", "NEW", "MUST_TRY"
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
