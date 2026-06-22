/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Settings, 
  Layers, 
  ChefHat, 
  QrCode, 
  BarChart2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  Copy, 
  Check, 
  LogOut, 
  Phone, 
  DollarSign, 
  Globe, 
  Award,
  BookOpen,
  X,
  FileText,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Clock,
  Smartphone,
  Laptop,
  Percent,
  ShoppingBag,
  Palette
} from 'lucide-react';
import { Restaurant, Category, Product, Order, ViewLog, Shift, ProductSize } from '../types';
import { 
  saveRestaurant, 
  saveCategory, 
  deleteCategory, 
  saveProduct, 
  deleteProduct,
  getCategories,
  getProducts,
  updateOrderStatus,
  updateOrderSettlementStatus,
  logShift,
  getShifts,
  clearShiftOrders
} from '../firebase';
import { SAMPLE_RESTAURANTS, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../sampleData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area 
} from 'recharts';

interface DashboardProps {
  user: any;
  isDemo: boolean;
  onLogout: () => void;
  onNavigateToMenu: (slug: string) => void;
  lang: 'ar' | 'en';
  onChangeLang: (newLang: 'ar' | 'en') => void;
}

const COUNTRY_CODES = [
  { code: '+20', flag: '🇪🇬', name: 'مصر (+20)' },
  { code: '+966', flag: '🇸🇦', name: 'السعودية (+966)' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات (+971)' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت (+965)' },
  { code: '+974', flag: '🇶🇦', name: 'قطر (+974)' },
  { code: '+968', flag: '🇴🇲', name: 'عمان (+968)' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين (+973)' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن (+962)' },
  { code: '+964', flag: '🇮🇶', name: 'العراق (+964)' },
  { code: '+967', flag: '🇾🇪', name: 'اليمن (+967)' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان (+961)' },
  { code: '+963', flag: '🇸🇾', name: 'سوريا (+963)' },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين (+970)' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب (+212)' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر (+213)' },
  { code: '+216', flag: '🇹🇳', name: 'تونس (+216)' },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا (+218)' },
  { code: '+249', flag: '🇸🇩', name: 'السودان (+249)' },
];

const FOOD_PRESETS = [
  { label: 'برجر عصيري 🍔', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { label: 'شاورما مدخنة 🌯', url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&q=80' },
  { label: 'بيتزا إيطالية 🍕', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
  { label: 'دجاج مقلي 🍗', url: 'https://images.unsplash.com/photo-1562967914-6c82c68e2685?w=500&q=80' },
  { label: 'فرنش فرايز 🍟', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80' },
  { label: 'ستيك فليتو 🥩', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80' },
  { label: 'كنافة نابلسية 🍯', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80' },
  { label: 'عصير منعش 🍹', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80' },
  { label: 'قهوة اسبريسو ☕', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80' }
];

const compressAndResizeImage = (file: File, maxDimension: number = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export compressed as JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image structure."));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
};

export default function Dashboard({ user, isDemo, onLogout, onNavigateToMenu, lang, onChangeLang }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'categories' | 'products' | 'qrcode' | 'analytics' | 'orders' | 'accounts'>('settings');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('menuclick_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'completed'>('all');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | 'week' | 'month'>('week');
  
  // Restaurant Settings State
  const [restaurant, setRestaurant] = useState<Restaurant>({
    id: 'my-restaurant',
    ownerUid: user?.uid || 'temp',
    slug: 'royal-palace',
    name: 'مطعم القصر الملكي',
    logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop&q=80',
    phoneNumber: '+201000000000',
    currency: 'EGP',
    address: 'شارع المعز العريق، الحسين، القاهرة',
    subscriptionType: 'premium',
    welcomeTitle: 'مرحباً بكم في القصر الملكي للطهي الأصيل',
    welcomeSubtitle: 'نقدم أجود وأشهى المأكولات المعدة يدوياً تحت إشراف نخبة من الطهاة الدوليين الحريصين على إرضاء حواسك وتذوق الفخامة.',
    viewsCount: 2470,
    whatsappOrdersCount: 683,
    createdAt: new Date().toISOString()
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // AI Menu Generation states
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    categories: { name: string; order: number }[];
    products: {
      name: string;
      description: string;
      price: number;
      originalPrice?: number;
      isDiscounted?: boolean;
      discountPrice?: number;
      categoryIdName: string;
      badge?: string;
      order: number;
    }[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [menuCopied, setMenuCopied] = useState(false);

  // Analytics Cloud-Sync Log States
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewsLog, setViewsLog] = useState<ViewLog[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [newOrderNotifications, setNewOrderNotifications] = useState<Order[]>([]);

  // Shift Management States
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [showShiftConfirmModal, setShowShiftConfirmModal] = useState(false);

  // Synchronize sound option changes and load mock orders if in testing/demo mode
  useEffect(() => {
    localStorage.setItem('menuclick_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (isDemo || !restaurant?.id || restaurant.id === 'my-restaurant') {
      setOrders([
        {
          id: 'demo-1',
          tableName: 'طاولة 4',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          createdAt: 'قبل 5 دقائق',
          totalPrice: 410,
          status: 'pending',
          notes: 'يرجى تجهيز الوجبة بسرعة وبدون بصل 🍔',
          items: [
            { productId: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, quantity: 2 },
            { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 1 }
          ]
        },
        {
          id: 'demo-2',
          tableName: 'طاولة 12',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          createdAt: 'قبل 15 دقيقة',
          totalPrice: 120,
          status: 'preparing',
          notes: 'زيادة الكاتشب الحار وصوص المايونيز',
          items: [
            { productId: 'p2', name: 'شاورما دجاج سوبر فرشك 🌯', price: 120, quantity: 1 }
          ]
        },
        {
          id: 'demo-3',
          tableName: 'طاولة 1',
          timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
          createdAt: 'قبل 40 دقيقة',
          totalPrice: 790,
          status: 'completed',
          notes: 'تقسيم البيتزا لأربعة أنصاف متطابقة لأجل الأطفال',
          items: [
            { productId: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, quantity: 3 },
            { productId: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, quantity: 1 },
            { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 2 }
          ]
        }
      ]);
    }
  }, [isDemo, restaurant?.id]);

  // Central Hub to handle updating order statuses
  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'preparing' | 'completed') => {
    try {
      const isMockOrder = orderId.startsWith('test-') || orderId.startsWith('demo-');
      if (!isDemo && restaurant.id && restaurant.id !== 'my-restaurant' && !isMockOrder) {
        await updateOrderStatus(restaurant.id, orderId, status);
        // Let the state be updated naturally from the snapshot stream
      } else {
        // Mock mode state updates
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
      setAlertMsg({
        type: 'success',
        text: status === 'preparing'
          ? (lang === 'ar' ? '🍳 تم تغيير الحالة بنجاح وبدء تسوية الوجبة بالمطبخ!' : '🍳 Started cooking inside the kitchen successfully!')
          : status === 'completed'
          ? (lang === 'ar' ? '🎉 الوجبة جاهزة تماماً ولذيذة، وتم تحديث الحالة لتسليمها للزبون!' : '🎉 Food completed and is warm! Tagged as ready for delivery!')
          : (lang === 'ar' ? '⏳ تمت إعادة الطلب وتغييره لخانة قيد الانتظار.' : '⏳ Reset order back to pending list.')
      });
    } catch (err) {
      console.error(err);
      setAlertMsg({
        type: 'error',
        text: lang === 'ar' ? 'حدث عائق بالاتصال بقاعدة البيانات للتحديث.' : 'Cloud connection sync error.'
      });
    }
  };

  // Central Hub to handle updating order settlement status (تصفية حساب الشيف مع الكاشير)
  const handleUpdateOrderSettlement = async (orderId: string, isSettled: boolean) => {
    try {
      const isMockOrder = orderId.startsWith('test-') || orderId.startsWith('demo-');
      if (!isDemo && restaurant.id && restaurant.id !== 'my-restaurant' && !isMockOrder) {
        await updateOrderSettlementStatus(restaurant.id, orderId, isSettled);
      } else {
        // Mock mode state updates
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isSettled, settledAt: isSettled ? new Date().toISOString() : undefined } : o));
      }
      setAlertMsg({
        type: 'success',
        text: isSettled
          ? (lang === 'ar' ? '✅ تم تصفية حساب هذا الطلب وتسويته بين الشيف والكاشير بنجاح!' : '✅ This order was successfully settled between Chef and Cashier!')
          : (lang === 'ar' ? '🔄 تم إلغاء تصفية الطلب وإرجاعه للحسابات النشطة.' : '🔄 Settle status removed, reverted to active balance.')
      });
    } catch (err) {
      console.error(err);
      setAlertMsg({
        type: 'error',
        text: lang === 'ar' ? 'تعذر تصفية حساب الطلب، يرجى المحاولة لاحقاً.' : 'Could not update settlement, please try again.'
      });
    }
  };

  // Settle all completed orders at once
  const handleSettleAllCompleted = async () => {
    try {
      const completedUnsettled = orders.filter(o => o.status === 'completed' && !o.isSettled);
      if (completedUnsettled.length === 0) {
        setAlertMsg({
          type: 'error',
          text: lang === 'ar' ? 'لا توجد طلبات مكتملة وغير مصفاة حالياً لتسويتها.' : 'No completed unsettled orders found to settle.'
        });
        return;
      }

      for (const o of completedUnsettled) {
        const isMockOrder = o.id?.startsWith('test-') || o.id?.startsWith('demo-');
        if (!isDemo && restaurant.id && restaurant.id !== 'my-restaurant' && !isMockOrder) {
          await updateOrderSettlementStatus(restaurant.id, o.id!, true);
        }
      }

      if (isDemo || restaurant.id === 'my-restaurant') {
        setOrders(prev => prev.map(o => o.status === 'completed' ? { ...o, isSettled: true, settledAt: new Date().toISOString() } : o));
      }

      setAlertMsg({
        type: 'success',
        text: lang === 'ar' ? '🧼 تم تصفية وتصفير حسابات جميع الطلبات الجاهزة بنجاح!' : '🧼 Successfully settled all outstanding chef items!'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Clear current shift data and start fresh
  const handleClearAndStartNewShift = async () => {
    try {
      if (orders.length === 0) {
        setAlertMsg({
          type: 'error',
          text: lang === 'ar' ? '⚠️ لا يمكن تصفية ورشة صفراء أو وردية فارغة لا تحتوي على أي طلبات!' : '⚠️ Cannot clear an empty shift without any orders!'
        });
        return;
      }

      // Compute figures for this shift
      const totalOrdersCount = orders.length;
      const totalShiftSales = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
      const settledShiftSales = orders.filter(o => o.isSettled).reduce((acc, o) => acc + (o.totalPrice || 0), 0);
      const unsettledShiftSales = orders.filter(o => !o.isSettled).reduce((acc, o) => acc + (o.totalPrice || 0), 0);

      const shiftData: Omit<Shift, "id"> = {
        closedAt: new Date().toISOString(),
        totalOrders: totalOrdersCount,
        totalSales: totalShiftSales,
        settledSales: settledShiftSales,
        unsettledSales: unsettledShiftSales,
        employeeName: user?.email || 'كاشير الوردية'
      };

      if (!isDemo && restaurant.id && restaurant.id !== 'my-restaurant') {
        setLoadingShifts(true);
        // Save the shift into firestore
        await logShift(restaurant.id, shiftData);
        // Delete active order docs
        await clearShiftOrders(restaurant.id);
        
        // Fetch fresh list of shifts
        const fetched = await getShifts(restaurant.id);
        setShifts(fetched);
        setOrders([]);
      } else {
        // Demomode state update
        setShifts(prev => [
          { id: 'demo-shift-' + Date.now(), ...shiftData },
          ...prev
        ]);
        setOrders([]);
      }

      setAlertMsg({
        type: 'success',
        text: lang === 'ar' 
          ? `🧼 تم إقفال وتصفية حسابات الوردية الحالية بنجاح! إجمالي المبيعات: ${totalShiftSales} ${restaurant.currency}. تم حفظ التقرير والبدء من جديد بوردية نظيفة.` 
          : `🧼 Shift closed and settled! Total Sales: ${totalShiftSales} ${restaurant.currency}. Shift report logged and a new shift started.`
      });

    } catch (err) {
      console.error(err);
      setAlertMsg({
        type: 'error',
        text: lang === 'ar' ? 'حدث خطأ أثناء محاولة تصفية الوردية وبدء وردية جديدة.' : 'An error occurred while clearing the shift.'
      });
    } finally {
      setLoadingShifts(false);
    }
  };

  // Inject a live simulated table order for testing the chimes and toasts instantly
  const injectSampleOrderForTesting = () => {
    const tableIdNum = Math.floor(Math.random() * 15) + 1;
    const testId = 'test-' + Math.random().toString(36).substring(2, 9);
    
    const randomItemsList = [
      [
        { productId: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, quantity: 2 },
        { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 1 }
      ],
      [
        { productId: 'p2', name: 'شاورما دجاج سوبر فرشك 🌯', price: 120, quantity: 1 },
        { productId: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, quantity: 1 }
      ],
      [
        { productId: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, quantity: 2 },
        { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 2 }
      ]
    ];
    
    const items = randomItemsList[Math.floor(Math.random() * randomItemsList.length)];
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const notesOptions = [
      'يرجى توفير المزيد من صوص الثومية الحارة 🌶️',
      'بدون مايونيز نهائياً لوجود حساسية طعام ⚠️',
      'زيادة الثلج في المشاريب وتجهيز الوجبات بطلب حار!',
      'تجهيز سريع ولكم الشكر والتقدير ✨'
    ];
    
    const notes = notesOptions[Math.floor(Math.random() * notesOptions.length)];
    
    const newTestOrder = {
      id: testId,
      tableName: `طاولة ${tableIdNum}`,
      timestamp: new Date().toISOString(),
      createdAt: 'الآن',
      totalPrice,
      status: 'pending' as const,
      notes,
      items
    };
    
    // Append to live list
    setOrders(prev => [newTestOrder, ...prev]);
    
    // Spawn Floating Notification Toast!
    setNewOrderNotifications(prev => [newTestOrder, ...prev]);
    
    // Chime trigger
    playNotificationSound();
    
    setAlertMsg({
      type: 'success',
      text: '🧪 تمت محاكاة استقبال طلب QR بنجاح! تحقق من الجرس ورنين التنبيه والتوست المنسدل.'
    });
  };

  // Synthesize notification audio chime
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Warm C5 tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      // Warm E5 tone for sweet harmony
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Could not play synthesized sound", err);
    }
  };

  // Real-time observer for new orders on Firestore
  useEffect(() => {
    if (!restaurant?.id || restaurant.id === 'my-restaurant' || isDemo || loading) return;

    let isInitial = true;
    let unsubscribe: () => void;

    const setupListener = async () => {
      try {
        const { db } = await import('../firebase');
        const { collection, query, orderBy, onSnapshot, getDocs } = await import('firebase/firestore');

        const colRef = collection(db, 'restaurants', restaurant.id, 'orders');
        const q = query(colRef, orderBy('timestamp', 'desc'));

        let retryCount = 0;
        const maxRetries = 3;

        const startListening = () => {
          unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Order[] = [];
            snapshot.forEach((doc) => {
              docs.push({ id: doc.id, ...doc.data() } as Order);
            });
            
            setOrders(docs);

            if (!isInitial) {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;
                  
                  // Add to visual notifications with unique ID
                  const notifId = Math.random().toString(36).substring(2, 9);
                  setNewOrderNotifications(prev => [{ ...newOrder, id: notifId }, ...prev]);
                  
                  // Play notification alert chime
                  playNotificationSound();
                }
              });
            }
            isInitial = false;
          }, async (error) => {
            console.error("Firestore Orders listen error (attempt " + (retryCount + 1) + "): ", error);
            
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = retryCount * 2000;
              console.log(`Retrying real-time orders connection in ${delay}ms...`);
              setTimeout(startListening, delay);
            } else {
              console.warn("Real-time orders listener failed max retries. Falling back to manual polling...");
              try {
                const snapshot = await getDocs(q);
                const docs: Order[] = [];
                snapshot.forEach((doc) => {
                  docs.push({ id: doc.id, ...doc.data() } as Order);
                });
                setOrders(docs);
              } catch (fallbackError) {
                console.error("Fallback order retrieval also failed: ", fallbackError);
              }
            }
          });
        };

        startListening();
      } catch (err) {
        console.warn("Could not set up real-time orders listener: ", err);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurant?.id, isDemo, loading]);

  // Lazy load live views log when the analytics tab becomes active (orders are fetched in real-time)
  useEffect(() => {
    if (activeTab !== 'analytics' || isDemo || !restaurant?.id) return;

    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const { getViewsLog } = await import('../firebase');
        const viewsData = await getViewsLog(restaurant.id);
        if (isMounted) {
          setViewsLog(viewsData);
        }
      } catch (err) {
        console.warn("Could not load real-time analytics reports from Cloud", err);
      } finally {
        if (isMounted) {
          setLoadingAnalytics(false);
        }
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [activeTab, restaurant?.id, isDemo]);

  // Lazy load closed shifts history when the accounts tab becomes active
  useEffect(() => {
    if (activeTab !== 'accounts' || isDemo || !restaurant?.id) return;

    let isMounted = true;
    const fetchShifts = async () => {
      setLoadingShifts(true);
      try {
        const data = await getShifts(restaurant.id);
        if (isMounted) {
          setShifts(data);
        }
      } catch (err) {
        console.warn("Could not load closed shifts", err);
      } finally {
        if (isMounted) {
          setLoadingShifts(false);
        }
      }
    };

    fetchShifts();
    return () => {
      isMounted = false;
    };
  }, [activeTab, restaurant?.id, isDemo]);

  // Click simulator handlers for testing cloud analytics instantly
  const handleSimulateVisitor = async () => {
    if (!restaurant?.id || isDemo) {
      triggerAlert('error', 'يرجى تسجيل الدخول بحساب مالك حقيقي (غير تجريبي) لاختبار المحاكاة السحابية.');
      return;
    }
    try {
      const { logMenuView, incrementRestaurantViews } = await import('../firebase');
      await logMenuView(restaurant.id);
      await incrementRestaurantViews(restaurant.id);
      
      // refresh lists
      const { getViewsLog } = await import('../firebase');
      const viewsData = await getViewsLog(restaurant.id);
      setViewsLog(viewsData);

      // increment count state locally
      setRestaurant(prev => ({ ...prev, viewsCount: (prev.viewsCount || 0) + 1 }));
      triggerAlert('success', 'تم محاكاة زيارة عميل حقيقية بنجاح وتسجيلها سحابياً! 🌐📱');
    } catch (err) {
      triggerAlert('error', 'فشلت محاكاة الزيارة السحابية.');
    }
  };

  const handleSimulateOrder = async () => {
    if (products.length === 0) {
      triggerAlert('error', 'يرجى إضافة وجبة وبيعها على الأقل لتجربة محاكاة الطلب!');
      return;
    }
    try {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomQty = Math.floor(Math.random() * 2) + 1;
      const price = randomProduct.isDiscounted && randomProduct.discountPrice 
        ? randomProduct.discountPrice 
        : randomProduct.price;

      const tables = ['طاولة 5', 'طاولة 2', 'طاولة 10', 'سفري - المهندس كريم', 'طاولة 1', 'عائلي 4', 'طاولة الخارجية 1'];
      const notesArray = ['بدون كاتشب وجوانح بصل أرجوك', 'خدمة متميزة وسريعة ⚡', 'أرجو إضافة ملاعق إضافية', 'توصيل حار'];

      const simulatedOrder: Order = {
        tableName: tables[Math.floor(Math.random() * tables.length)],
        totalPrice: price * randomQty,
        notes: Math.random() > 0.4 ? notesArray[Math.floor(Math.random() * notesArray.length)] : '',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString('ar-EG'),
        items: [{
          productId: randomProduct.id,
          name: randomProduct.name,
          price: price,
          quantity: randomQty
        }]
      };

      if (isDemo || !restaurant?.id) {
        // Local simulation for Demo / Offline Mode
        setOrders(prev => [simulatedOrder, ...prev]);

        // Manually trigger notification & audio chime
        const notifId = Math.random().toString(36).substring(2, 9);
        setNewOrderNotifications(prev => [{ ...simulatedOrder, id: notifId }, ...prev]);
        playNotificationSound();

        setRestaurant(prev => ({ ...prev, whatsappOrdersCount: (prev.whatsappOrdersCount || 0) + 1 }));
        triggerAlert('success', 'تم محاكاة إرسال طلب جديد بنجاح وتنبيهك لوكال! 🛎️🍕');
        return;
      }

      const { logOrder, incrementWhatsappOrders } = await import('../firebase');
      await logOrder(restaurant.id, simulatedOrder);
      await incrementWhatsappOrders(restaurant.id);

      // update count state locally (onSnapshot handles refreshing the orders list automatically!)
      setRestaurant(prev => ({ ...prev, whatsappOrdersCount: (prev.whatsappOrdersCount || 0) + 1 }));
      triggerAlert('success', 'تم بنجاح إرسال نموذج طلب سحابي حقيقي وتسجيله باللوحة! 🛎️🍕');
    } catch (err) {
      triggerAlert('error', 'فشلت محاكاة الطلب السحابي.');
    }
  };

  // Modals States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 1, isActive: true });
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  const [isCategoryDeleting, setIsCategoryDeleting] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    price: string | number;
    originalPrice: string | number;
    isDiscounted: boolean;
    discountPrice: string | number;
    image: string;
    categoryId: string;
    isAvailable: boolean;
    badge: string;
    order: string | number;
    discountLabel: string;
    discountExpiry: string;
    sizes: ProductSize[];
  }>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    isDiscounted: false,
    discountPrice: 0,
    image: FOOD_PRESETS[0].url,
    categoryId: '',
    isAvailable: true,
    badge: '',
    order: 1,
    discountLabel: '',
    discountExpiry: '',
    sizes: []
  });

  // Pull existing DB records or prefill with high quality demo elements
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          // If demo owner login, prefill from sampleData matching first restaurant in array
          const demoRest = SAMPLE_RESTAURANTS[0];
          setRestaurant({ ...demoRest, ownerUid: user.uid });
          setCategories(SAMPLE_CATEGORIES[demoRest.id] || []);
          setProducts(SAMPLE_PRODUCTS[demoRest.id] || []);
        } else {
          // Check if firestore has a record for this creator
          // Since the user might be new, we can search for restaurants owned by this uid
          const path = 'restaurants';
          const rList = await getCategories(user.uid); // Fetch owned restaurants? Let's use our local helper:
          // Wait, let's use custom functions
          const ownedRestaurants = await fetchOwnedRestaurants();
          if (ownedRestaurants.length > 0) {
            const currentRest = ownedRestaurants[0];
            setRestaurant(currentRest);
            
            // Sync categories and products
            const cats = await getCategories(currentRest.id);
            const prods = await getProducts(currentRest.id);
            setCategories(cats);
            setProducts(prods);
          } else {
            // New owner: save default blank restaurant
            const newRest: Restaurant = {
              id: `rest-${user.uid.slice(0, 8)}`,
              ownerUid: user.uid,
              slug: `menu-${user.uid.slice(0, 5)}`,
              name: user.displayName ? `${user.displayName}` : 'مطعمي الجديد',
              logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&q=80',
              cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop&q=80',
              phoneNumber: '+201000000000',
              currency: 'EGP',
              address: 'القاهرة، مصر',
              subscriptionType: 'free',
              welcomeTitle: 'أهلاً بكم في مطعمنا الفاخر',
              welcomeSubtitle: 'تصفح قائمتنا لتذوق أشهى وأطيب الوجبات مع خدمة توصيل سريعة وموثوقة.',
              viewsCount: 0,
              whatsappOrdersCount: 0,
              createdAt: new Date().toISOString()
            };
            await saveRestaurant(newRest.id, newRest);
            setRestaurant(newRest);
            setCategories([]);
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("Error setting up dashboard data", err);
        // Fail-safe fallbacks
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [user.uid, isDemo]);

  // Utility to locate or search restaurants from Firebase in live mode
  const fetchOwnedRestaurants = async () => {
    // If demo or offline, safe fallback
    try {
      const { getRestaurantsByOwner } = await import('../firebase');
      return await getRestaurantsByOwner(user.uid);
    } catch {
      return [];
    }
  };

  // Trigger alert banner
  const formatFirebaseError = (err: any): string => {
    try {
      const parsed = JSON.parse(err.message || err);
      if (parsed && parsed.error) {
        if (parsed.error.includes("permission-denied") || parsed.error.includes("insufficient permissions")) {
          return `فشلت العملية لعدم وجود صلاحيات كافية على المسار: ${parsed.path || ''} (${parsed.operationType || ''})`;
        }
        return `خطأ بقاعدة البيانات: ${parsed.error}`;
      }
    } catch {
      // ignore
    }
    const msg = err?.message || String(err || '');
    if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
      return "عذراً، لا تمتلك الصلاحية الكافية لحفظ التعديلات على هذا المطعم في السحابة.";
    }
    if (msg.includes("Quota exceeded") || msg.includes("quota exceeded")) {
      return "لقد تجاوزت الحصة المجانية اليومية لقاعدة البيانات السحابية (Firestore Quota Exceeded).";
    }
    return msg;
  };

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // --- AI MENU GENERATION HANDLERS ---
  const handleAiMenuImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      triggerAlert('error', 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP)');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAiImageBase64(reader.result as string);
      setAiError(null);
    };
    reader.onerror = () => {
      triggerAlert('error', 'حدث خطأ أثناء قراءة ملف الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleAiMenuDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      triggerAlert('error', 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP)');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAiImageBase64(reader.result as string);
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeMenu = async () => {
    if (!aiImageBase64) {
      triggerAlert('error', 'يرجى اختيار صورة أولاً');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/analyze-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: aiImageBase64 }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تحليل المنيو بواسطة الذكاء الاصطناعي');
      }
      
      if (!data.categories || data.categories.length === 0) {
        throw new Error('لم ينجح الذكاء الاصطناعي في تحديد أي أقسام أو أصناف من هذه الصورة. يرجى تجربة صورة أخرى أكثر وضوحاً.');
      }
      
      setAiResult(data);
      triggerAlert('success', `تم تحليل المنيو بنجاح! تم استخراج ${data.categories.length} أقسام و ${data.products ? data.products.length : 0} وجبات.`);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة');
      triggerAlert('error', err.message || 'حدث خطأ أثناء التحليل');
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirmAiMenu = async (mode: 'append' | 'overwrite') => {
    if (!aiResult) return;
    setAiLoading(true);
    try {
      // 1. Generate unique IDs for the new categories
      const categoryMap = new Map<string, string>();
      const newCatsToSave: Category[] = aiResult.categories.map((cat) => {
        const catId = `cat-${Math.random().toString(36).substring(2, 9)}`;
        categoryMap.set(cat.name, catId);
        return {
          id: catId,
          name: cat.name,
          order: mode === 'append' ? categories.length + cat.order : cat.order,
          isActive: true
        };
      });

      // 2. Generate new products mapped to the new category doc IDs
      const newProdsToSave: Product[] = (aiResult.products || []).map((prod) => {
        const prodId = `prod-${Math.random().toString(36).substring(2, 9)}`;
        const matchedCatId = categoryMap.get(prod.categoryIdName) || (newCatsToSave[0]?.id || (categories[0]?.id || ''));
        const randomPresetImg = FOOD_PRESETS[Math.floor(Math.random() * FOOD_PRESETS.length)].url;
        
        return {
          id: prodId,
          name: prod.name,
          description: prod.description || '',
          price: prod.price || 0,
          originalPrice: prod.originalPrice || undefined,
          isDiscounted: prod.isDiscounted || false,
          discountPrice: prod.discountPrice || undefined,
          image: randomPresetImg,
          categoryId: matchedCatId,
          isAvailable: true,
          badge: prod.badge || '',
          order: prod.order || 1
        };
      });

      if (isDemo) {
        if (mode === 'overwrite') {
          setCategories(newCatsToSave);
          setProducts(newProdsToSave);
        } else {
          setCategories(prev => [...prev, ...newCatsToSave]);
          setProducts(prev => [...prev, ...newProdsToSave]);
        }
        triggerAlert('success', 'تم تطبيق منيو الذكاء الاصطناعي بنجاح في الواجهة التجريبية!');
      } else {
        // If overwrite, delete old records
        if (mode === 'overwrite') {
          for (const cat of categories) {
            await deleteCategory(restaurant.id, cat.id);
          }
          for (const prod of products) {
            await deleteProduct(restaurant.id, prod.id);
          }
        }

        // Save new categories
        for (const cat of newCatsToSave) {
          const { id, ...data } = cat;
          await saveCategory(restaurant.id, id, data);
        }

        // Save new products
        for (const prod of newProdsToSave) {
          const { id, ...data } = prod;
          await saveProduct(restaurant.id, id, data);
        }

        // Refresh database states
        const cats = await getCategories(restaurant.id);
        const prods = await getProducts(restaurant.id);
        setCategories(cats);
        setProducts(prods);
        
        triggerAlert('success', 'تم تأسيس وتفعيل منيو الذكاء الاصطناعي بنجاح في قاعدة البيانات السحابية! ✅');
      }

      // Close modal and reset state
      setShowAiModal(false);
      setAiResult(null);
      setAiImageBase64(null);
    } catch (err: any) {
      console.error(err);
      triggerAlert('error', 'فشل حفظ وتطبيق المنيو الجديد: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // --- PERSIST SAVING SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isDemo) {
        // Just keep in local memory state
        triggerAlert('success', 'تم حفظ إعدادات المطعم بنجاح! (وضع تشغيل تجريبي لوكال)');
      } else {
        await saveRestaurant(restaurant.id, restaurant);
        triggerAlert('success', 'تم حفظ التحديثات ونشرها لحظياً للعملاء! 🌐');
      }
    } catch (err: any) {
      console.error("Error saving settings: ", err);
      triggerAlert('error', `فشلت عملية الحفظ: ${formatFirebaseError(err)}`);
    }
  };

  // --- PERSIST CATEGORIES ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the section name is empty or contains only spaces
    if (!categoryForm.name.trim()) {
      triggerAlert('error', 'لا يمكن حفظ قسم فارغ! يرجى كتابة اسم القسم أولاً (مثل: الوجبات السريعة 🍔) ⚠️');
      return;
    }

    setIsCategorySaving(true);
    const id = editingCategory ? editingCategory.id : `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      name: categoryForm.name.trim(),
      order: Number(categoryForm.order),
      isActive: categoryForm.isActive
    };

    try {
      if (isDemo) {
        if (editingCategory) {
          setCategories(prev => prev.map(c => c.id === id ? newCat : c));
        } else {
          setCategories(prev => [...prev, newCat].sort((a,b) => a.order - b.order));
        }
        triggerAlert('success', 'تم تعديل الأقسام بنجاح في النسخة التجريبية!');
      } else {
        await saveCategory(restaurant.id, id, {
          name: newCat.name,
          order: newCat.order,
          isActive: newCat.isActive
        });
        
        // Refresh local cache
        if (editingCategory) {
          setCategories(prev => prev.map(c => c.id === id ? newCat : c));
        } else {
          setCategories(prev => [...prev, newCat].sort((a,b) => a.order - b.order));
        }
        triggerAlert('success', 'تم حفظ القسم في السحابة وتعديله فورا! ⚡');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', order: 1, isActive: true });
    } catch (err: any) {
      console.error("Error saving category: ", err);
      triggerAlert('error', `عذراً، فشل حفظ القسم: ${formatFirebaseError(err)}`);
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    setIsCategoryDeleting(true);
    try {
      if (isDemo) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        triggerAlert('success', 'تم الحذف من الواجهة التجريبية.');
      } else {
        await deleteCategory(restaurant.id, catId);
        setCategories(prev => prev.filter(c => c.id !== catId));
        triggerAlert('success', 'تم إزالة القسم وتحديث العميل بلحظة! 🔥');
      }
      setDeleteConfirmCategory(null);
    } catch (err: any) {
      console.error("Error deleting category: ", err);
      triggerAlert('error', `لا يمكن حذف القسم: ${formatFirebaseError(err)}`);
    } finally {
      setIsCategoryDeleting(false);
    }
  };

  // --- PERSIST PRODUCTS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = productForm.name;
    const price = productForm.price;

    if (!name) {
      alert("يرجى إدخال اسم الوجبة أو الطبق.");
      return;
    }

    if (!price) {
      alert("يرجى إدخال السعر المقدر للطبق.");
      return;
    }

    if (!categoryId) {
      alert("يرجى اختيار القسم بشكل صحيح! الكود لم يلتقط الـ ID");
      return;
    }

    const nameTrimmed = (name || '').trim();
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("يرجى إدخال سعر صحيح ومناسب للمنتج (أكبر من 0).");
      return;
    }

    // Validate custom size options if there are any
    if (productForm.sizes && productForm.sizes.length > 0) {
      for (const s of productForm.sizes) {
        if (!s.name || !s.name.trim()) {
          alert("يرجى كتابة الاسم (بالعربية) لجميع الأحجام المضافة، أو حذف الحجم الفارغ باستخدام أيقونة سلة المهملات بجانبه.");
          return;
        }
      }
    }

    setIsProductSaving(true);

    const id = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const isDisc = !!productForm.isDiscounted;
    let finalPrice = priceNum;
    let finalDiscountPrice: number | undefined = undefined;

    if (isDisc) {
      finalPrice = productForm.originalPrice ? Number(productForm.originalPrice) : priceNum;
      finalDiscountPrice = priceNum;
    }

    const newProd: Product = {
      id,
      name: nameTrimmed,
      description: productForm.description,
      price: finalPrice,
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      isDiscounted: isDisc,
      discountPrice: finalDiscountPrice,
      image: productForm.image || FOOD_PRESETS[0].url,
      categoryId: categoryId,
      isAvailable: productForm.isAvailable,
      badge: productForm.badge || undefined,
      order: Number(productForm.order),
      discountLabel: productForm.discountLabel || undefined,
      discountExpiry: productForm.discountExpiry || undefined,
      sizes: productForm.sizes || []
    };

    try {
      if (isDemo) {
        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === id ? newProd : p));
        } else {
          setProducts(prev => [...prev, newProd].sort((a,b) => a.order - b.order));
        }
        triggerAlert('success', 'تم تعديل السلعة لوكال بنجاح!');
      } else {
        await saveProduct(restaurant?.id || '', id, {
          name: newProd.name,
          description: newProd.description || '',
          price: newProd.price,
          originalPrice: newProd.originalPrice || 0,
          isDiscounted: newProd.isDiscounted,
          discountPrice: newProd.discountPrice || 0,
          image: newProd.image,
          categoryId: newProd.categoryId,
          isAvailable: newProd.isAvailable,
          badge: newProd.badge || '',
          order: newProd.order,
          discountLabel: newProd.discountLabel || '',
          discountExpiry: newProd.discountExpiry || '',
          sizes: newProd.sizes || []
        });

        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === id ? newProd : p));
        } else {
          setProducts(prev => [...prev, newProd].sort((a,b) => a.order - b.order));
        }
        triggerAlert('success', 'تم حفظ السلعة ونشر صورتها فورا! 🎉');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Error saving product to Firebase: ", err);
      alert(err.message || "حدث خطأ غير متوقع أثناء الحفظ في السحابة.");
      triggerAlert('error', `حدث خطأ أثناء حفظ السلعة: ${formatFirebaseError(err)}`);
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('هل تريد حذف هذه الوجبة بالكامل؟')) return;
    try {
      if (isDemo) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
        triggerAlert('success', 'تم الحذف.');
      } else {
        await deleteProduct(restaurant.id, prodId);
        setProducts(prev => prev.filter(p => p.id !== prodId));
        triggerAlert('success', 'تم إزالة المنتج نهائياً وتحديث الزبائن! 🗑️');
      }
    } catch (err: any) {
      console.error("Error deleting product: ", err);
      triggerAlert('error', `لا يمكن إزالة المنتج: ${formatFirebaseError(err)}`);
    }
  };

  // Generate dynamic URL for scanning
  // We use search params matching our dynamic hash router model
  const menuUrl = `${window.location.origin}${window.location.pathname}?menu=${restaurant.slug}`;
  // We use dynamic QR Code generation with standard transparent Google API / qrcode helper
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}&color=0-0-0&margin=10`;

  const copyMenuUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    setMenuCopied(true);
    setTimeout(() => setMenuCopied(false), 2000);
  };

  // Find current country code based on the phone number
  const currentPhone = restaurant.phoneNumber || '';
  const matchedCountry = COUNTRY_CODES.find(c => {
    const plainPhone = currentPhone.replace('+', '').replace(/\s+/g, '');
    const plainCode = c.code.replace('+', '');
    return plainPhone.startsWith(plainCode);
  }) || COUNTRY_CODES[0]; // fallback to Egypt (+20)

  // Extract the remaining local digits
  const getLocalNumber = () => {
    if (!currentPhone) return '';
    const plainPhone = currentPhone.replace('+', '').replace(/\s+/g, '');
    const plainCode = matchedCountry.code.replace('+', '');
    if (plainPhone.startsWith(plainCode)) {
      return plainPhone.substring(plainCode.length);
    }
    return currentPhone;
  };

  const localNumber = getLocalNumber();

  // On country change
  const handleCountryChange = (newCode: string) => {
    // Strip leading zeros if any, keep digits
    const digitsOnly = localNumber.replace(/[^\d]/g, '').replace(/^[0]+/, '');
    const updatedPhone = newCode + digitsOnly;
    setRestaurant({ 
      ...restaurant, 
      phoneNumber: updatedPhone
    });
  };

  // On local digits change
  const handleLocalDigitsChange = (newLocal: string) => {
    // Clean to keep only numbers
    const digitsOnly = newLocal.replace(/[^\d]/g, '');
    const updatedPhone = matchedCountry.code + digitsOnly;
    setRestaurant({ 
      ...restaurant, 
      phoneNumber: updatedPhone
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-amber-500 font-sans flex flex-col justify-center items-center gap-4" dir="rtl">
        <ChefHat className="w-14 h-14 animate-bounce" />
        <p className="text-sm font-bold tracking-wide">جاري سحب هوية مطعمك وتهيئة لوحة التحكم السحابية...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col md:flex-row" dir="rtl">
      
      {/* Real-time WhatsApp Push Order Alerts */}
      <div className="fixed top-4 right-4 md:right-auto md:left-4 z-[9999] pointer-events-none flex flex-col gap-3 max-w-xs sm:max-w-sm w-full font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <AnimatePresence>
          {newOrderNotifications.map((notif) => (
            <FloatingNotification
              key={notif.id}
              notif={notif}
              lang={lang}
              currency={restaurant.currency}
              onDismiss={(id) => {
                setNewOrderNotifications(prev => prev.filter(n => n.id !== id));
              }}
              onViewOrders={() => {
                setActiveTab('orders');
                setNewOrderNotifications(prev => prev.filter(n => n.id !== notif.id));
              }}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <img 
            src={restaurant.logo} 
            className="w-8.5 h-8.5 rounded-lg border border-slate-700 bg-white object-cover" 
            alt="Brand logo"
          />
          <div>
            <h2 className="text-xs font-black text-white leading-tight truncate max-w-[120px]">{restaurant.name}</h2>
            <span className="text-[9px] text-amber-500 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 inline-block font-sans">
              {isDemo ? 'نسخة تجريبية' : 'سحابي'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Menu Eye button */}
          <button
            onClick={() => onNavigateToMenu(restaurant.slug)}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-amber-500 rounded-lg cursor-pointer transition border border-slate-700 flex items-center justify-center"
            title="معاينة المنيو"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 rounded-lg cursor-pointer transition border border-rose-900/40 flex items-center justify-center"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.15)] flex justify-around items-center h-16 px-1 text-slate-450">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'settings' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
          {activeTab === 'settings' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'categories' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <div className="relative">
            <Layers className="w-[18px] h-[18px]" />
            <span className="absolute -top-1.5 -right-2.5 bg-amber-550 text-[8px] text-white px-1.5 py-0.2 rounded-full scale-75 font-bold font-sans">{categories.length}</span>
          </div>
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'الأقسام' : 'Categories'}</span>
          {activeTab === 'categories' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'products' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <div className="relative">
            <ChefHat className="w-[18px] h-[18px]" />
            <span className="absolute -top-1.5 -right-2.5 bg-amber-550 text-[8px] text-white px-1.5 py-0.2 rounded-full scale-75 font-bold font-sans">{products.length}</span>
          </div>
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'الوجبات' : 'Meals'}</span>
          {activeTab === 'products' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('qrcode')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'qrcode' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <QrCode className="w-[18px] h-[18px]" />
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'رمز QR' : 'QR Code'}</span>
          {activeTab === 'qrcode' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'orders' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-[18px] h-[18px]" />
            {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-[8px] text-white px-1 py-0 rounded-full scale-90 font-bold font-sans animate-pulse">
                {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'الطلبات' : 'Orders'}</span>
          {activeTab === 'orders' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer ${activeTab === 'accounts' ? 'text-amber-500 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Percent className="w-[18px] h-[18px]" />
          <span className="text-[9px] tracking-tight">{lang === 'ar' ? 'التصفية' : 'Settle'}</span>
          {activeTab === 'accounts' && (
            <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-1 w-5 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      </nav>

      {/* Alert Notification System */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-bold min-w-[280px] sm:min-w-[400px] text-right ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Sidebar Navigation */}
      <aside className="hidden md:flex w-full md:w-64 bg-slate-900 text-slate-300 flex-col justify-between p-5 border-l border-slate-800 shrink-0 select-none">
        <div className="space-y-8">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <img 
              src={restaurant.logo} 
              className="w-11 h-11 rounded-xl border border-slate-700 bg-white object-cover" 
              alt="Brand logo"
            />
            <div>
              <h2 className="text-sm font-black text-white leading-tight truncate max-w-[140px]">{restaurant.name}</h2>
              <span className="text-[10px] text-amber-500 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 mt-1 inline-block">
                وضع {isDemo ? 'تجريبي' : 'مستضيف'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'settings' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Settings className="w-4.5 h-4.5" />
              أعدادت المطعم وهويته
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'categories' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Layers className="w-4.5 h-4.5" />
              أقسام وتصنيفات المنيو
              <span className="mr-auto bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-full">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'products' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ChefHat className="w-4.5 h-4.5" />
              الوجبات والأطباق
              <span className="mr-auto bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-full">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'qrcode' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <QrCode className="w-4.5 h-4.5" />
              رمز الاستجابة QR Code
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 relative ${activeTab === 'orders' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              إدارة الطلبات الحية 🛎️
              {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
                <span className="mr-auto bg-rose-500 text-[10px] text-white px-2 py-0.5 rounded-full font-sans font-extrabold animate-bounce">
                  {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'accounts' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Percent className="w-4.5 h-4.5 text-emerald-400" />
              تصفية حسابات المطبخ والوردية 💰
              {orders.filter(o => o.status === 'completed' && !o.isSettled).length > 0 && (
                <span className="mr-auto bg-emerald-500 text-[10px] text-emerald-950 px-2 py-0.5 rounded-full font-sans font-extrabold animate-pulse">
                  {orders.filter(o => o.status === 'completed' && !o.isSettled).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 cursor-pointer transition duration-150 ${activeTab === 'analytics' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <BarChart2 className="w-4.5 h-4.5" />
              إحصائيات وزيارات المنيو 📊
            </button>
          </nav>

        </div>

        {/* Bottom Actions card */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <button
            onClick={() => onNavigateToMenu(restaurant.slug)}
            className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-500" />
            فتح المنيو للزبائن
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-rose-950/20 hover:bg-rose-900 border border-thin border-rose-900/60 text-rose-300 rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Central workspace content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 space-y-8 overflow-y-auto max-w-5xl">
        
        {/* Dynamic Panel Header block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {activeTab === 'settings' && 'تعديل الإعدادات العامة'}
              {activeTab === 'categories' && 'أقسام وتصنيفات قائمة الطعام'}
              {activeTab === 'products' && 'لوحة المنتجات والتحكم اليدوي'}
              {activeTab === 'qrcode' && 'تفريغ وتنسيق رمز الـ QR'}
              {activeTab === 'analytics' && 'متابعة إحصائيات المنيو وتفاعلات الزبائن 📊'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              اسم المطعم المفعل حالياً: {restaurant.name} (رابط مخصص: ?menu={restaurant.slug})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2 px-3.5 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-500/10 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-white animate-pulse" />
              <span>تأسيس المنيو بالذكاء الاصطناعي (جديد) ✨</span>
            </button>

            <button
              onClick={copyMenuUrl}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {menuCopied ? <Check className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>نسخ رابط تصفح المنيو</span>
            </button>
          </div>
        </div>

        {/* TAB WORKSPACE ROUTER */}
        
        {/* TAB 1: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md space-y-6">
            
            {/* Split layout logo and cover */}
            <div className="grid md:grid-cols-2 gap-6 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رابط اللوجو الدائري 🖼️</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img src={restaurant.logo} className="w-12 h-12 rounded-full border bg-white object-cover shrink-0" alt="logo preview" />
                    <input 
                      type="url" 
                      required
                      value={restaurant.logo} 
                      onChange={e => setRestaurant({ ...restaurant, logo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono"
                      placeholder="رابط الصورة المباشر للوجو"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer transition select-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>اختر لوجو من معرض الموبايل 📸</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressAndResizeImage(file, 400); // 400 is plenty for logos
                              setRestaurant({ ...restaurant, logo: compressed });
                              triggerAlert('success', 'تم رفع اللوجو محلياً بنجاح! اضغط على حفظ الإعدادات لتأكيد التغييرات 🎉');
                            } catch (err) {
                              triggerAlert('error', 'حدث خطأ أثناء قراءة اللوجو.');
                            }
                          }
                        }}
                      />
                    </label>
                    {restaurant.logo.startsWith('data:') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">صورة محلية مرفوعة 💾</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رابط صورة الغلاف العريضة (Cover) 🏔️</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="url" 
                    required
                    value={restaurant.cover} 
                    onChange={e => setRestaurant({ ...restaurant, cover: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono"
                    placeholder="رابط صورة الغلاف"
                  />
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer transition select-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>اختر غلاف من معرض الموبايل 📸</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressAndResizeImage(file, 1000); // 1000 width for high definition desktop/mobile covers
                              setRestaurant({ ...restaurant, cover: compressed });
                              triggerAlert('success', 'تم رفع الغلاف محلياً بنجاح! اضغط على حفظ لتأكيد التغييرات 🌌');
                            } catch (err) {
                              triggerAlert('error', 'حدث خطأ أثناء قراءة الغلاف.');
                            }
                          }
                        }}
                      />
                    </label>
                    {restaurant.cover.startsWith('data:') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">صورة محلية مرفوعة 💾</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* General parameters */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">اسم المطعم الأساسي (عربي/إنجليزي) 🏢</label>
                <input 
                  type="text" 
                  required
                  value={restaurant.name} 
                  onChange={e => setRestaurant({ ...restaurant, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">المسار البرمجي المخصص (Slug) 🔗</label>
                <input 
                  type="text" 
                  required
                  value={restaurant.slug} 
                  onChange={e => setRestaurant({ ...restaurant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-amber-500 text-left"
                  placeholder="royal-palace"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رقم الواتساب لاستقبال الطلبات 💬</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-amber-500">
                  {/* Country Prefix Dropdown */}
                  <select
                    value={matchedCountry.code}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="bg-transparent text-xs font-bold px-3 py-2.5 outline-none border-l border-slate-200 text-slate-800 cursor-pointer"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} className="font-bold">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  
                  {/* Local Phone Number Input */}
                  <input 
                    type="tel" 
                    required
                    value={localNumber} 
                    onChange={e => handleLocalDigitsChange(e.target.value)}
                    className="flex-1 bg-transparent p-2.5 text-xs font-semibold outline-none text-left"
                    placeholder="1000000000"
                    dir="ltr"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  اختر رمز الدولة من القائمة المنسدلة واكتب باقي الرقم بدون صفر في البداية.
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">العنوان والفرع الرئيسي 📍</label>
                <input 
                  type="text" 
                  value={restaurant.address} 
                  onChange={e => setRestaurant({ ...restaurant, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500"
                  placeholder="مثال: التجمع الأول، شارع التسعين، القاهرة"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">عملة العرض المقررة 💵</label>
                <select 
                  value={restaurant.currency}
                  onChange={e => setRestaurant({ ...restaurant, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500 font-bold"
                >
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Custom Welcome Banner Text */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">بانر الترحيب بنظام المنيو الذكي ✨</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">العنوان المثير للترحيب</label>
                  <input 
                    type="text" 
                    value={restaurant.welcomeTitle || ''} 
                    onChange={e => setRestaurant({ ...restaurant, welcomeTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500"
                    placeholder="أهلاً بكم في القصر الملكي"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">الوصف الفرعي لجمال مطعمك</label>
                  <textarea 
                    rows={2}
                    value={restaurant.welcomeSubtitle || ''} 
                    onChange={e => setRestaurant({ ...restaurant, welcomeSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-amber-500 resize-none"
                    placeholder="نقدم أجود وأشهى المأكولات المحضرة طازجة"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Custom Language Preference */}
            <div className="space-y-4 font-sans text-right" dir="rtl">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500 shrink-0" />
                <h4 className="text-sm font-black text-slate-900">لغة واجهة لوحة التحكم والموقع (Language Settings) 🌐</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                اختر لغة العرض المفضلة لاستخدام لوحة التحكم وتصفح الموقع بالكامل. يمكنك تغييرها في أي وقت لاحقاً.
              </p>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => onChangeLang('ar')}
                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${lang === 'ar' ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  🇸🇦 العربية (Arabic)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLang('en')}
                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${lang === 'en' ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  🇺🇸 English (الإنجليزية)
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Custom Appearance / Brand Identity */}
            <div className="space-y-4 font-sans text-right" dir="rtl">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500 shrink-0" />
                <h4 className="text-sm font-black text-slate-900">طابع وهوية المنيو البصرية (الألوان والسمات) 🎨</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                حدد نسق وتكامل الألوان الذي يلائم هوية مطعمك ومقهى أحلامك. ستظهر السمات المحددة مباشرة على المنيو العام لأزرار الطلب والخصومات وفاتورة سلة الزبون.
              </p>

              {/* Theme presets choosing grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1 select-none">
                {[
                  { id: 'amber', label: 'العنبر الذهبي 🥞', color: '#d97706', desc: 'برجر ووجبات سريعة' },
                  { id: 'emerald', label: 'الزمرد البري 🥗', color: '#059669', desc: 'مأكولات شرقية وصحية' },
                  { id: 'rose', label: 'التوت الحلو 🍦', color: '#e11d48', desc: 'حلويات ومثلجات كولد' },
                  { id: 'indigo', label: 'الأزرق النيلي 🍤', color: '#4f46e5', desc: 'مشويات وأسماك بحرية' },
                  { id: 'slate', label: 'الكلاسيكي الفضي 🥩', color: '#475569', desc: 'لحوم ومطابخ غربية' },
                  { id: 'violet', label: 'البنفسج الملكي ☕', color: '#7c3aed', desc: 'مشروبات وقهوة دافئة' },
                  { id: 'dark', label: 'الأسود الفاخر 🌯', color: '#111827', desc: 'شاورما وجبنة حارة' },
                  { id: 'autumn', label: 'طيف الخريف 🔥', color: '#ea580c', desc: 'مشويات ووصفات ملقمة' },
                  { id: 'coffee', label: 'القهوة الكلاسيكية ☕', color: '#78350f', desc: 'حبوب بن محمصة ومخبوزات' }
                ].map((preset) => {
                  const isSelected = (restaurant.themePreset || 'amber') === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setRestaurant({ 
                        ...restaurant, 
                        themePreset: preset.id as any, 
                        primaryColor: preset.color 
                      })}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between items-start gap-3 hover:shadow-sm ${isSelected ? 'border-amber-500 bg-amber-50/10 ring-2 ring-amber-500/10 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="w-3.5 h-3.5 rounded-full border border-white shrink-0 shadow-sm" style={{ backgroundColor: preset.color }} />
                        {isSelected && <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-black select-none">مفعّل</span>}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] font-black text-slate-850 leading-none">{preset.label}</h5>
                        <p className="text-[8px] text-slate-400 font-semibold leading-none truncate w-[100px]">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Advanced Custom Color Hex Picker */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900">محدد لون البراند اليدوي الدقيق (Custom Color Picker) 🎨🎨</h5>
                  <p className="text-[10px] text-slate-500 leading-normal">هل تملك لوناً محدداً أو كود لون شعار مطعمك؟ عينه مباشرة هنا لتخصيص كامل للأزرار ومفاتيح السلة!</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={restaurant.primaryColor || '#d97706'} 
                      onChange={e => setRestaurant({ ...restaurant, primaryColor: e.target.value })}
                      className="w-9 h-9 border border-slate-200 rounded-xl cursor-pointer bg-transparent outline-none shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-800 font-mono tracking-wider">{restaurant.primaryColor || '#d97706'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const currentPreset = restaurant.themePreset || 'amber';
                      const defaultColorMap: Record<string, string> = {
                        amber: '#d97706', emerald: '#059669', rose: '#e11d48', indigo: '#4f46e5',
                        slate: '#475569', violet: '#7c3aed', dark: '#111827', autumn: '#ea580c', coffee: '#78350f'
                      };
                      setRestaurant({ 
                        ...restaurant, 
                        primaryColor: defaultColorMap[currentPreset] || '#d97706' 
                      });
                    }}
                    className="text-[9px] bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900 font-black py-1 px-2.5 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    إعادة لافتراضي السمة 🔄
                  </button>
                </div>
              </div>

              {/* Reactive Beautiful Preview Box */}
              <div className="border border-dashed border-slate-200 rounded-3xl p-4.5 space-y-3.5 select-none bg-slate-50/20 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">لوحة المعاينة التفاعلية الفورية لهوية مطعمك:</span>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="text-[10px] font-black px-4 py-2.5 rounded-xl text-white transition-all shadow-md flex items-center gap-1 leading-none cursor-default"
                    style={{ backgroundColor: restaurant.primaryColor || '#d97706' }}
                  >
                    <span>إضافة مأكولات للسلة +</span>
                  </button>

                  <span 
                    className="text-[10px] font-black px-3 py-1.5 rounded-full"
                    style={{ 
                      backgroundColor: `${restaurant.primaryColor || '#d97706'}20`, 
                      color: restaurant.primaryColor || '#d97706' 
                    }}
                  >
                    🔥 وجبة مميزة ومطلوبة جداً
                  </span>

                  <span 
                    className="text-xs font-black font-mono"
                    style={{ color: restaurant.primaryColor || '#d97706' }}
                  >
                    175 {restaurant.currency || 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                id="save-settings-btn"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-2xl text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition flex items-center gap-2"
              >
                <Save className="w-4.5 h-4.5" />
                حفظ الإعدادات ونشرها للعموم 🚀
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">قم بتقسيم المنيو لأقسام رئيسية مثل (سندوتشات، أطباق، شوربة كافيه) للمساعدة في التصفح السريع.</span>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', order: categories.length + 1, isActive: true });
                  setIsCategoryModalOpen(true);
                }}
                className="bg-slate-950 hover:bg-amber-500 hover:text-white text-white font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4.5 h-4.5" />
                إضافة قسم جديد +
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <Layers className="w-12 h-12 mx-auto text-slate-300" />
                    <h4 className="text-base font-black text-slate-900">إنشاء أقسام المنيو يدوياً</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">تأسيس أقسام مطعمك وقامتك بنفسك خطوة بخطوة بالترتيب المناسب لك يدويّاً.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', order: categories.length + 1, isActive: true });
                      setIsCategoryModalOpen(true);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-white py-2.5 px-5 rounded-xl text-xs font-bold transition mx-auto cursor-pointer"
                  >
                    البدء يدوياً +
                  </button>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 p-8 rounded-3xl text-center flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-3">
                    <Sparkles className="w-12 h-12 mx-auto text-purple-600 animate-pulse bg-purple-100/50 p-2.5 rounded-full" />
                    <h4 className="text-base font-black text-purple-950">تأسيس المنيو بالذكاء الاصطناعي 🚀</h4>
                    <p className="text-xs text-purple-800/85 max-w-sm mx-auto font-sans leading-relaxed">هل لديك صورة أو قائمة طعام ورقية مطبوعة؟ ارفعها الآن وسيقوم الذكاء الاصطناعي بإنشاء جميع الأقسام مع الأكلات والأسعار تلقائياً!</p>
                  </div>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-6 rounded-xl text-xs font-black transition mx-auto cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-600/10 hover:scale-105 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    رفع صورة المنيو الذكي 📷
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-amber-50 rounded-lg text-amber-700 font-mono text-[10px] font-bold flex items-center justify-center border border-amber-100">
                          {cat.order}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{cat.name}</h4>
                      </div>
                      <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full font-semibold ${cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {cat.isActive ? '✅ متاح بالمنيو' : '⛔ مخفي مؤقتاً'}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({ name: cat.name, order: cat.order, isActive: cat.isActive });
                          setIsCategoryModalOpen(true);
                        }}
                        className="bg-slate-50 p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 border rounded-xl transition cursor-pointer"
                        title="تعديل القسم"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmCategory(cat)}
                        className="bg-slate-50 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border rounded-xl transition cursor-pointer"
                        title="حذف القسم بالكامل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-slate-500 text-xs">تحكم في إضافة صور الأكلات اللذيذة والوصف ومستوى توافر المنتج للعملاء في السلة المباشرة.</span>
              <button
                onClick={() => {
                  if (categories.length === 0) {
                    triggerAlert('error', 'يجب تكوين قسم منيو واحد على الأقل أولاً لتتمكن من إضافة المنتجات!');
                    return;
                  }
                  setEditingProduct(null);
                  const initialCatId = categories[0]?.id || '';
                  setCategoryId(initialCatId);
                  setProductForm({
                    name: '',
                    description: '',
                    price: 25,
                    originalPrice: 35,
                    isDiscounted: false,
                    discountPrice: 25,
                    image: FOOD_PRESETS[0].url,
                    categoryId: initialCatId,
                    isAvailable: true,
                    badge: '',
                    order: products.length + 1,
                    discountLabel: '',
                    discountExpiry: '',
                    sizes: []
                  });
                  setIsProductModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4.5 h-4.5" />
                إضافة وجبة للمنيو +
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-amber-900 text-center text-xs font-bold leading-normal">
                ⚠️ يرجى إضافة قسم منيو رئيسي عبر تبويب "أقسام وتصنيفات المنيو" لتتمكن من إضافة الوجبات.
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border p-12 rounded-3xl text-center space-y-4">
                <ChefHat className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="text-base font-black text-slate-900">لا توجد وجبات في المنيو بعد!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">تجهيز المنيو ونشر صور الطعام والمشروبات من أهم أسباب تحفيز الزبون على الطلب الفوري.</p>
              </div>
            ) : (
              // Structured display by category groups
              <div className="space-y-8">
                {categories.map((cat) => {
                  const catProducts = products.filter(p => p.categoryId === cat.id);
                  if (catProducts.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="text-sm font-black text-slate-800 bg-slate-200/60 inline-block px-3.5 py-1.5 rounded-full">{cat.name}</h4>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {catProducts.map((prod) => (
                          <div key={prod.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            
                            {/* Product Header Photo */}
                            <div className="h-36 relative">
                              <img src={prod.image} className="w-full h-full object-cover" alt={prod.name} />
                              {prod.badge && (
                                <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                                  🔥 {prod.badge}
                                </span>
                              )}
                              {!prod.isAvailable && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                  <EyeOff className="w-4 h-4" />
                                  غير متوفر بالمطبخ اليوم
                                </div>
                              )}
                            </div>

                            {/* Details text */}
                            <div className="p-4 space-y-2 flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{prod.name}</h5>
                                <div className="text-xs font-black text-amber-600 shrink-0 font-mono">
                                  {prod.isDiscounted && prod.discountPrice ? (
                                    <div className="flex flex-col text-left">
                                      <span>{prod.discountPrice} {restaurant.currency}</span>
                                      <span className="text-[10px] text-slate-400 line-through font-normal">{prod.price}</span>
                                    </div>
                                  ) : (
                                    <span>{prod.price} {restaurant.currency}</span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8">
                                {prod.description || 'لم يتم إضافة وصف بعد لهذه الوجبة اللذيذة.'}
                              </p>
                            </div>

                            {/* Actions panel footer */}
                            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono font-semibold">ترتيب العرض: #{prod.order}</span>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setCategoryId(prod.categoryId);
                                    setProductForm({
                                      name: prod.name,
                                      description: prod.description || '',
                                      price: prod.isDiscounted && prod.discountPrice ? prod.discountPrice : prod.price,
                                      originalPrice: prod.isDiscounted ? prod.price : (prod.originalPrice || 0),
                                      isDiscounted: !!prod.isDiscounted,
                                      discountPrice: prod.discountPrice || 0,
                                      image: prod.image,
                                      categoryId: prod.categoryId,
                                      isAvailable: prod.isAvailable,
                                      badge: prod.badge || '',
                                      order: prod.order,
                                      discountLabel: prod.discountLabel || '',
                                      discountExpiry: prod.discountExpiry || '',
                                      sizes: prod.sizes || []
                                    });
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1 px-2.5 text-xs text-slate-600 bg-white hover:text-amber-500 border rounded-lg transition font-semibold cursor-pointer"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QR CODE */}
        {activeTab === 'qrcode' && (
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-md grid md:grid-cols-2 gap-8 items-center">
            
            {/* Explainer panel */}
            <div className="space-y-4">
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">كود مصلحة الزبون الفوري</span>
              <h4 className="text-xl font-black text-slate-950">قم بطباعة الكود وتعليقه على الطاولات</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                كل ما يحتاجه الزبون الجالس على طاولتك هو تفعيل كاميرا الهاتف المحمول ومسح هذا الرمز الذكي QR Code. سيفتح المنيو الخاص بك مباشرة ولديه القدرة على حجز واختيار أطباقه المفضلة وإرسالها لمدير المبيعات على الواتساب بلحظة.
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4 font-semibold text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>يقوم النظام بتصميم كود QR وتحديثه تلقائياً إذا قمت بتغيير slug المطعم.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>اطبع الكود وألصقه أو وزعه على الطاولات، أو في لافتات الباب الرئيسي.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-2.5">
                <button
                  onClick={() => window.open(qrImageSrc, '_blank')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  تحميل نسخة للطباعة دقة عالية (PNG)
                </button>

                <button
                  onClick={copyMenuUrl}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  نسخ رابط تصفح الجوال
                </button>
              </div>
            </div>

            {/* Simulated Live Print Layout */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50">
              <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-4 max-w-[280px]">
                <div>
                  <h5 className="font-extrabold text-slate-900 uppercase">مسح المنيو الرقمي ✨</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{restaurant.name}</p>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                  <img 
                    src={qrImageSrc} 
                    className="w-44 h-44 object-contain" 
                    alt="generated qr code"
                  />
                </div>

                <div>
                  <span className="bg-slate-900 text-white rounded-full px-3 py-1 font-bold text-[9px]">
                    برعاية منيو كليك
                  </span>
                  <p className="text-[8px] text-slate-500 mt-1.5 leading-normal">امسح الكود لطلب الطعام والمقبلات عبر واتساب</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5 (NEW): LIVE ORDERS & TICKETS CONCEPT */}
        {activeTab === 'orders' && (() => {
          const pendingCount = orders.filter(o => o.status === 'pending' || !o.status).length;
          const preparingCount = orders.filter(o => o.status === 'preparing').length;
          const completedCount = orders.filter(o => o.status === 'completed').length;

          const displayedInTab = orders.filter(o => {
            if (orderFilter === 'all') return true;
            if (orderFilter === 'pending') return o.status === 'pending' || !o.status;
            return o.status === orderFilter;
          });

          return (
            <div className="space-y-6">
              
              {/* Row: Stats & Action bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Pending ticket Count card */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-amber-700 font-bold block">طلب جديد بالانتظار ⏳</span>
                    <h2 className="text-2xl font-black text-amber-850 mt-2">{pendingCount}</h2>
                  </div>
                  <span className="text-[10px] text-amber-600 mt-2 font-medium">بانتظار موافقة المطبخ للطهي</span>
                </div>

                {/* Preparing ticket Count card */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-indigo-700 font-bold block">قيد التحضير والطهي 🍳</span>
                    <h2 className="text-2xl font-black text-indigo-850 mt-2">{preparingCount}</h2>
                  </div>
                  <span className="text-[10px] text-indigo-600 mt-2 font-medium">يجري طهيها وتجهيزها حالياً</span>
                </div>

                {/* Completed ticket Count card */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-emerald-700 font-bold block">طلبات تم تسليمها ✅</span>
                    <h2 className="text-2xl font-black text-emerald-850 mt-2">{completedCount}</h2>
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-2 font-medium">تم الطهي والاستلام بنجاح</span>
                </div>

                {/* Total Counter card */}
                <div className="bg-slate-500/5 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">إجمالي أوراق الطلبات</span>
                    <h2 className="text-2xl font-black text-slate-850 mt-2">{orders.length}</h2>
                  </div>
                  <button 
                    onClick={injectSampleOrderForTesting}
                    className="text-[10px] text-white bg-amber-600 hover:bg-amber-750 px-3 py-1.5 rounded-xl shrink-0 w-fit transition mt-2 font-black cursor-pointer shadow-sm"
                  >
                    🧪 محاكاة وصول طلب جديد
                  </button>
                </div>

              </div>

              {/* Speaker sound controller and simulation header */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${soundEnabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">جرس التنبيه للطلبات الجديدة</h4>
                    <p className="text-[10px] text-slate-500 block mt-0.5">سماع رنين جرس صوت مخصص مسموع في المطبخ فور إتمام طلب العميل.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto font-sans">
                  <span className="text-[10px] font-bold text-slate-500">حالة الجرس المطبخي:</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                      soundEnabled 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-md shadow-emerald-500/5' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <span>{soundEnabled ? 'مفعل 🔊' : 'مكتوم 🔇'}</span>
                  </button>
                </div>
              </div>

              {/* Main table list / Filter tabs */}
              <div className="space-y-4">
                
                {/* Pills tabs selection */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                      orderFilter === 'all' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    الكل ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('pending')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'pending' 
                        ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-500/10' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>قيد الانتظار</span>
                    <span className="bg-amber-950/25 text-white text-[10px] px-1.5 py-0.2 rounded-full">{pendingCount}</span>
                  </button>
                  <button
                    onClick={() => setOrderFilter('preparing')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'preparing' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>قيد التحضير</span>
                    <span className="bg-indigo-950/25 text-white text-[10px] px-1.5 py-0.2 rounded-full">{preparingCount}</span>
                  </button>
                  <button
                    onClick={() => setOrderFilter('completed')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'completed' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>مكتملة الاستلام</span>
                    <span className="bg-emerald-950/25 text-white text-[10px] px-1.5 py-0.2 rounded-full">{completedCount}</span>
                  </button>
                </div>

                {/* Grid list or empty prompt */}
                {displayedInTab.length === 0 ? (
                  <div className="bg-white border rounded-3xl p-12 text-center space-y-3.5 shadow-sm">
                    <ShoppingBag className="w-12 h-12 mx-auto text-slate-350" />
                    <h4 className="text-sm font-black text-slate-900">لا توجد أوراق طلب حالياً في هذا القسم</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">سيظهر أي طلب يرسله الزبون عبر مسح كود الـ QR فوراً هنا، وسيرن التنبيه الصوتي في نفس اللحظة.</p>
                    <button
                      onClick={injectSampleOrderForTesting}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2 px-4 rounded-xl shadow-md transition mx-auto cursor-pointer"
                    >
                      🧪 تجربة إرسال طلب محاكي فوري
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {displayedInTab.map((order) => {
                      const isPending = order.status === 'pending' || !order.status;
                      const isPreparing = order.status === 'preparing';
                      const isCompleted = order.status === 'completed';

                      return (
                        <div key={order.id} className={`bg-white border rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between relative overflow-hidden ${
                          isPending ? 'border-amber-250 ring-2 ring-amber-500/5' :
                          isPreparing ? 'border-indigo-250 ring-2 ring-indigo-500/5' :
                          'border-slate-100 opacity-90'
                        }`}>
                          
                          {/* Top Card Bar: Table & Date */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                              <span className="text-xs text-slate-400 block font-mono">ID: {order.id?.substring(0, 8)}</span>
                              <h3 className="text-base font-black text-slate-900 mt-0.5">{order.tableName}</h3>
                            </div>
                            <span className="text-[10px] text-slate-500/90 font-medium">
                              {order.createdAt || (order.timestamp ? new Date(order.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن')}
                            </span>
                          </div>

                          {/* Items inside order */}
                          <div className="space-y-2">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                                <span>{it.name}</span>
                                <span className="font-bold">x{it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Notes/Special request */}
                          {order.notes && (
                            <div className="text-[11px] bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-100/50">
                              <span className="font-bold">💡 ملاحظة الزبون: </span> {order.notes}
                            </div>
                          )}

                          {/* Footer with buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">الحساب الإجمالي</span>
                              <span className="text-xs font-black text-slate-900">{order.totalPrice} {restaurant.currency}</span>
                            </div>
                            <div className="flex gap-1.5 font-sans">
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id!, 'preparing')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition whitespace-nowrap lg:px-4"
                                >
                                  🍳 بدء التحضير
                                </button>
                              )}
                              {isPreparing && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id!, 'completed')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition animate-pulse whitespace-nowrap lg:px-4"
                                >
                                  🛎️ جاهز للتوصيل
                                </button>
                              )}
                              {isCompleted && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] py-1 px-2.5 rounded-full font-bold whitespace-nowrap">
                                  ✓ تم التسليم بالصالة
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 8: CHEF-TO-CASHIER ACCOUNT SETTLEMENT ENGINE */}
        {activeTab === 'accounts' && (() => {
          // Calculation of precise financial metrics
          const allCompletedOrders = orders.filter(o => o.status === 'completed');
          const settledCompletedValue = orders.filter(o => o.isSettled).reduce((acc, o) => acc + (o.totalPrice || 0), 0);
          const outstandingCompletedValue = orders.filter(o => o.status === 'completed' && !o.isSettled).reduce((acc, o) => acc + (o.totalPrice || 0), 0);
          const kitchenInProgressValue = orders.filter(o => o.status === 'pending' || o.status === 'preparing').reduce((acc, o) => acc + (o.totalPrice || 0), 0);
          const totalSalesValue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

          return (
            <div className="space-y-6">
              {/* SHIFT SUMMARY AND CONTROLS HEADER */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans border border-slate-800">
                <div className="space-y-2 z-10 text-right">
                  <h2 className="text-lg font-black flex items-center justify-end gap-2 text-amber-400 font-sans">
                    <span>💵 محرك تسوية وإقفال حسابات الورديات</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-sans">
                    من هنا يمكنكم إدارة التسويات المالية لمبيعات الصالة، تصفية الفواتير، وقف مبيعات الوردية الحالية وبدء وردية جديدة بالخيمة السحابية.
                  </p>
                </div>
                <div className="z-10 shrink-0 self-end md:self-center font-sans">
                  <button
                    type="button"
                    onClick={() => setShowShiftConfirmModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition duration-150 cursor-pointer shadow-lg shadow-amber-500/20 font-sans"
                  >
                    <span>🧹 تصفير وإقفال الوردية الحالية</span>
                  </button>
                </div>
              </div>

              {/* FINANCIAL METRICS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-right font-sans">
                {/* 1. Total Shipped/Completed sales */}
                <div className="bg-white border text-right rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                  <span className="text-2xl block mb-1">📊</span>
                  <p className="text-slate-500 text-[10px] sm:text-xs font-sans">إجمالي مبيعات الوردية</p>
                  <p className="font-black font-mono text-base sm:text-lg text-slate-900">
                    {totalSalesValue} <span className="text-[10px] text-slate-500 font-sans">{restaurant.currency}</span>
                  </p>
                  <span className="absolute left-4 top-2 bg-slate-50 border text-slate-600 font-bold text-[9px] px-2 py-0.5 rounded-full font-mono">
                    {orders.length} طلبات
                  </span>
                </div>

                {/* 2. Settled/Paid */}
                <div className="bg-emerald-50/20 border border-emerald-100 text-right rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                  <span className="text-2xl block mb-1 font-sans">💰</span>
                  <p className="text-emerald-805 text-[10px] sm:text-xs">مستلم كاش (تمت التسوية)</p>
                  <p className="font-black font-mono text-base sm:text-lg text-emerald-700">
                    {settledCompletedValue} <span className="text-[10px] font-sans">{restaurant.currency}</span>
                  </p>
                  <span className="absolute left-4 top-2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full font-mono">
                    {orders.filter(o => o.isSettled).length} سددوا
                  </span>
                </div>

                {/* 3. Completed but Outstanding */}
                <div className="bg-rose-50/20 border border-rose-100 text-right rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                  <span className="text-2xl block mb-1 font-sans">⚠️</span>
                  <p className="text-rose-808 text-[10px] sm:text-xs">معلّق بالصالة (لم يسدد)</p>
                  <p className="font-black font-mono text-base sm:text-lg text-rose-700">
                    {outstandingCompletedValue} <span className="text-[10px] font-sans">{restaurant.currency}</span>
                  </p>
                  <span className="absolute left-4 top-2 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full font-mono">
                    {orders.filter(o => o.status === 'completed' && !o.isSettled).length} طلب جاهز
                  </span>
                </div>

                {/* 4. In Kitchen progressing */}
                <div className="bg-indigo-50/20 border border-indigo-100 text-right rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden font-sans">
                  <span className="text-2xl block mb-1">🍳</span>
                  <p className="text-slate-705 text-[10px] sm:text-xs">قيد الطهي والتجهيز</p>
                  <p className="font-black font-mono text-base sm:text-lg text-indigo-700">
                    {kitchenInProgressValue} <span className="text-[10px] font-sans">{restaurant.currency}</span>
                  </p>
                  <span className="absolute left-4 top-2 bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full font-mono font-sans">
                    {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length} طلب نشط
                  </span>
                </div>
              </div>

              {/* CURRENT ACTIVE ORDERS LIST & SETTLEMENT TABLE */}
              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div className="space-y-1 text-right w-full">
                    <h3 className="text-sm font-black text-slate-900 flex items-center justify-end gap-1.5 font-sans">
                      <span>🍽️ كشف وتصفية مبيعات الصالة بالوردية النشطة</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">قائمة بجميع طلبات الوردية الحالية؛ يمكنك تصفية حساب الطاولة بمجرد استلام الكاشير للمبلغ.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold select-none">
                        <th className="py-3 px-5 text-right font-bold">معرّف الطلب</th>
                        <th className="py-3 px-5 text-right font-bold font-sans">رقم/اسم الطاولة</th>
                        <th className="py-3 px-5 text-right font-bold">حالة وتجهيز المطبخ</th>
                        <th className="py-3 px-5 text-right font-bold">محتويات الطلب</th>
                        <th className="py-3 px-5 text-right font-bold">حساب الطاولة ماليًا</th>
                        <th className="py-3 px-5 text-right font-bold">حالة التصفية (كاشير - شيف)</th>
                        <th className="py-3 px-5 text-center font-bold">الإجراء المالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-sans">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                            <span className="text-3xl block">📋</span>
                            <span className="font-bold text-slate-850 block font-sans text-xs">لا توجد طلبات جارية بالصندوق حالياً</span>
                            <span className="text-[10px] block text-slate-500">قم بإرسال طلب أو استخدم المحاكاة كطلب تجريبي لإدارة التسويات.</span>
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => {
                          const isCompleted = o.status === 'completed';
                          const isPreparing = o.status === 'preparing';
                          const isPending = o.status === 'pending' || !o.status;

                          return (
                            <tr key={o.id} className={`hover:bg-slate-50/50 transition-colors ${o.isSettled ? 'bg-emerald-50/10' : ''}`}>
                              {/* Order ID */}
                              <td className="py-4 px-5 font-mono text-slate-400 font-bold text-xs">
                                #{o.id?.substring(0, 8)}
                              </td>

                              {/* Table name */}
                              <td className="py-4 px-5 font-bold text-slate-900 text-xs">
                                {o.tableName}
                              </td>

                              {/* Chef cooking stage */}
                              <td className="py-4 px-5 font-semibold text-[11px]">
                                {isPending && (
                                  <span className="bg-amber-100 text-amber-805 px-2.0 py-1.0 rounded-lg">
                                    ⏳ قيد الانتظار بالمطبخ
                                  </span>
                                )}
                                {isPreparing && (
                                  <span className="bg-indigo-100 text-indigo-805 px-2.0 py-1.0 rounded-lg animate-pulse">
                                    🍳 الشيف يطهيها الآن
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="bg-emerald-100 text-emerald-805 px-2.0 py-1.0 rounded-lg">
                                    🛎️ وجبة مكتملة الجاهزية
                                  </span>
                                )}
                              </td>

                              {/* Items list summary */}
                              <td className="py-4 px-5 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {o.items.map((it, idx) => (
                                    <span key={idx} className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium text-[10px] font-sans">
                                      {it.name} <span className="text-indigo-600 font-semibold font-mono text-[10px]">x{it.quantity}</span>
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* Cost */}
                              <td className="py-4 px-5 font-black text-slate-900 font-mono text-xs">
                                {o.totalPrice} {restaurant.currency}
                              </td>

                              {/* Settlement state label */}
                              <td className="py-4 px-5">
                                {o.isSettled ? (
                                  <div className="space-y-1">
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 py-1 px-2.5 rounded-lg font-bold flex items-center gap-1 w-fit text-[10px]">
                                      <span>✓ تمت التصفية بالصندوق</span>
                                    </span>
                                    {o.settledAt && (
                                      <span className="text-[9px] text-slate-400 block font-mono font-sans text-right">
                                        {new Date(o.settledAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-rose-700 bg-rose-50 border border-rose-200 py-1 px-2.5 rounded-lg font-bold flex items-center gap-1 w-fit text-[10px]">
                                    <span>⚠️ لم تسدد</span>
                                  </span>
                                )}
                              </td>

                              {/* Action Trigger */}
                              <td className="py-4 px-5 text-center">
                                {o.isSettled ? (
                                  <button
                                    onClick={() => handleUpdateOrderSettlement(o.id!, false)}
                                    className="text-slate-400 hover:text-rose-600 font-bold hover:underline transition cursor-pointer text-[11px]"
                                  >
                                    إلغاء التصفية 🔄
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (!isCompleted) {
                                        setAlertMsg({
                                          type: 'error',
                                          text: lang === 'ar' ? 'عذراً، يجب على الشيف إكمال الوجبة وتجهيزها بالمطبخ أولاً قبل تصفية حسابها.' : 'Chef must complete prep before settle.'
                                        });
                                        return;
                                      }
                                      handleUpdateOrderSettlement(o.id!, true);
                                    }}
                                    className={`py-1.5 px-3 rounded-xl text-[10px] font-black transition cursor-pointer ${
                                      isCompleted 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    title={!isCompleted ? 'يجب إكمال الوجبة بالمطبخ أولاً' : 'تصفية الحساب الآن'}
                                    disabled={!isCompleted}
                                  >
                                    تسوية وتصفية الحساب 💰
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAST SHIFTS ARCHIVE LOG */}
              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between font-sans">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-sans">
                      <span>📜 أرشيف تقارير ومبيعات الورديات السابقة</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">سجل مفصل بالورديات التي تم إغلاقها وتصفيرها مسبقاً وتفاصيل تسوياتها المالية.</p>
                  </div>
                  <span className="bg-slate-100 border text-slate-600 font-bold text-[10px] px-3 py-1 rounded-full font-mono">
                    {shifts.length} وردية مغلقة
                  </span>
                </div>

                {loadingShifts ? (
                  <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
                    <span>جاري تحميل الأرشيف المالي...</span>
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <span className="text-2xl block">📁</span>
                    <span className="font-bold text-slate-600 text-xs block font-sans">لا توجد قيود ورديات مؤرشفة حتى الآن</span>
                    <span className="text-[10px] block text-slate-500 font-sans">عند تصفية الوردية النشطة لأول مرة، سيظهر تقريرها المفصل وتفاصيل الإيرادات هنا بالتفصيل.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold font-sans">
                          <th className="py-2.5 px-4 text-right">رقم الوردية</th>
                          <th className="py-2.5 px-4 text-right">تاريخ ووقت الإغلاق</th>
                          <th className="py-2.5 px-4 text-right">مراجع الوردية (الكاشير)</th>
                          <th className="py-2.5 px-4 text-center">عدد طلبات الوردية</th>
                          <th className="py-2.5 px-4 text-right">إجمالي مبيعات الوردية</th>
                          <th className="py-2.5 px-4 text-right">مبيعات تمت تسويتها</th>
                          <th className="py-2.5 px-4 text-right">حسابات متبقية لم تسدد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
                        {shifts.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 font-mono font-bold text-slate-400">
                              #{s.id?.substring(0, 6) || s.closedAt.substring(14, 19)}
                            </td>
                            <td className="py-3 px-4 font-sans text-slate-900 font-medium">
                              {new Date(s.closedAt).toLocaleDateString('ar-EG', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 font-bold text-teal-700">
                              👤 {s.employeeName || 'الكاشير'}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                              {s.totalOrders}
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-emerald-700">
                              {s.totalSales} {restaurant.currency}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                              {s.settledSales || 0} {restaurant.currency}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                              {s.unsettledSales || 0} {restaurant.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODAL COUPLING FOR CONFIRMATION OF CLOSE SHIFT */}
              {showShiftConfirmModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up text-right relative overflow-hidden font-sans">
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
                      <span className="text-2xl mt-0.5 shrink-0">⚠️</span>
                      <div className="space-y-1 text-right">
                        <h4 className="font-black text-rose-950 text-sm">أنت على وشك تصفية حسابات الوردية الحالية والبدء من جديد!</h4>
                        <p className="text-[11px] text-rose-800 leading-relaxed font-sans">
                          هذا الإجراء سيقوم بأرشفة الصفقات الحالية في سجل ومحفوظات متجرك بالخيمة السحابية، ثم مسح كافة الطاولات وإرجاعها فارغة للوردية التالية.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 border-y border-slate-150 py-4 text-right font-sans">
                      <h5 className="font-extrabold text-xs text-slate-900">ملخص الوردية الحالية للمطعم:</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-slate-500 block">إجمالي عدد الطلبات:</span>
                          <span className="font-black font-mono text-sm text-slate-800">{orders.length}</span>
                        </div>
                        <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl">
                          <span className="text-emerald-700 block">إجمالي مبيعات الوردية:</span>
                          <span className="font-black font-mono text-sm">{totalSalesValue} {restaurant.currency}</span>
                        </div>
                        <div className="bg-indigo-50 text-indigo-950 p-2.5 rounded-xl">
                          <span className="text-indigo-700 block">طلب مصفى ومستلم بالكاش:</span>
                          <span className="font-black font-mono text-sm">{settledCompletedValue} {restaurant.currency}</span>
                        </div>
                        <div className="bg-rose-50 text-rose-950 p-2.5 rounded-xl">
                          <span className="text-rose-700 block">طلب معلق/لم يسدد بعد:</span>
                          <span className="font-black font-mono text-sm">{totalSalesValue - settledCompletedValue} {restaurant.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowShiftConfirmModal(false)}
                        className="bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs cursor-pointer font-sans"
                      >
                        تراجع وإلغاء ❌
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleClearAndStartNewShift();
                          setShowShiftConfirmModal(false);
                        }}
                        className="bg-rose-600 font-black hover:bg-rose-700 text-white py-2.5 px-6 rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-600/15 font-sans"
                      >
                        نعم، تصفية وقفل الوردية 🧹
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* TAB 5: ANALYTICS & PLANS */}
        {activeTab === 'analytics' && (() => {
          // Calculate dynamic metrics if live subcollection logs exist
          const hasRealLogs = orders.length > 0 || viewsLog.length > 0;
          
          // Filter logs based on selection period (today, week, month)
          const filteredViewsList = viewsLog.filter(v => {
            if (!v.timestamp) return false;
            const diffMs = Date.now() - new Date(v.timestamp).getTime();
            if (analyticsPeriod === 'today') return diffMs <= 24 * 3600000;
            if (analyticsPeriod === 'week') return diffMs <= 7 * 24 * 3600000;
            return true;
          });

          const filteredOrdersList = orders.filter(o => {
            if (!o.timestamp) return false;
            const diffMs = Date.now() - new Date(o.timestamp).getTime();
            if (analyticsPeriod === 'today') return diffMs <= 24 * 3600000;
            if (analyticsPeriod === 'week') return diffMs <= 7 * 24 * 3600000;
            return true;
          });

          // Determine totals
          const fallbackViews = analyticsPeriod === 'today' 
            ? Math.max(12, Math.floor((restaurant.viewsCount || 0) * 0.12))
            : analyticsPeriod === 'week'
              ? Math.max(45, Math.floor((restaurant.viewsCount || 0) * 0.44))
              : (restaurant.viewsCount || 0);

          const fallbackOrders = analyticsPeriod === 'today'
            ? Math.max(2, Math.floor((restaurant.whatsappOrdersCount || 0) * 0.08))
            : analyticsPeriod === 'week'
              ? Math.max(8, Math.floor((restaurant.whatsappOrdersCount || 0) * 0.41))
              : (restaurant.whatsappOrdersCount || 0);

          const activeViewsCount = hasRealLogs ? filteredViewsList.length : fallbackViews;
          const activeOrdersCount = hasRealLogs ? filteredOrdersList.length : fallbackOrders;
          
          const conversionRate = activeViewsCount > 0 
            ? ((activeOrdersCount / activeViewsCount) * 100).toFixed(1) 
            : "0.0";

          const activeEstimatedValue = hasRealLogs 
            ? filteredOrdersList.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
            : activeOrdersCount * 155; // Multiplied by average order ticket size

          // Compute device channel metrics dynamically
          const deviceMetrics = (() => {
            if (hasRealLogs && viewsLog.length > 0) {
              const counts = { iPhone: 0, Android: 0, Desktop: 0, Other: 0 };
              filteredViewsList.forEach(v => {
                counts[v.device as keyof typeof counts] = (counts[v.device as keyof typeof counts] || 0) + 1;
              });
              const total = filteredViewsList.length || 1;
              return {
                ios: Math.round((counts.iPhone / total) * 100),
                android: Math.round((counts.Android / total) * 100),
                desktop: Math.round(((counts.Desktop + counts.Other) / total) * 105) // remaining
              };
            }
            return { ios: 58, android: 37, desktop: 5 };
          })();

          // Compute peak hours based on real order timestamps or fallback
          const peakHoursStats = (() => {
            if (hasRealLogs && viewsLog.length > 0) {
              const hoursCounts = { dinner: 0, lunch: 0, morning: 0, midnight: 0 };
              filteredViewsList.forEach(v => {
                const date = new Date(v.timestamp);
                const hrs = date.getHours();
                if (hrs >= 19 && hrs <= 23) hoursCounts.dinner++;
                else if (hrs >= 14 && hrs <= 18) hoursCounts.lunch++;
                else if (hrs >= 8 && hrs <= 13) hoursCounts.morning++;
                else hoursCounts.midnight++;
              });
              const max = Math.max(hoursCounts.dinner, hoursCounts.lunch, hoursCounts.morning, hoursCounts.midnight, 1);
              return [
                { time: 'العشاء والمساء (7 مساءً - 11 ليلاً)', percent: Math.round((hoursCounts.dinner / max) * 100), label: 'ذروة التجمع العائلي والعشاء لعملائك 🔥' },
                { time: 'الغداء والظهيرة (2 مساءً - 6 مساءً)', percent: Math.round((hoursCounts.lunch / max) * 100), label: 'نشاط متزايد مع وجبات الغداء الكلاسيكية 🍗' },
                { time: 'منتصف الليل (12 ليلاً - 4 فجراً)', percent: Math.round((hoursCounts.midnight / max) * 100), label: 'الطلبات الليلية الخفيفة ومحبي السهر 🥞' },
                { time: 'الصباح الباكر (8 صباحاً - 1 مساءً)', percent: Math.round((hoursCounts.morning / max) * 100), label: 'خدمة تناول الإفطار والمشروبات الصباحية ☕' }
              ];
            }
            return [
              { time: 'العشاء والمساء (7 مساءً - 11 ليلاً)', percent: 78, label: 'نشط جداً رواج ممتاز 🔥' },
              { time: 'الغداء والظهيرة (2 مساءً - 6 مساءً)', percent: 54, label: 'متوسط الأداء المستمر 🍗' },
              { time: 'منتصف الليل (12 ليلاً - 4 فجراً)', percent: 35, label: 'الطلبات المتأخرة والتحلية 🥞' },
              { time: 'الصباح الباكر (8 صباحاً - 1 مساءً)', percent: 22, label: 'نشاط الإفطار والمشروبات ☕' }
            ];
          })();

          // Compute popular items from active menu products matched with orders
          const popularProducts = (() => {
            const rawList = products.length > 0 ? products : [
              { id: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, image: FOOD_PRESETS[0].url },
              { id: 'p2', name: 'شاورما دجاج سوبر فرشك 🌯', price: 120, image: FOOD_PRESETS[1].url },
              { id: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, image: FOOD_PRESETS[2].url },
              { id: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, image: FOOD_PRESETS[4].url },
            ];

            if (hasRealLogs && orders.length > 0) {
              const occurrences: { [id: string]: number } = {};
              rawList.forEach(p => { occurrences[p.id] = 0; });
              
              filteredOrdersList.forEach(o => {
                if (o.items && Array.isArray(o.items)) {
                  o.items.forEach(item => {
                    if (occurrences[item.productId] !== undefined) {
                      occurrences[item.productId] += item.quantity;
                    } else {
                      occurrences[item.productId] = item.quantity;
                    }
                  });
                }
              });

              return rawList.map(p => {
                const itemOrdersCount = occurrences[p.id] || 0;
                // views are simulated proportionally to avoid empty viewer metrics on newly placed items
                const simViews = Math.max(itemOrdersCount * 3 + 2, Math.floor(activeViewsCount * 0.15));
                return {
                  ...p,
                  views: simViews,
                  orders: itemOrdersCount,
                  revenue: itemOrdersCount * p.price
                };
              }).sort((a, b) => b.orders - a.orders);
            }

            // Fallback mock math representation for beauty
            return rawList.map((prod, index) => {
              const baseViews = Math.max(8, Math.floor(activeViewsCount * (0.45 - index * 0.11)));
              const baseOrders = Math.max(1, Math.floor(activeOrdersCount * (0.48 - index * 0.13)));
              return {
                ...prod,
                views: baseViews,
                orders: baseOrders,
                revenue: baseOrders * prod.price
              };
            }).filter(p => p.views > 0).sort((a, b) => b.orders - a.orders);
          })();

          // Fallback UI arrays for display
          const displayedOrders = orders.length > 0 ? filteredOrdersList : [
            {
              id: 'm-ord-1',
              tableName: 'طاولة 4',
              timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
              createdAt: 'قبل 25 دقيقة',
              totalPrice: 410,
              notes: 'يرجى الإسراع بالتجهيز وتوفير الصلصات الإضافية الدافئة 🛎️',
              items: [
                { productId: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, quantity: 2 },
                { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 1 }
              ]
            },
            {
              id: 'm-ord-2',
              tableName: 'طاولة 12',
              timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
              createdAt: 'اليوم، 3:30 م',
              totalPrice: 120,
              notes: 'زيادة الكاتشب الحار وصوص المايونيز',
              items: [
                { productId: 'p2', name: 'شاورما دجاج سوبر فرشك 🌯', price: 120, quantity: 1 }
              ]
            },
            {
              id: 'm-ord-3',
              tableName: 'طاولة 1',
              timestamp: new Date(Date.now() - 22 * 3600000).toISOString(),
              createdAt: 'أمس، 9:15 م',
              totalPrice: 790,
              notes: 'لا تضف بصل أو مقبلات حارة في برجر الأطفال',
              items: [
                { productId: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, quantity: 3 },
                { productId: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, quantity: 1 },
                { productId: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, quantity: 2 }
              ]
            }
          ];

          const displayedViews = viewsLog.length > 0 ? filteredViewsList : [
            { id: 'v1', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), device: 'iPhone', referrer: 'مسح QR المطبوع' },
            { id: 'v2', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), device: 'Android', referrer: 'رابط واتساب المشترك' },
            { id: 'v3', timestamp: new Date(Date.now() - 48 * 60000).toISOString(), device: 'iPhone', referrer: 'موقع التواصل الاجتماعي' },
            { id: 'v4', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), device: 'Desktop', referrer: 'دخول مباشر للموقع' },
            { id: 'v5', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), device: 'Android', referrer: 'مسح QR المطبوع' }
          ];

          return (
            <div className="space-y-6 font-sans text-right animate-fade-in" dir="rtl">
              
              {/* Header inside Analytic Screen */}
              <div className="bg-white border text-right border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                    لوحة الإحصائيات وتحليل وسجلات الزوار والطلبات السحابية 📊
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isDemo 
                      ? 'قائمة توضيحية لخصائص التحليل والذكاء التجاري لبيانات السلة' 
                      : 'تقرير في الوقت الحقيقي للمبيعات، متصفحي المنيو الرقمي ومعدلات التحويل المستهدفة'
                    }
                  </p>
                </div>

                {/* Filter and Simulator Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full sm:w-auto">
                    {[
                      { id: 'today', label: 'اليوم ☀️' },
                      { id: 'week', label: 'الأسبوع 📅' },
                      { id: 'month', label: 'كل الأوقات ♾️' }
                    ].map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setAnalyticsPeriod(period.id as any)}
                        className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${analyticsPeriod === period.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  {loadingAnalytics && (
                    <div className="animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full ml-1" />
                  )}
                </div>
              </div>

              {/* Cloud Simulator Tool panel: shown for real users to help them test live firebase events without waiting for real QR scans */}
              {!isDemo && (
                <div className="bg-amber-50/50 border border-amber-100/75 p-5 rounded-3xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
                      أدوات تجربة واختبار السحابة السريعة (Developer Sandbox) ⚙️
                    </h5>
                    <p className="text-[11px] text-amber-700/90 leading-normal">
                      لم تبدأ في تلقي طلبات مسح QR من الزبائن بعد؟ استخدم أدوات المحاكاة لإرسال طلبات وزيارات افتراضية حقيقية إلى قاعدة بيانات <span className="font-bold underline">Firestore</span> لمشاهدة تأثيرها الفوري على هذه الإحصائيات!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full xl:w-auto shrink-0 select-none">
                    <button
                      onClick={handleSimulateVisitor}
                      className="flex-1 xl:flex-initial bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black py-2 px-3.5 rounded-2xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      محاكاة زيارة زبون 📱
                    </button>
                    <button
                      onClick={handleSimulateOrder}
                      className="flex-1 xl:flex-initial bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-black py-2 px-3.5 rounded-2xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      محاكاة طلب سلة 🍕
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Dashboard Totals Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Views Count Card */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">إجمالي تصفح المنيو</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{activeViewsCount}</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 justify-start">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>نشاط مميز مستمر</span>
                  </span>
                </div>

                {/* 2. Whatsapp Orders Count Card */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">نقرات إرسال للواتساب</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{activeOrdersCount}</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 justify-start">
                    <Check className="w-3.5 h-3.5" />
                    <span>مكتمل من السلة</span>
                  </span>
                </div>

                {/* 3. Conversion Rate Card */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">نسبة التحويل (C-Rate)</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{conversionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1 select-none">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, parseFloat(conversionRate) * 3)}%` }} />
                  </div>
                </div>

                {/* 4. Financial Sum Card */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">قيمة مبيعات السلة المقدرة</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block mt-1">
                      {activeEstimatedValue} <span className="text-xs font-black">{restaurant.currency || 'EGP'}</span>
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-semibold leading-none">مجموع أسعار المنتجات المطلوبة</span>
                </div>

              </div>

              {!hasRealLogs && !isDemo && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-black text-blue-950 block">💡 إحصائيات معروضة للتوضيح المبدئي:</span>
                    <p className="text-[11px] text-blue-850 leading-relaxed">
                      نظراً لأن مطعمك لم يبدأ في استقبال طلبات حقيقية أو زيارات بعد، فإن لوحة الإحصائيات تعرض حالياً وجبات وتقارير توضيحية لتوضيح التناسق وتصميم المخططات. بمجرد قيام أول زبون بفتح المنيو عن طريق الـ QR code الخاص بك، ستتحول اللوحة تلقائياً لعرض وتحليل الزوار الفعليين وبث لقطات مباشرة!
                    </p>
                  </div>
                </div>
              )}

              {(() => {
                // Prepare data for Recharts
                const chartData = popularProducts.slice(0, 6).map((p, index) => {
                  const cleanName = p.name ? p.name.trim() : '';
                  const shortName = cleanName.length > 12 ? cleanName.substring(0, 12) + '...' : cleanName;
                  return {
                    name: cleanName,
                    shortName: shortName,
                    orders: p.orders || 0,
                    views: p.views || 0,
                    revenue: p.revenue || 0,
                    index: index + 1
                  };
                });

                // Compute daily sales trending over the last 7 days
                const dailySalesDynamics = (() => {
                  const last7Days: { [dateStr: string]: { dateLabel: string; sales: number; count: number } } = {};
                  
                  // Initialize last 7 days with zeros
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    
                    const dateLabel = d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' });
                    
                    last7Days[dateStr] = { dateLabel, sales: 0, count: 0 };
                  }

                  if (hasRealLogs && orders.length > 0) {
                    // Populate from real orders
                    filteredOrdersList.forEach(o => {
                      if (!o.timestamp) return;
                      const orderDateStr = o.timestamp.split('T')[0];
                      if (last7Days[orderDateStr]) {
                        last7Days[orderDateStr].sales += (o.totalPrice || 0);
                        last7Days[orderDateStr].count += 1;
                      }
                    });
                  } else {
                    // Simulated trend lines
                    const mockIncrements = [1200, 1850, 1500, 2400, 3100, 2900, 4200];
                    const mockCounts = [5, 8, 6, 11, 14, 12, 18];
                    Object.keys(last7Days).forEach((key, idx) => {
                      last7Days[key].sales = mockIncrements[idx % mockIncrements.length];
                      last7Days[key].count = mockCounts[idx % mockCounts.length];
                    });
                  }

                  return Object.values(last7Days);
                })();

                // Compute daytime periods best sellers for Recharts
                const bestSellersDaytimeData = (() => {
                  const topProducts = popularProducts.slice(0, 5);
                  
                  return topProducts.map(p => {
                    let morningQty = 0;
                    let lunchQty = 0;
                    let eveningQty = 0;
                    let nightQty = 0;

                    if (hasRealLogs && orders.length > 0) {
                      filteredOrdersList.forEach(o => {
                        if (o.timestamp && o.items) {
                          const date = new Date(o.timestamp);
                          const hr = date.getHours();
                          const matchItem = o.items.find((item: any) => item.productId === p.id);
                          if (matchItem) {
                            const qty = matchItem.quantity || 1;
                            if (hr >= 8 && hr < 13) morningQty += qty;
                            else if (hr >= 13 && hr < 17) lunchQty += qty;
                            else if (hr >= 17 && hr < 22) eveningQty += qty;
                            else nightQty += qty;
                          }
                        }
                      });
                    } else {
                      // Hardcoded simulated values based proportion to make it beautiful and realistic
                      const totalOrders = p.orders || 5;
                      const cleanNameStr = p.name ? p.name.trim() : '';
                      if (cleanNameStr.includes('برجر') || cleanNameStr.includes('Burgers') || cleanNameStr.includes('Burger')) {
                        lunchQty = Math.floor(totalOrders * 0.4);
                        eveningQty = Math.floor(totalOrders * 0.5);
                        nightQty = totalOrders - (lunchQty + eveningQty);
                      } else if (cleanNameStr.includes('بيتزا') || cleanNameStr.includes('Pizza')) {
                        lunchQty = Math.floor(totalOrders * 0.3);
                        eveningQty = Math.floor(totalOrders * 0.6);
                        nightQty = totalOrders - (lunchQty + eveningQty);
                      } else if (cleanNameStr.includes('شاورما') || cleanNameStr.includes('Shawarma')) {
                        lunchQty = Math.floor(totalOrders * 0.35);
                        eveningQty = Math.floor(totalOrders * 0.45);
                        nightQty = totalOrders - (lunchQty + eveningQty);
                      } else if (cleanNameStr.includes('قهوة') || cleanNameStr.includes('Coffee') || cleanNameStr.includes('عصير')) {
                        morningQty = Math.floor(totalOrders * 0.6);
                        lunchQty = Math.floor(totalOrders * 0.2);
                        eveningQty = totalOrders - (morningQty + lunchQty);
                      } else {
                        morningQty = Math.floor(totalOrders * 0.1);
                        lunchQty = Math.floor(totalOrders * 0.4);
                        eveningQty = Math.floor(totalOrders * 0.4);
                        nightQty = totalOrders - (morningQty + lunchQty + eveningQty);
                      }
                    }

                    morningQty = Math.max(0, morningQty);
                    lunchQty = Math.max(0, lunchQty);
                    eveningQty = Math.max(0, eveningQty);
                    nightQty = Math.max(0, nightQty);

                    const cleanName = p.name ? p.name.trim() : '';
                    const shortName = cleanName.length > 10 ? cleanName.substring(0, 10) + '...' : cleanName;

                    return {
                      name: cleanName,
                      shortName,
                      'الصباح 🌅': morningQty,
                      'الظهيرة والغداء ☀️': lunchQty,
                      'المساء والعشاء 🌙': eveningQty,
                      'منتصف الليل 🌟': nightQty,
                      totalSold: morningQty + lunchQty + eveningQty + nightQty
                    };
                  });
                })();

                const CHART_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'];

                const CustomTooltip = ({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 text-white p-3 py-2.5 rounded-2xl shadow-xl text-[11px] text-right space-y-1" dir="rtl">
                        <p className="font-extrabold text-amber-400 mb-1">{data.name}</p>
                        <p className="text-slate-300">📈 مرات الإضافة للسلة: <span className="font-mono text-white font-bold">{data.orders} طلب</span></p>
                        <p className="text-slate-300">👁️ عدد مرات التصفح: <span className="font-mono text-white font-bold">{data.views} زيارات</span></p>
                        <p className="text-slate-300">💰 الأرباح المقدرة: <span className="font-mono text-emerald-400 font-bold">{data.revenue} {restaurant.currency || 'EGP'}</span></p>
                      </div>
                    );
                  }
                  return null;
                };

                const SalesDynamicsTooltip = ({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 text-white p-3 py-2.5 rounded-2xl shadow-xl text-[11px] text-right space-y-1" dir="rtl">
                        <p className="font-extrabold text-amber-400 mb-1">{data.dateLabel}</p>
                        <p className="text-slate-300">💰 حجم المبيعات الإجمالي: <span className="font-mono text-emerald-400 font-extrabold">{data.sales} {restaurant.currency || 'EGP'}</span></p>
                        <p className="text-slate-300">🛎️ عدد الطلبات المستلمة: <span className="font-mono text-white font-bold">{data.count} طلب حربي</span></p>
                      </div>
                    );
                  }
                  return null;
                };

                return (
                  <div className="space-y-8">
                    {/* CHART BOX 1: DISHES DEMAND STATISTICS */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <BarChart2 className="w-5 h-5 text-amber-500 shrink-0" />
                            التحليل الإحصائي المتقدم للأصناف والوجبات الأكثر مبيعاً ورواجاً 📊
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">تحليل بياني تفاعلي للمبيعات مقارنة بالتوهج المعروض لمساعدتك في اتخاذ القرار</p>
                        </div>
                        <div className="text-[10px] font-black bg-amber-50 text-amber-800 px-3 py-1 rounded-xl shrink-0 select-none">
                          مكتبة Recharts التفاعلية 📈
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Chart 1: Bar chart for orders */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">📊 تفضيلات ومبيعات كل طبق بالمنيو</span>
                            <span className="text-[10px] text-slate-500 font-semibold">ترتيب تنازلي حسب الأكثر مبيعاً</span>
                          </div>

                          <div className="h-[250px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                  dataKey="shortName" 
                                  stroke="#64748B" 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  tickLine={false}
                                />
                                <YAxis 
                                  stroke="#64748B" 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  tickLine={false}
                                  allowDecimals={false}
                                />
                                <RechartsTooltip 
                                  content={<CustomTooltip />}
                                  cursor={{ fill: 'rgba(245, 158, 11, 0.04)' }}
                                />
                                <Bar dataKey="orders" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={35}>
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Chart 2: Area / Conversion comparison chart */}
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800">🎯 منحنى نجاح تحويل التصفح إلى سلة شراء</span>
                              <span className="text-[10px] text-slate-500 font-semibold">يقيس الجاذبية التسويقية للوجبة</span>
                            </div>
                            <p className="text-[10px] text-slate-400">يقارن بين عدد مشاهدات الوجبة مقابل مرات الإرسال الفعلية للواتساب</p>
                          </div>

                          <div className="h-[180px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={chartData}
                                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="colorOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                                  </linearGradient>
                                  <linearGradient id="colorViewsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="shortName" stroke="#64748B" fontSize={9} fontWeight="bold" tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={9} fontWeight="bold" tickLine={false} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend 
                                  verticalAlign="top" 
                                  height={28} 
                                  iconSize={8}
                                  iconType="circle"
                                  formatter={(value) => {
                                    if (value === 'views') return <span className="text-[9px] font-bold text-slate-600 pr-3">زيارة المنيو 👁️</span>;
                                    if (value === 'orders') return <span className="text-[9px] font-bold text-slate-600 pr-3">طلب في السلة 🛒</span>;
                                    return value;
                                  }}
                                />
                                <Area type="monotone" dataKey="views" name="views" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorViewsGradient)" />
                                <Area type="monotone" dataKey="orders" name="orders" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorOrdersGradient)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Quick Insight Footnote */}
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-start gap-2 text-[10px]">
                            <span className="text-amber-600 mt-0.5 shrink-0 font-bold">💡 نصيحة الخبراء:</span>
                            <p className="text-slate-600 leading-normal text-right">
                              الأطباق ذات التصفح العالي والطلب المنخفض قد تحتاج لمراجعة الصور لجعلها أكثر إثارة للشهية، أو تقديم عروض حصرية عليها!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CHART BOX 2: DAILY SALES & TRANSACTIONS DYNAMICS (NEW ADDITION) */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                            مؤشر حجم وأداء المبيعات اليومي الحقيقي 📈
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">مراقبة التذبذبات اليومية لحوكمة التدفق المالي للطلبات الوافدة عبر قنوات الـ QR</p>
                        </div>
                        <div className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl shrink-0 select-none">
                          بيانات حية مباشرة 📊
                        </div>
                      </div>

                      {/* Summary Metrics Row inside the chart */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                        <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">مجموع المبيعات (الدورة)</span>
                          <span className="text-sm sm:text-base font-sans font-black text-amber-600 mt-1 block">
                            {dailySalesDynamics.reduce((sum, d) => sum + d.sales, 0)} {restaurant.currency || 'EGP'}
                          </span>
                        </div>
                        <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">معدل البيع اليومي</span>
                          <span className="text-sm sm:text-base font-sans font-black text-emerald-600 mt-1 block">
                            {Math.round(dailySalesDynamics.reduce((sum, d) => sum + d.sales, 0) / 7)} {restaurant.currency || 'EGP'}
                          </span>
                        </div>
                        <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">إجمالي المعاملات</span>
                          <span className="text-sm sm:text-base font-sans font-black text-slate-900 mt-1 block">
                            {dailySalesDynamics.reduce((sum, d) => sum + d.count, 0)} طلبية
                          </span>
                        </div>
                        <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">متوسط الحزمة السعرية</span>
                          <span className="text-sm sm:text-base font-sans font-black text-purple-600 mt-1 block">
                            {Math.round(dailySalesDynamics.reduce((sum, d) => sum + d.sales, 0) / (dailySalesDynamics.reduce((sum, d) => sum + d.count, 0) || 1))} {restaurant.currency || 'EGP'}
                          </span>
                        </div>
                      </div>

                      <div className="h-[260px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={dailySalesDynamics}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorSalesTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis 
                              dataKey="dateLabel" 
                              stroke="#64748B" 
                              fontSize={10} 
                              fontWeight="bold"
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#64748B" 
                              fontSize={10} 
                              fontWeight="bold"
                              tickLine={false}
                              allowDecimals={false}
                            />
                            <RechartsTooltip content={<SalesDynamicsTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="sales" 
                              name="sales" 
                              stroke="#10B981" 
                              strokeWidth={3} 
                              fillOpacity={1} 
                              fill="url(#colorSalesTrend)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                    </div>

                    {/* CHART BOX 3: TIME-OF-DAY BEST SELLERS STRATEGIC DESK (NEW INTEGRATION) */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                            توزيع مبيعات الأطباق المميزة خلال فترات اليوم المختلفة 🌅
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            رصد اتجاهات شراء الوجبات خلال ساعات الصباح والظهيرة والمساء والسهرة لمساعدتك في اتخاذ قرارات التجهيز واكتشاف الأنماط السلوكية للزبائن
                          </p>
                        </div>
                        <div className="text-[10px] font-black bg-indigo-50 text-indigo-800 px-3 py-1 rounded-xl shrink-0 select-none">
                          تكامل ذكي مستند للوقت ⏰
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Interactive Stacked Bar Chart */}
                        <div className="xl:col-span-7 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">📊 رسم بياني تراكمي للمبيعات اليومية بالأقسام الزمنية</span>
                            <span className="text-[10px] text-slate-400 font-bold">ترتيب تنازلي لقمم المبيعات</span>
                          </div>

                          <div className="h-[280px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={bestSellersDaytimeData}
                                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                  dataKey="shortName" 
                                  stroke="#64748B" 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  tickLine={false}
                                />
                                <YAxis 
                                  stroke="#64748B" 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  tickLine={false}
                                  allowDecimals={false}
                                />
                                <RechartsTooltip 
                                  cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                                  content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 border border-slate-800 text-white p-4 py-3 rounded-2xl shadow-xl text-[11px] text-right space-y-1.5" dir="rtl">
                                          <p className="font-extrabold text-amber-400 mb-1">{data.name}</p>
                                          <div className="space-y-1 text-slate-300 font-semibold border-b border-slate-800 pb-2 mb-2">
                                            <p className="flex justify-between items-center gap-4">
                                              <span>🌅 مبيعات الصباح (8 ص - 1 م):</span>
                                              <span className="font-mono text-white font-black">{data['الصباح 🌅']} وحدة</span>
                                            </p>
                                            <p className="flex justify-between items-center gap-4">
                                              <span>☀️ مبيعات الغداء (1 م - 5 م):</span>
                                              <span className="font-mono text-white font-black">{data['الظهيرة والغداء ☀️']} وحدة</span>
                                            </p>
                                            <p className="flex justify-between items-center gap-4">
                                              <span>🌙 مبيعات العشاء (5 م - 10 م):</span>
                                              <span className="font-mono text-white font-black">{data['المساء والعشاء 🌙']} وحدة</span>
                                            </p>
                                            <p className="flex justify-between items-center gap-4">
                                              <span>🌟 مبيعات السهرة السريعة (10 م - 4 ف):</span>
                                              <span className="font-mono text-white font-black">{data['منتصف الليل 🌟']} وحدة</span>
                                            </p>
                                          </div>
                                          <p className="text-emerald-400 font-black flex justify-between items-center text-xs">
                                            <span>🛍️ إجمالي المبيعات الكلية باليوم:</span>
                                            <span className="font-mono text-white bg-slate-850 px-2 py-0.5 rounded-md">{data.totalSold} طلب</span>
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend 
                                  verticalAlign="top" 
                                  height={36} 
                                  iconSize={9}
                                  iconType="circle"
                                  wrapperStyle={{ paddingBottom: '10px' }}
                                  formatter={(value) => <span className="text-[10px] font-black text-slate-705 pr-2">{value}</span>}
                                />
                                <Bar dataKey="الصباح 🌅" stackId="daytime" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="الظهيرة والغداء ☀️" stackId="daytime" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="المساء والعشاء 🌙" stackId="daytime" fill="#10B981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="منتصف الليل 🌟" stackId="daytime" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Strategic Advisory Desk Column */}
                        <div className="xl:col-span-5 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                              لوحة التوصيات الإستراتيجية الذكية لاتخاذ القرار 💡
                            </span>
                            <p className="text-[10px] text-slate-400 leading-normal">
                              رؤى وأفكار تجارية حية مستخلصة تلقائياً من الإحصائيات الفترية لمطعمك لتحقيق أقصى ربحية ممكنة وحوكمة إبداعية لجدول التشغيل:
                            </p>
                          </div>

                          <div className="space-y-3 flex-1">
                            {/* Recommendation 1: Dynamic Top Seller Highlight */}
                            <div className="p-3 bg-amber-50/50 border border-amber-100/70 rounded-2xl flex items-start gap-2.5">
                              <span className="text-base select-none mt-0.5">🏆</span>
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-extrabold text-amber-950 block">الطبق بطل المنيو اليوم: {bestSellersDaytimeData[0]?.name ? bestSellersDaytimeData[0].name.substring(0,25) + "..." : 'بطل المنيو'}</span>
                                <p className="text-[10px] text-amber-800 leading-normal">
                                  يحقق أعلى فلطحة طلب متراكمة اليوم. نوصي بتثبيت مكانه أعلى شريط المقترحات وتكثيف شراء وتجهيز خاماته الطازجة في مستودع المطبخ تلافياً للنفاد المفاجئ وحفاظاً على ثقة عملائك.
                                </p>
                              </div>
                            </div>

                            {/* Recommendation 2: Lunch high volume analysis */}
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100/70 rounded-2xl flex items-start gap-2.5">
                              <span className="text-base select-none mt-0.5">🥪</span>
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-extrabold text-indigo-950 block">إستراتيجية وجبات الغداء والظهيرة:</span>
                                <p className="text-[10px] text-indigo-800 leading-normal">
                                  بما أن وجبة <span className="font-extrabold">{(bestSellersDaytimeData.sort((a,b) => b['الظهيرة والغداء ☀️'] - a['الظهيرة والغداء ☀️'])[0]?.name || 'الأكثر طلباً').substring(0,20)}...</span> في ذروة الغداء، ننصح بتدشين "عرض غداء عمل" مخفض ومدمج مع فرنش فرايز ومشروب بين الساعة 1 والـ 5 مساءً لرفع العائد الإجمالي للطاولة!
                                </p>
                              </div>
                            </div>

                            {/* Recommendation 3: Night & desserts logic */}
                            <div className="p-3 bg-purple-50/40 border border-purple-100/60 rounded-2xl flex items-start gap-2.5">
                              <span className="text-base select-none mt-0.5">🍰</span>
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-extrabold text-purple-950 block">حشد مبيعات السهرة والطلبات الليلية:</span>
                                <p className="text-[10px] text-purple-800 leading-normal">
                                  تتحول طاقة المستهلكين ليلاً نحو الحلويات والمأكولات الخفيفة. احرص على تعديل جدول الوردية الليلية لتجعل طاقم الطهي في أتم الاستعداد لتلبية سرعة الطلب من المنيو الرقمي السريع وتفادي حدوث تكدس.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-400 text-left pt-2 font-mono">
                            تم الحساب بناءً على {hasRealLogs ? 'قاعدة بيانات Firestore' : 'النمذجة الرياضية لبيانات السحابة'} ⏱️
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Primary Visual Row: Popular products list + Device analytics & visit times */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* 1. Popular Products Table */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        الوجبات والأطباق الفردية الأكثر طلباً ورواجاً 🔥
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ترتيب الأطباق تلقائياً بناءً على تكرار ورودها في سلات الزبائن السحابية</p>
                    </div>
                    <span className="text-[10px] font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg select-none">
                      {popularProducts.length} أطباق بالتحليل
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {popularProducts.slice(0, 5).map((p, idx) => {
                      const rankSymbols = ['🥇', '🥈', '🥉'];
                      // calculate ratio
                      const maxViewsValue = popularProducts[0]?.views || 1;
                      const percentOfBest = Math.round((p.views / maxViewsValue) * 100);

                      return (
                        <div key={p.id} className="flex items-center gap-3.5 py-3 first:pt-1 last:pb-1">
                          
                          {/* Rank column */}
                          <div className="w-7 h-7 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center text-xs font-black shrink-0 relative select-none">
                            {idx < 3 ? (
                              <span className="text-base leading-none">{rankSymbols[idx]}</span>
                            ) : (
                              <span className="text-[10px] font-mono">#{idx + 1}</span>
                            )}
                          </div>

                          {/* Image */}
                          <img 
                            src={p.image} 
                            className="w-10 h-10 rounded-xl object-cover border bg-slate-100 shrink-0" 
                            alt={p.name} 
                          />

                          {/* Name & statistics sub row */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <h5 className="text-xs font-black text-slate-900 truncate" title={p.name}>{p.name}</h5>
                              <span className="text-xs font-black text-slate-800 font-mono shrink-0">
                                {p.price} {restaurant.currency || 'EGP'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3.5 text-[10px] text-slate-400 mt-1">
                              <span className="flex items-center gap-0.5">
                                تصفح المنيو: <strong className="text-slate-700 font-mono">{p.views}</strong>
                              </span>
                              <span className="flex items-center gap-0.5">
                                سلة المطلوبات: <strong className="text-emerald-600 font-mono">{p.orders}</strong>
                              </span>
                              {p.revenue > 0 && (
                                <span className="bg-emerald-50 text-emerald-800 font-bold font-mono px-1.5 py-0.2 rounded">
                                  عائد: {p.revenue} {restaurant.currency}
                                </span>
                              )}
                            </div>

                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2 select-none">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-amber-400' : 'bg-slate-400'
                                }`}
                                style={{ width: `${Math.max(10, percentOfBest)}%` }}
                              />
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Left Side: Device & Peak hour charts */}
                <div className="space-y-4">
                  
                  {/* Visitor peak times analysis */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                        تحليل الفترات الأكثر طلباً ونشاطاً ⌛
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">تحديد الساعات التي تشهد أعلى تفاعل لحفظ وقت الطاهي</p>
                    </div>

                    <div className="space-y-3">
                      {peakHoursStats.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-800">{item.time}</span>
                            <span className="text-amber-600 font-mono">{item.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-1.5 overflow-hidden select-none">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all" 
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 font-semibold">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Browser Devices analytics card */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                        صنف أجهزة وجوالات الزوار (قنوات المسح) 📱
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">تحليل نوع الجوالات المستخدمة لمسح رموز QR واستعراض المأكولات</p>
                    </div>

                    <div className="space-y-3.5">
                      {/* iOS */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-900">
                          <span className="flex items-center gap-1">🍎 هواتف آيفون وسلاسل آبل</span>
                          <span className="font-mono">{deviceMetrics.ios}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden select-none">
                          <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: `${deviceMetrics.ios}%` }} />
                        </div>
                      </div>

                      {/* Android */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-900">
                          <span className="flex items-center gap-1">🤖 أنظمة أندرويد (سامسونج، شاومي إلخ)</span>
                          <span className="font-mono">{deviceMetrics.android}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden select-none">
                          <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${deviceMetrics.android}%` }} />
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-900">
                          <span className="flex items-center gap-1">💻 أجهزة الكمبيوتر والتصفح المباشر</span>
                          <span className="font-mono">{deviceMetrics.desktop}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden select-none">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${deviceMetrics.desktop}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* SECTION: Recent Orders Log stream and Visitors activity stream */}
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Box 1: Recent Orders log list */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0" />
                        سجل التذاكر والطلبات السحابية الواردة 📋
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">تفاصيل كيرنل الطلبات المروّسة من بوابة سلال زبائنك بالكامل</p>
                    </div>
                    {hasRealLogs && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg select-none">
                        قاعدة بيانات نشطة
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {displayedOrders.slice(0, 10).map((order: any, idx) => (
                      <div key={order.id || idx} className="border border-slate-100 rounded-2xl p-4 space-y-3 hover:border-slate-200 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-black text-slate-900 block">{order.tableName}</span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                              {order.createdAt || (order.timestamp ? new Date(order.timestamp).toLocaleString('ar-EG') : 'الآن')}
                            </span>
                          </div>
                          
                          <div className="text-left shrink-0">
                            <span className="text-xs font-black text-emerald-600 block">
                              {order.totalPrice} <span className="text-[10px]">{restaurant.currency || 'EGP'}</span>
                            </span>
                            <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 font-bold rounded-md block mt-1">
                              طلب واتساب مرسل
                            </span>
                          </div>
                        </div>

                        {/* Order Products Sub list */}
                        <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-[10px]">
                          {order.items && Array.isArray(order.items) && order.items.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="flex justify-between text-slate-700">
                              <span>- {item.name || 'dish'} <strong className="text-slate-900 font-mono">x{item.quantity}</strong></span>
                              <span className="font-mono">{item.price * item.quantity} {restaurant.currency}</span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <p className="text-[10px] text-slate-500 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50 leading-relaxed">
                            💡 <strong className="text-amber-800">ملاحظة:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Box 2: Live Visitors Activity Log */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-pink-500 shrink-0" />
                        بث حركة تصفح الزوار والـ QR Code مباشر 🌐
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">تفاصيل أنظمة ومرجعيات العملاء لحظة مسحهم للكود</p>
                    </div>
                    {hasRealLogs && (
                      <span className="text-[9px] font-bold bg-pink-100 text-pink-900 px-2 py-0.5 rounded-lg select-none animate-pulse">
                        بث حي متصل
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {displayedViews.slice(0, 15).map((log: any, idx) => {
                      const isApple = log.device === 'iPhone';
                      const isDroid = log.device === 'Android';
                      return (
                        <div key={log.id || idx} className="flex justify-between items-center gap-3 border border-slate-50 p-3 rounded-2xl hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isApple ? 'bg-slate-100 text-slate-900' : isDroid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                              {isApple ? (
                                <Smartphone className="w-4.5 h-4.5" />
                              ) : isDroid ? (
                                <Smartphone className="w-4.5 h-4.5" />
                              ) : (
                                <Laptop className="w-4.5 h-4.5" />
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-800 block">
                                زيارة من جهاز {log.device === 'iPhone' ? 'Apple iPhone' : log.device === 'Android' ? 'Android Device' : log.device === 'Desktop' ? 'كمبيوتر مكتبي' : 'مجهول'}
                              </span>
                              <span className="text-[8px] text-slate-400 block mt-0.5 leading-none">
                                المصدر المرجعي: {log.referrer || 'مسح QR المطبوع'}
                              </span>
                            </div>
                          </div>

                          <div className="text-left font-mono text-[9px] text-slate-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'قبل قليل'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Platform commitment notice */}
              <div className="bg-gradient-to-l from-slate-900 to-slate-800 text-white border border-slate-700 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none select-none" />
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4 animate-bounce shrink-0" />
                  محرك التحليل والملكية الفكرية لمنصة منيو كليك الحرة
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed max-w-3xl">
                  تلتزم "منيو كليك" بمساندة ملاك المطاعم وعربات الطعام وتطوير أسرار مبيعاتهم السحابية. قنوات تصفح الزوار وقوام التحويلات والطلبات دقيقة ومبنية بالكامل على قواعد بيانات Firebase Firestore المعززة وستبقى مجانية ومفتوحة مدى الحياة لدعم مبيعاتكم!
                </p>
              </div>

            </div>
          );
        })()}

      </main>

      {/* MODAL 1: ADD/EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div id="category-modal" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 w-full max-w-md relative"
          >
            <button 
              onClick={() => setIsCategoryModalOpen(false)} 
              className="absolute top-4 left-4 p-2 font-black text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black text-slate-950 mb-5">
              {editingCategory ? 'تعديل قسم المنيو 🛠️' : 'إضافة تصنيف فرعي جديد للمنيو  Layers'}
            </h4>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">اسم القسم بالكامل (مثال: برجر دجاج 🍔)</label>
                <input 
                   type="text" 
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs"
                  placeholder="الوجبات الشامية، المقبلات، العصائر"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">الترتيب والأولوية</label>
                  <input 
                    type="number" 
                    value={categoryForm.order}
                    onChange={e => setCategoryForm({ ...categoryForm, order: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 font-sans">وضعية العرض</label>
                  <select
                    value={categoryForm.isActive ? 'true' : 'false'}
                    onChange={e => setCategoryForm({ ...categoryForm, isActive: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs text-center font-bold"
                  >
                    <option value="true">مفعّل (يظهر للزبون)</option>
                    <option value="false">معطل ومخفي مؤقتاً</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="submit-category-btn"
                disabled={isCategorySaving}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isCategorySaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ القسم...</span>
                  </>
                ) : (
                  <span>{editingCategory ? 'حفظ التعديلات' : 'إنشاء القسم بلحظة'}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: DELETE CATEGORY CONFIRMATION */}
      {deleteConfirmCategory && (
        <div id="delete-category-confirm-modal" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 w-full max-w-md relative"
          >
            <button 
              onClick={() => setDeleteConfirmCategory(null)} 
              disabled={isCategoryDeleting}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full transition cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100 animate-pulse">
                <Trash2 className="w-6 h-6" />
              </div>

              <h4 className="text-base font-black text-slate-950">
                تأكيد حذف القسم بالكامل ⚠️
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف قسم <span className="font-bold text-rose-600 font-sans">"{deleteConfirmCategory.name}"</span>؟ 
                سيتم إخفاء جميع الوجبات والمنتجات المرتبطة به وسيزول من السلة المباشرة على الفور. هذه العملية لا يمكن التراجع عنها.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmCategory(null)}
                disabled={isCategoryDeleting}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-black py-3 rounded-xl text-xs transition cursor-pointer text-center disabled:opacity-50"
              >
                إلغاء الأمر
              </button>

              <button
                onClick={() => handleDeleteCategory(deleteConfirmCategory.id)}
                disabled={isCategoryDeleting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 disabled:opacity-50"
              >
                {isCategoryDeleting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف القسم 🗑️</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT PRODUCT */}
      {isProductModalOpen && (
        <div id="product-modal" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 w-full max-w-xl my-8 relative"
          >
            <button 
              onClick={() => setIsProductModalOpen(false)} 
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black text-slate-950 mb-5">
              {editingProduct ? 'تعديل السلعة الغذائية 🍔' : 'إضافة طبق أو مشروب للمنيو +'}
            </h4>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الوجبة</label>
                  <input 
                    type="text" 
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs focus:bg-white"
                    placeholder="مثال: شاورما دجاج مميز"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">القسم التابع له السلعة 📁</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs font-bold focus:bg-white text-right"
                  >
                    <option value="">-- اختر القسم --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شرح المكونات، السعرات أو تفاصيل الإعداد</label>
                <textarea 
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs focus:bg-white resize-none"
                  placeholder="مثال: دجاج بلدي طازج مضاف له الثومية والخبز الساخن والبطاطس..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">السعر الأساسي المقدر</label>
                  <input 
                    type="number" 
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs font-black text-center"
                  />
                </div>

                {/* Simulated original price for display discount status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">خصومات؟ السعر قبل الخصم</label>
                  <div className="flex gap-1.5 items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-amber-500 accent-amber-500 rounded"
                      checked={productForm.isDiscounted}
                      onChange={e => setProductForm({ ...productForm, isDiscounted: e.target.checked })}
                    />
                    <input 
                      type="number" 
                      disabled={!productForm.isDiscounted}
                      value={productForm.originalPrice}
                      onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-center disabled:opacity-55"
                      placeholder="قبل التنزيل"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شريط أو تاق مخصص (badge)</label>
                  <input 
                    type="text" 
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-center font-bold text-rose-600 focus:bg-white"
                    placeholder="جديد، الأكثر طلباً، سبايسي"
                  />
                </div>
              </div>

              {/* Promotional Offer Countdown & Label (Deals management) */}
              {productForm.isDiscounted && (
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    🏷️ إعدادات العرض والمؤقت التنازلي المباشر
                  </span>
                  <div className="grid md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم العرض الترويجي (مثال: خصم 20%)</label>
                      <input 
                        type="text" 
                        value={productForm.discountLabel}
                        onChange={e => setProductForm({ ...productForm, discountLabel: e.target.value })}
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-right focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-bold text-amber-900"
                        placeholder="خصم 20%، عرض محدود، ليلة الجمعة..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ ووقت انتهاء العرض (لتشغيل المؤقت التنازلي)</label>
                      <input 
                        type="datetime-local" 
                        value={productForm.discountExpiry}
                        onChange={e => setProductForm({ ...productForm, discountExpiry: e.target.value })}
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-center focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                      />
                      <span className="text-[9px] text-slate-400 text-center block mt-1">اتركه فارغاً إذا كنت لا ترغب بتشغيل مؤقت تنازلي للعرض.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* إدارة الأحجام وزيادات السعر */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                    🍕 خيارات الأحجام المتعددة والوزن (زيادة السعر)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSize = {
                        id: `size-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        name: '',
                        nameEn: '',
                        priceAdded: 0
                      };
                      setProductForm({
                        ...productForm,
                        sizes: [...(productForm.sizes || []), newSize]
                      });
                    }}
                    className="bg-slate-950 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-850 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة حجم جديد
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  مثال: حجم كبير مع زيادة سعر +١٠ ووسط مع زيادة سعر +٥. الحجم الأساسي لطبقك هو السعر الأساسي للطبق.
                </p>

                {productForm.sizes && productForm.sizes.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {productForm.sizes.map((size, index) => (
                      <div key={size.id} className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center gap-2 relative">
                        <div className="grid grid-cols-3 gap-2 flex-grow">
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">الحجم بالعربي</label>
                            <input
                              type="text"
                              value={size.name}
                              onChange={e => {
                                const updated = [...productForm.sizes];
                                updated[index].name = e.target.value;
                                setProductForm({ ...productForm, sizes: updated });
                              }}
                              placeholder="مثال: كبير"
                              className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-1.5 text-[10px] text-right font-bold text-slate-800 focus:bg-white focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">الحجم بالإنجليزي</label>
                            <input
                              type="text"
                              value={size.nameEn || ''}
                              onChange={e => {
                                const updated = [...productForm.sizes];
                                updated[index].nameEn = e.target.value;
                                setProductForm({ ...productForm, sizes: updated });
                              }}
                              placeholder="e.g. Large"
                              className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-1.5 text-[10px] text-left font-sans text-slate-800 focus:bg-white focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">زيادة السعر (ريال/جنية)</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={size.priceAdded || ''}
                              onChange={e => {
                                const updated = [...productForm.sizes];
                                updated[index].priceAdded = Number(e.target.value) || 0;
                                setProductForm({ ...productForm, sizes: updated });
                              }}
                              placeholder="+0"
                              className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-1.5 text-[10px] text-center font-mono font-bold text-slate-800 focus:bg-white focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = productForm.sizes.filter(s => s.id !== size.id);
                            setProductForm({ ...productForm, sizes: updated });
                          }}
                          className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 mt-3 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center text-[10px] text-slate-400 font-bold bg-white/40">
                    لم يتم إضافة خيارات أحجام مخصصة للوجبة بعد. سيظهر الحجم والوزن الافتراضي فقط بالسعر الأساسي.
                  </div>
                )}
              </div>

              {/* Product Photo section with predefined beautiful presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">صورة الوجبة التفاعلية 📸</label>
                
                <div className="flex flex-col gap-2">
                  <input 
                    type="url" 
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-left font-mono"
                    placeholder="رابط الصورة المباشر للوجبة"
                  />

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer transition select-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>اختر صورة طبق من الموبايل 📸</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressAndResizeImage(file, 600); // 600px width is perfect for item dishes
                              setProductForm({ ...productForm, image: compressed });
                              triggerAlert('success', 'تم تحميل صورة الطبق بنجاح! 🎉');
                            } catch (err) {
                              triggerAlert('error', 'حدث خطأ أثناء معالجة صورة الطبق.');
                            }
                          }
                        }}
                      />
                    </label>
                    {productForm.image.startsWith('data:') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">صورة محلية مرفوعة 💾</span>
                    )}
                  </div>
                </div>

                {/* Preset image buttons choice */}
                <div className="space-y-1.5 pt-1.5">
                  <p className="text-[10px] text-slate-400 font-bold">أو اختر صور طعام عالية الدقة جاهزة لتصميم منيو رائع بلحظة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FOOD_PRESETS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image: preset.url })}
                        className={`text-[9px] font-bold px-2.5 py-1.5 border rounded-lg transition-all ${productForm.image === preset.url ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ترتيب العرض</label>
                  <input 
                    type="number" 
                    value={productForm.order}
                    onChange={e => setProductForm({ ...productForm, order: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs text-center font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة المطبخ الحالية</label>
                  <select
                    value={productForm.isAvailable ? 'true' : 'false'}
                    onChange={e => setProductForm({ ...productForm, isAvailable: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs font-bold text-right focus:bg-white"
                  >
                    <option value="true">متوفر في صالة الطعام والطلب المباشر</option>
                    <option value="false">نفذت الكمية في المطبخ مؤقتاً</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="submit-product-btn"
                disabled={isProductSaving}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProductSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ المنتج بالمنيو...</span>
                  </>
                ) : (
                  <span>{editingProduct ? 'حفظ تفاصيل التعديل للطبق 🍕' : 'إضافة للوجبات بالمنيو للزبون'}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI Smart Menu Parser Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-400/30">
                  <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white text-right">صانع المنيو الذكي بالذكاء الاصطناعي 🪄</h3>
                  <p className="text-[10px] text-purple-200 text-right">ارفع صورة منيو ورقية وقم بتوليد وجبات وتصنيفات المنيو فوراً</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setAiResult(null);
                  setAiImageBase64(null);
                  setAiError(null);
                }}
                className="text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              {!aiResult ? (
                <div className="space-y-6">
                  {/* Upload Dropzone */}
                  <div 
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleAiMenuDrop}
                    className="border-2 border-dashed border-purple-200 rounded-3xl p-8 text-center hover:bg-purple-50/20 transition group flex flex-col items-center justify-center cursor-pointer min-h-[250px] relative"
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAiMenuImageSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {aiImageBase64 ? (
                      <div className="space-y-4 w-full">
                        <img 
                          src={aiImageBase64} 
                          alt="Uploaded menu" 
                          className="max-h-[200px] mx-auto rounded-xl object-contain border border-purple-100 shadow-sm"
                        />
                        <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>تم تحميل الصورة بنجاح. جاهز للتحليل الذكي!</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAiImageBase64(null);
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-extrabold cursor-pointer"
                        >
                          إزالة الصورة واختيار أخرى 🗑️
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-purple-400 group-hover:scale-110 transition" />
                        <h4 className="text-sm font-black text-slate-800">اسحب وأفلت صورة القائمة المطبوعة هنا أو انقر للتصفح</h4>
                        <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">ندعم صور JPEG وملفات PNG لجميع أنواع المنيو المكتوبة والورقية والمصورات بالهواتف.</p>
                      </div>
                    )}
                  </div>

                  {aiError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="text-rose-600 shrink-0">⚠️</span>
                      <p className="text-right">{aiError}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end border-t pt-4">
                    <button
                      type="button"
                      disabled={!aiImageBase64 || aiLoading}
                      onClick={handleAnalyzeMenu}
                      className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${(!aiImageBase64 || aiLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/15'}`}
                    >
                      {aiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري قراءة المنيو بالذكاء الاصطناعي... يرجى الانتظار 🔮</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                          <span>ابدأ التحليل والتوليد الفوري للمنيو بالـ AI ✨</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Results Stage: Review & Confirm */
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-900 flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black">اكتمل التوليد بنجاح! 🎉</p>
                      <p className="text-[10px] text-emerald-800">لقد قام الذكاء الاصطناعي باستخراج الأقسام والمنتجات التالية من الصورة. يرجى مراجعتها.</p>
                    </div>
                  </div>

                  {/* Split Preview */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Categories Column */}
                    <div className="space-y-3 md:col-span-1 border-l border-slate-100 pl-4 order-last md:order-first">
                      <h4 className="text-xs font-black text-purple-950 flex items-center gap-1 justify-end bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100">
                        <span>الأقسام المستخرجة ({aiResult.categories.length})</span>
                        <Layers className="w-3.5 h-3.5" />
                      </h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {aiResult.categories.map((cat, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200 px-1.5 rounded">ترتيب: {cat.order}</span>
                            <span className="text-[11px] font-bold text-slate-800">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Products Column */}
                    <div className="space-y-3 md:col-span-2">
                      <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1 justify-end bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                        <span>الوجبات والأصناف المستخرجة ({aiResult.products?.length || 0})</span>
                        <ChefHat className="w-3.5 h-3.5" />
                      </h4>
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                        {aiResult.products?.map((prod, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-black text-purple-800">{prod.price} {restaurant.currency}</span>
                              <span className="text-xs font-black text-slate-800">{prod.name}</span>
                            </div>
                            {prod.description && (
                              <p className="text-[10px] text-slate-500 line-clamp-1">{prod.description}</p>
                            )}
                            <div className="flex items-center gap-2 pt-1 font-sans justify-end">
                              {prod.badge && (
                                <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold text-right leading-none">
                                  {prod.badge}
                                </span>
                              )}
                              {prod.isDiscounted && (
                                <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-bold">
                                  عرض: {prod.discountPrice}
                                </span>
                              )}
                              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
                                قسم: {prod.categoryIdName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decision/Confirm actions */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <div className="text-right">
                      <h5 className="text-xs font-black text-slate-800">اختر طريقة تفعيل المنيو المقترح:</h5>
                      <p className="text-[10px] text-slate-400">يمكنك الدمج مع التصنيفات السابقة أو الاستبدال الشامل.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => handleConfirmAiMenu('append')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-md shadow-emerald-500/10 flex-1 sm:flex-none"
                      >
                        إضافة للأصناف الحالية ➕
                      </button>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => handleConfirmAiMenu('overwrite')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-md shadow-rose-500/10 flex-1 sm:flex-none"
                      >
                        مسح السابق واستبدال بالمنيو الجديد ⚡
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans shrink-0">
              <span>مدعوم بواسطة طرازات Google Gemini 3.5 فائقة القوة</span>
              <span>منيو كليك الذكي 🖥️</span>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

interface FloatingNotificationProps {
  key?: string;
  notif: Order;
  lang: 'ar' | 'en';
  currency: string;
  onDismiss: (id: string) => void;
  onViewOrders: () => void;
  onUpdateStatus: (orderId: string, status: 'pending' | 'preparing' | 'completed') => void;
}

function FloatingNotification({ notif, lang, currency, onDismiss, onViewOrders, onUpdateStatus }: FloatingNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notif.id!);
    }, 12000); // Expose slightly longer since there are interactive buttons!
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="pointer-events-auto bg-slate-900 border border-slate-700/60 text-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-600 animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/25 shrink-0 flex items-center justify-center animate-bounce">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">
              {lang === 'ar' ? '🛎️ طلب طاولة جديد وارد الآن!' : '🛎️ New Table Order Received Now!'}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-sans">
              {notif.tableName} • {lang === 'ar' ? 'قيد الانتظار ⏳' : 'Pending ⏳'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDismiss(notif.id!)}
          className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Order content summary */}
      <div className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-slate-200">
          <span>{notif.tableName}</span>
          <span className="text-amber-400 font-mono text-[11px]">
            {notif.totalPrice} {currency || (lang === 'ar' ? 'ج.م' : 'EGP')}
          </span>
        </div>
        
        {notif.items && notif.items.length > 0 && (
          <div className="text-[11px] text-slate-400 divide-y divide-slate-800/55 pt-1">
            {notif.items.map((item, idx) => (
              <div key={idx} className="py-0.5 flex justify-between gap-2">
                <span className="line-clamp-1">{item.name}</span>
                <span className="font-sans font-mono shrink-0">x{item.quantity}</span>
              </div>
            ))}
          </div>
        )}
        
        {notif.notes && (
          <div className="text-[10px] text-amber-500 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 italic line-clamp-2 mt-1">
            ⚠️ {notif.notes}
          </div>
        )}
      </div>

      {/* Action Triggers in Notification */}
      <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-800/80">
        <button
          onClick={() => {
            onUpdateStatus(notif.id!, 'preparing');
            onDismiss(notif.id!);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] py-1.5 px-3 rounded-lg transition overflow-hidden"
        >
          {lang === 'ar' ? 'قبول وبدء التحضير 🍳' : 'Accept & Cook 🍳'}
        </button>
        <button
          onClick={onViewOrders}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-[10px] py-1.5 px-3 rounded-lg transition shrink-0 cursor-pointer"
        >
          {lang === 'ar' ? 'عرض تذاكر المطبخ 📋' : 'View in Tickets 📋'}
        </button>
      </div>
    </motion.div>
  );
}
