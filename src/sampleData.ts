/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Restaurant, Category, Product } from './types';

export const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: 'demo-burger-palace',
    ownerUid: 'system-demo',
    slug: 'burger-palace',
    name: 'برجر بالاس - Burger Palace',
    logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop&q=80',
    phoneNumber: '+201000000000',
    currency: 'EGP',
    address: 'شارع المعز، القاهرة',
    subscriptionType: 'premium',
    welcomeTitle: 'أهلاً بكم في برجر بالاس',
    welcomeSubtitle: 'استمتع بألذ أنواع البرجر المحضر طازجاً يومياً من أجود لحوم الأنجوس العضوية مع خلطتنا السرية المميزة.',
    viewsCount: 1240,
    whatsappOrdersCount: 382,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-shawarma-delight',
    ownerUid: 'system-demo',
    slug: 'shawarma-delight',
    name: 'شاورما ديلايت - Shawarma Delight',
    logo: 'https://images.unsplash.com/photo-1642686335162-4d0eb6a4445c?w=200&h=200&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&h=400&fit=crop&q=80',
    phoneNumber: '+966500000000',
    currency: 'SAR',
    address: 'طريق الملك فهد، الرياض',
    subscriptionType: 'enterprise',
    welcomeTitle: 'أهلاً بكم في شاورما ديلايت',
    welcomeSubtitle: 'المذاق الشامي الأصلي على أصوله! نعتمد على دجاج ولحوم بلدية طازجة، خبز صاج ساخن، وثومية خرافية.',
    viewsCount: 4320,
    whatsappOrdersCount: 1195,
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_CATEGORIES: Record<string, Category[]> = {
  'demo-burger-palace': [
    { id: 'bp-cat-1', name: 'الأكثر مبيعاً 🔥', order: 1, isActive: true },
    { id: 'bp-cat-2', name: 'سندوتشات البرجر 🍔', order: 2, isActive: true },
    { id: 'bp-cat-3', name: 'المقبلات والأطباق الجانبية 🍟', order: 3, isActive: true },
    { id: 'bp-cat-4', name: 'المشروبات والحلويات 🥤', order: 4, isActive: true }
  ],
  'demo-shawarma-delight': [
    { id: 'sd-cat-1', name: 'وجبات شاورما عربي 🌯', order: 1, isActive: true },
    { id: 'sd-cat-2', name: 'سندوتشات فردية 🥪', order: 2, isActive: true },
    { id: 'sd-cat-3', name: 'أطباق ومقبلات 🧆', order: 3, isActive: true },
    { id: 'sd-cat-4', name: 'العصائر والمشروبات 🍹', order: 4, isActive: true }
  ]
};

export const SAMPLE_PRODUCTS: Record<string, Product[]> = {
  'demo-burger-palace': [
    {
      id: 'bp-prod-1',
      name: 'تربل تشيز برجر',
      description: 'ثلاث طبقات من لحم الأنجوس المشوي على اللهب، مع ثلاث شرائح من جبنة الشيدر الذائبة، خس، طماطم، مخلل، وصلصة برجر الخاصة.',
      price: 185,
      originalPrice: 220,
      isDiscounted: true,
      discountPrice: 185,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-1',
      isAvailable: true,
      badge: 'الأكثر طلباً',
      order: 1
    },
    {
      id: 'bp-prod-2',
      name: 'سموكي باربكيو برجر',
      description: 'شريحة لحم مشوية بعناية مغطاة بقطعة لحم مقدد مقرمشة، بصل مكرمل، جبنة شيدر، وصلصة الباربكيو المدخنة الفاخرة.',
      price: 160,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-2',
      isAvailable: true,
      badge: 'جديد',
      order: 2
    },
    {
      id: 'bp-prod-3',
      name: 'كلاسيك برجر دبل',
      description: 'شريحتان من اللحم المفروم الطازج مع الخس الطازج، المخلل المقرمش، بصل، وجبنة أمريكية تذوب بلطف.',
      price: 140,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-2',
      isAvailable: true,
      order: 3
    },
    {
      id: 'bp-prod-4',
      name: 'أصابع الموزاريلا المقرمشة',
      description: 'خمس قطع من أصابع جبنة الموزاريلا المتبلة والمغطاة بفتات الخبز الذهبي والمقلي، تقدم مع صلصة المارينارا الغنية.',
      price: 75,
      image: 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-3',
      isAvailable: true,
      order: 4
    },
    {
      id: 'bp-prod-5',
      name: 'البطاطس الحلزونية المبهّرة',
      description: 'بطاطس مقطعة بشكل لولبي جذاب ومتبلة بخلطة البهارات الخاصة مع رشة من البابريكا المدخنة.',
      price: 55,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-3',
      isAvailable: true,
      badge: 'مميز',
      order: 5
    },
    {
      id: 'bp-prod-6',
      name: 'ميلك شيك الشوكولاتة واللوتس',
      description: 'مزيج كريمي بارد غني بالآيس كريم الفانيليا ونوتيلا اللذيذة مع قطع بسكويت اللوتس المقرمش الكرانشي.',
      price: 80,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-4',
      isAvailable: true,
      order: 6
    },
    {
      id: 'bp-prod-7',
      name: 'كوكاكولا باردة',
      description: 'مشروب غازي مثلج منعش مضاف إليه شريحة ليمون طازجة للاستمتاع بالطعم الأصلي.',
      price: 30,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80',
      categoryId: 'bp-cat-4',
      isAvailable: true,
      order: 7
    }
  ],
  'demo-shawarma-delight': [
    {
      id: 'sd-prod-1',
      name: 'وجبة دبل عربي دجاج فاخرة',
      description: 'حبتا شاورما دجاج حجم وسط مقطعة لقطع صغيرة، تقدم في بوكس مميز مع بطاطس مقلية، مخلل، ثوميتنا الخاصة الكثيفة وحلقات بصل.',
      price: 32,
      originalPrice: 40,
      isDiscounted: true,
      discountPrice: 32,
      image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-1',
      isAvailable: true,
      badge: 'المرتبة الأولى',
      order: 1
    },
    {
      id: 'sd-prod-2',
      name: 'وجبة اللحم الشامي الأصلي',
      description: 'رول شاورما لحم عجل بلدي بالخلطة الشامية مضاف إليه البقدونس، الطماطم البصل، صلصة الطحينة ومخلل لفت رائع.',
      price: 38,
      image: 'https://images.unsplash.com/photo-1642686335162-4d0eb6a4445c?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-1',
      isAvailable: true,
      order: 2
    },
    {
      id: 'sd-prod-3',
      name: 'سندوتش شاورما دجاج صاج جامبو',
      description: 'خبز صاج شامي طازج محشو بشهب صدور دجاج مشوية، مخلل خيار مالح، ومسحة كريمة الثوم الشهية.',
      price: 14,
      image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-2',
      isAvailable: true,
      badge: 'صاج ساخن',
      order: 3
    },
    {
      id: 'sd-prod-4',
      name: 'سندوتش شاورما لحم صاروخ',
      description: 'حجم عائلي مشبع مليئ بشرائح اللحم المتبل والبهارات العطرة وسلطة البيواز مع الطحينة التركية.',
      price: 18,
      image: 'https://images.unsplash.com/photo-1642686335162-4d0eb6a4445c?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-2',
      isAvailable: true,
      order: 4
    },
    {
      id: 'sd-prod-5',
      name: 'بطاطس مقلية مع الصوص والجبن',
      description: 'طبق بطاطس مقلوبة ذهبية مقرمشة ساخنة مغطاة بالكامل بجبنة شيدر سائلة وصوص شاورما ديلايت المميز ورش بقدونس.',
      price: 15,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-3',
      isAvailable: true,
      order: 5
    },
    {
      id: 'sd-prod-6',
      name: 'كوب ثومية إضافي',
      description: 'صلصة الثوم المتميزة المحضرة يدوياً بنكهة غنية مثالية للتغميس.',
      price: 3,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-3',
      isAvailable: true,
      order: 6
    },
    {
      id: 'sd-prod-7',
      name: 'امبرطور رمان طبيعي طازج',
      description: 'عصير رمان فريش صحي ولذيذ مع حبيبات الرمان اللامعة لموازنة نكهات الشاورما.',
      price: 12,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80',
      categoryId: 'sd-cat-4',
      isAvailable: true,
      order: 7
    }
  ]
};
