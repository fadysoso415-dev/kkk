/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  ChefHat, 
  Phone, 
  MapPin, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Sun, 
  Moon, 
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  ChevronDown,
  Share2,
  MessageCircle
} from 'lucide-react';
import { Restaurant, Category, Product, CartItem, Order, ProductSize } from '../types';

interface OfferCountdownProps {
  expiry: string;
  lang: 'ar' | 'en';
}

export const OfferCountdown: React.FC<OfferCountdownProps> = ({ expiry, lang }) => {
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiry) - +new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40 font-semibold shrink-0">
        ⏱️ {lang === 'en' ? 'Offer ended!' : 'انتهى العرض!'}
      </span>
    );
  }

  const parts: string[] = [];
  if (timeLeft.days > 0) {
    parts.push(lang === 'en' ? `${timeLeft.days}d` : `${timeLeft.days}ي`);
  }
  if (timeLeft.hours > 0 || timeLeft.days > 0) {
    parts.push(lang === 'en' ? `${timeLeft.hours}h` : `${timeLeft.hours}س`);
  }
  parts.push(lang === 'en' ? `${timeLeft.minutes}m` : `${timeLeft.minutes}د`);
  parts.push(lang === 'en' ? `${timeLeft.seconds}s` : `${timeLeft.seconds}ث`);

  return (
    <div className="inline-flex items-center gap-1 bg-rose-500/15 dark:bg-rose-400/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-xl text-[9px] font-black tracking-tight shrink-0 font-mono select-none">
      <span className="animate-pulse">⏱️</span>
      <span className="font-bold">{lang === 'en' ? 'Ends in:' : 'ينتهي خلال:'}</span>
      <span className="font-black text-rose-700 dark:text-rose-400">{parts.join(' ')}</span>
    </div>
  );
};
import { 
  getRestaurantBySlug, 
  getCategories, 
  getProducts, 
  incrementRestaurantViews, 
  incrementWhatsappOrders,
  logMenuView,
  logOrder,
  db
} from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { SAMPLE_RESTAURANTS, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../sampleData';

const THEME_PRESETS = {
  amber: {
    primary: '#d97706',
    text: 'text-amber-600 dark:text-amber-400',
    accentText: 'text-amber-700 dark:text-amber-400',
    bgLight: 'bg-amber-500/10 dark:bg-amber-400/10',
    borderLight: 'border-amber-500/20',
    bg: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-600',
    shadow: 'shadow-amber-500/10 shadow-md',
    spinnerBorder: 'border-amber-500'
  },
  emerald: {
    primary: '#059669',
    text: 'text-emerald-600 dark:text-emerald-400',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    borderLight: 'border-emerald-500/20',
    bg: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-600',
    shadow: 'shadow-emerald-500/10 shadow-md',
    spinnerBorder: 'border-emerald-500'
  },
  rose: {
    primary: '#e11d48',
    text: 'text-rose-600 dark:text-rose-400',
    accentText: 'text-rose-700 dark:text-rose-400',
    bgLight: 'bg-rose-500/10 dark:bg-rose-400/10',
    borderLight: 'border-rose-500/20',
    bg: 'bg-rose-500',
    hoverBg: 'hover:bg-rose-600',
    shadow: 'shadow-rose-500/10 shadow-md',
    spinnerBorder: 'border-rose-500'
  },
  indigo: {
    primary: '#4f46e5',
    text: 'text-indigo-600 dark:text-indigo-400',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    bgLight: 'bg-indigo-500/10 dark:bg-indigo-400/10',
    borderLight: 'border-indigo-500/20',
    bg: 'bg-indigo-500',
    hoverBg: 'hover:bg-indigo-600',
    shadow: 'shadow-indigo-500/10 shadow-md',
    spinnerBorder: 'border-indigo-500'
  },
  slate: {
    primary: '#475569',
    text: 'text-slate-600 dark:text-slate-400',
    accentText: 'text-slate-700 dark:text-slate-400',
    bgLight: 'bg-slate-500/10 dark:bg-slate-400/10',
    borderLight: 'border-slate-500/20',
    bg: 'bg-slate-500',
    hoverBg: 'hover:bg-slate-600',
    shadow: 'shadow-slate-500/10 shadow-md',
    spinnerBorder: 'border-slate-500'
  },
  violet: {
    primary: '#7c3aed',
    text: 'text-violet-600 dark:text-violet-400',
    accentText: 'text-violet-700 dark:text-violet-400',
    bgLight: 'bg-violet-500/10 dark:bg-violet-400/10',
    borderLight: 'border-violet-500/20',
    bg: 'bg-violet-500',
    hoverBg: 'hover:bg-violet-600',
    shadow: 'shadow-violet-500/10 shadow-md',
    spinnerBorder: 'border-violet-500'
  },
  dark: {
    primary: '#111827',
    text: 'text-slate-900 dark:text-slate-100',
    accentText: 'text-slate-800 dark:text-slate-300',
    bgLight: 'bg-slate-100 dark:bg-slate-800',
    borderLight: 'border-slate-200 dark:border-slate-850',
    bg: 'bg-slate-900 dark:bg-slate-800',
    hoverBg: 'hover:bg-slate-800 dark:hover:bg-slate-700',
    shadow: 'shadow-slate-900/10 shadow-md',
    spinnerBorder: 'border-slate-700'
  },
  autumn: {
    primary: '#ea580c',
    text: 'text-orange-600 dark:text-orange-400',
    accentText: 'text-orange-700 dark:text-orange-400',
    bgLight: 'bg-orange-500/10 dark:bg-orange-400/10',
    borderLight: 'border-orange-500/20',
    bg: 'bg-orange-500',
    hoverBg: 'hover:bg-orange-600',
    shadow: 'shadow-orange-500/10 shadow-md',
    spinnerBorder: 'border-orange-500'
  },
  coffee: {
    primary: '#78350f',
    text: 'text-amber-900 dark:text-amber-300',
    accentText: 'text-amber-950 dark:text-amber-200',
    bgLight: 'bg-amber-950/10 dark:bg-amber-950/15',
    borderLight: 'border-amber-950/20',
    bg: 'bg-amber-950',
    hoverBg: 'hover:bg-amber-900',
    shadow: 'shadow-amber-950/10 shadow-md',
    spinnerBorder: 'border-amber-950'
  }
};

interface MenuViewerProps {
  restaurantSlug: string;
  onBackToLanding: () => void;
  lang?: 'ar' | 'en';
}

export default function MenuViewer({ restaurantSlug, onBackToLanding, lang: initialLang = 'ar' }: MenuViewerProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [modalSelectedSize, setModalSelectedSize] = useState<ProductSize | undefined>(undefined);

  useEffect(() => {
    if (selectedProductDetails && selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0) {
      setModalSelectedSize(selectedProductDetails.sizes[0]);
    } else {
      setModalSelectedSize(undefined);
    }
  }, [selectedProductDetails]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);

  useEffect(() => {
    if (initialLang) {
      setLang(initialLang);
    }
  }, [initialLang]);

  const t = {
    ar: {
      searchPlaceholder: "ابحث عن وجبة أو شراب في الـ QR...",
      allCategories: "كل المأكولات 🍽️",
      cartTitle: "سلة المأكولات والمقبلات (الـ QR)",
      emptyCart: "السلة فارغة حالياً. أضف وجباتك لتسهيل تجهيز المطبخ!",
      tableNameLabel: "رقم أو كود طاولة الجلوس / اسم الزبون 🛎️ *",
      tableNamePlaceholder: "طاولة رقم #4 أو سفري عائلي",
      notesLabel: "إرشادات المطبخ أو بهارات خاصة للوجبة (اختياري)",
      notesPlaceholder: "مثال: بدون مايونيز، صوص زيادة...",
      orderPrice: "إجمالي السلة ✅",
      subtotal: "الحساب الإجمالي للطلب 🧾",
      submitOrder: "إرسال الطلب عبر الواتس اب 💬",
      addToCart: "إضافة للسلة +",
      outOfStock: "غير متوفر مؤقتاً ⛔",
      shareMenu: "مشاركة",
      welcome: "مرحباً",
      currencySymbol: restaurant?.currency || "EGP",
      noAvailable: "غير متوفر ❌",
      cartSubtotal: "حساب الوجبات الفرعي:",
      taxNote: "شامل ضريبة القيمة المضافة ورسم الطاولة.",
      smartRecommendations: "توصيات ذكية ✨",
      toastShare: "تم نسخ رابط المنيو بنجاح (QR URL)! جاهز الآن للمشاركة 📋",
      toastNoShare: "عذراً، لم نتمكن من نسخ الرابط تلقائياً.",
      requiredTableError: "الرجاء تحديد رقم الطاولة أو اسم المستلم لتزويد الطاهي بالهوية الصحيحة للطلب.",
      updatingCart: "تحديث الطلب ومراجعته 📱",
      closedToday: "انتهى اليوم",
      backLink: "منيو كليك",
      chatRestaurant: "محادثة المطعم 💬",
      whatsappRest: "واتساب المطعم 💬",
      invoiceTitle: "إجمالي الحساب الفاتورة:",
      notAvailableDesc: "لا توجد منتجات مطابقة لعملية البحث",
      notAvailablep: "جرب تصفح قسم آخر أو تعديل حقول البحث.",
      checkoutWarning: "سيتم تجهيز طلبك في المطبخ وتحويلك لتستلم تفاصيل الفاتورة على الواتساب مع العاملين بالصالة.",
      shareText: `تصفح منيو ${restaurant?.name} الإلكتروني والطلب المباشر! 🍽️✨`,
      quickTypeLabel: "تصفية سريعة حسب تخصص الطبق:",
      quickAll: "الكل 🍽️",
      quickAppetizer: "مقبلات 🍟",
      quickMain: "الرئيسية 🍔",
      quickDessert: "حلويات/مشروبات 🍰",
      closeBtn: "إغلاق ❌",
      kcal: "سعرة حرارية",
      prepTime: "دقيقة تحضير",
      detailsTitle: "تفاصيل الطبق والصور التوضيحية"
    },
    en: {
      searchPlaceholder: "Search for food or drinks... 🔍",
      allCategories: "All Dishes 🍽️",
      cartTitle: "Food & Drinks Cart (QR)",
      emptyCart: "Your cart is empty! Add dishes to prepare your order.",
      tableNameLabel: "Table Number or Customer Name 🛎️ *",
      tableNamePlaceholder: "Table #4 or Takeaway",
      notesLabel: "Kitchen instructions or special spices (Optional)",
      notesPlaceholder: "E.g., No mayo, extra sauce, warm...",
      orderPrice: "Cart Total ✅",
      subtotal: "Total Invoice Amount 🧾",
      submitOrder: "Send Order via WhatsApp Now 💬",
      addToCart: "Add to Cart +",
      outOfStock: "Out of Stock today ⛔",
      shareMenu: "Share",
      welcome: "Welcome",
      currencySymbol: restaurant?.currencyEn || restaurant?.currency || "EGP",
      noAvailable: "Out of Stock ❌",
      cartSubtotal: "Items Subtotal:",
      taxNote: "Includes VAT and service charge.",
      smartRecommendations: "Smart choices ✨",
      toastShare: "Menu link successfully copied to clipboard! Share it! 📋",
      toastNoShare: "Sorry, failed to copy the link automatically.",
      requiredTableError: "Please specify table number or customer name to place order.",
      updatingCart: "Review & Order 📱",
      closedToday: "Finished Today",
      backLink: "MenuClick",
      chatRestaurant: "Chat live 💬",
      whatsappRest: "WhatsApp 💬",
      invoiceTitle: "Total Invoice Amount:",
      notAvailableDesc: "No items matching your search key",
      notAvailablep: "Try choosing another category or clearing search filter.",
      checkoutWarning: "Your order will be prepared in our kitchen and you will be redirected to confirm details on WhatsApp.",
      shareText: `Check out ${restaurant?.nameEn || restaurant?.name}'s digital menu and order now! 🍽️✨`,
      quickTypeLabel: "Quick filter by type:",
      quickAll: "All 🍽️",
      quickAppetizer: "Starter 🍟",
      quickMain: "Main 🍔",
      quickDessert: "Sweet/Drink 🍰",
      closeBtn: "Close ❌",
      kcal: "kcal",
      prepTime: "mins prep",
      detailsTitle: "Dish Details & Illustrations"
    }
  }[lang];

  // Custom function to show a beautiful temporary message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Web Share API with Clipboard Fallback
  const handleShare = async () => {
    if (!restaurant) return;
    const shareUrl = window.location.href;
    const shareTitle = lang === 'en' ? (restaurant.nameEn || restaurant.name) : restaurant.name;
    const shareText = t.shareText;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Share operation cancelled or blocked:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        triggerToast(t.toastShare);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        triggerToast(t.toastNoShare);
      }
    }
  };

  // Cart Management States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [tableNameInput, setTableNameInput] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // Live client-side orders monitoring states
  const [myLiveOrders, setMyLiveOrders] = useState<Order[]>([]);
  const [showMyOrdersModal, setShowMyOrdersModal] = useState(false);

  // Status tracking refs and synthesized chime alerts
  const previousStatusesRef = useRef<Record<string, string>>({});

  const playNotificationSound = (type?: 'success' | 'status_change') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      if (type === 'success' || type === 'status_change') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.15, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);

        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.frequency.setValueAtTime(783.99, now + 0.18); // G5
        gain3.gain.setValueAtTime(0, now + 0.18);
        gain3.gain.linearRampToValueAtTime(0.15, now + 0.23);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc3.start(now + 0.18);
        osc3.stop(now + 0.6);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (err) {
      console.warn("Could not synth notify chime", err);
    }
  };

  useEffect(() => {
    if (!restaurant?.id || restaurant.id === 'my-restaurant') return;
    
    let localKeys: { id: string; tableName: string; timestamp: string }[] = [];
    try {
      const storageKey = `menu_click_orders_${restaurant.id}`;
      localKeys = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      console.warn("Could not parse my orders from localStorage", e);
    }

    if (localKeys.length === 0) return;

    const unsubscribes: (() => void)[] = [];
    
    const watchOrders = async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        localKeys.forEach((key) => {
          const docRef = doc(db, 'restaurants', restaurant.id, 'orders', key.id);
          const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const orderData = { id: docSnap.id, ...docSnap.data() } as Order;
              
              // Detect if status changed and play a beautiful chime and trigger toast
              const prevStatus = previousStatusesRef.current[orderData.id!];
              if (prevStatus && prevStatus !== orderData.status) {
                playNotificationSound('status_change');
                if (orderData.status === 'preparing') {
                  triggerToast(lang === 'ar' 
                    ? `🍳 بدأ تحضير طلبك بـ (${orderData.tableName}) في المطبخ الآن!` 
                    : `🍳 Cooking of your order (${orderData.tableName}) started now!`);
                } else if (orderData.status === 'completed') {
                  triggerToast(lang === 'ar' 
                    ? `🎉 طلبك اللذيذ الساخن بـ (${orderData.tableName}) جاهز تماماً للاستلام! 🛎️` 
                    : `🎉 Your delicious order (${orderData.tableName}) is fully ready! 🛎️`);
                }
              }
              previousStatusesRef.current[orderData.id!] = orderData.status;

              setMyLiveOrders(prev => {
                const index = prev.findIndex(o => o.id === orderData.id);
                if (index >= 0) {
                  const newOrders = [...prev];
                  newOrders[index] = orderData;
                  return newOrders;
                } else {
                  return [...prev, orderData];
                }
              });
            }
          }, (error) => {
            console.warn(`Could not listen to order status for ${key.id}`, error);
          });
          unsubscribes.push(unsub);
        });
      } catch (err) {
        console.warn("Error setting up client-side order monitoring: ", err);
      }
    };

    watchOrders();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [restaurant?.id]);

  // Dynamic Autocomplete logic based on active products in the cart
  const getCartSuggestions = () => {
    if (cart.length === 0) return [];

    const suggestions: { text: string; label: string }[] = [];

    // Check features: savory vs drinks vs sweet
    const hasSavory = cart.some(item => {
      const name = (item.product?.name || "").toLowerCase();
      return (
        name.includes("برجر") || name.includes("شاورما") || name.includes("بطاطس") || name.includes("موزاريلا") ||
        name.includes("لحم") || name.includes("دجاج") || name.includes("جبن") || name.includes("وجبة") || name.includes("سندوتش") ||
        name.includes("burger") || name.includes("shawarma") || name.includes("fries") || name.includes("chicken") || name.includes("beef") || name.includes("mozzarella")
      );
    });

    const hasDrinks = cart.some(item => {
      const name = (item.product?.name || "").toLowerCase();
      return (
        name.includes("كوكاكولا") || name.includes("عصير") || name.includes("مشروب") || name.includes("شاي") || name.includes("قهوة") || name.includes("شيك") || name.includes("بيبسي") || name.includes("كولا") ||
        name.includes("cola") || name.includes("drink") || name.includes("juice") || name.includes("shake") || name.includes("coffee") || name.includes("tea") || name.includes("mojito") || name.includes("pepsi")
      );
    });

    const hasSweets = cart.some(item => {
      const name = (item.product?.name || "").toLowerCase();
      return (
        name.includes("حلو") || name.includes("لوتس") || name.includes("نوتيلا") || name.includes("شوكولاتة") || name.includes("كريب") || name.includes("وافل") ||
        name.includes("sweet") || name.includes("chocolate") || name.includes("waffle") || name.includes("crepe") || name.includes("cake") || name.includes("dessert")
      );
    });

    if (hasSavory) {
      suggestions.push(
        { text: "حار زيادة (Extra Spicy) 🔥", label: "Extra Spicy" },
        { text: "بدون بصل (No Onion) 🧅", label: "No Onion" },
        { text: "صوص زيادة (Extra Sauce) 🥫", label: "Extra Sauce" },
        { text: "بدون مايونيز (No Mayo) 🥚", label: "No Mayo" },
        { text: "جبنة زيادة (Extra Cheese) 🧀", label: "Extra Cheese" }
      );
    }

    if (hasDrinks) {
      suggestions.push(
        { text: "بدون ثلج (No Ice) 🧊", label: "No Ice" },
        { text: "سكر زيادة (Extra Sugar) 🍬", label: "Extra Sugar" },
        { text: "قليل السكر (Less Sugar) 📉", label: "Less Sugar" }
      );
    }

    if (hasSweets) {
      suggestions.push(
        { text: "شوكولاتة زيادة (Extra Chocolate) 🍫", label: "Extra Chocolate" },
        { text: "مكسرات زيادة (Extra Nuts) 🥜", label: "Extra Nuts" },
        { text: "بدون مكسرات (No Nuts) ❌", label: "No Nuts" }
      );
    }

    // Always include a general/default takeaway option
    suggestions.push(
      { text: "تجهيز سفري (Takeaway) 🛍️", label: "Takeaway" }
    );

    return suggestions;
  };

  // 1. Core Data Initializer
  useEffect(() => {
    const fetchMenuAndSync = async () => {
      setLoading(true);
      try {
        // Try to pull live record first
        let currentRest = await getRestaurantBySlug(restaurantSlug);
        
        if (!currentRest) {
          // If empty, search in sampleData fallback
          const matchedSample = SAMPLE_RESTAURANTS.find(s => s.slug === restaurantSlug);
          if (matchedSample) {
            currentRest = matchedSample;
            setRestaurant(matchedSample);
            setCategories(SAMPLE_CATEGORIES[matchedSample.id] || []);
            setProducts(SAMPLE_PRODUCTS[matchedSample.id] || []);
            setLoading(false);

            // Record virtual local statistic
            matchedSample.viewsCount += 1;
            return;
          }
        }

        if (currentRest) {
          setRestaurant(currentRest);
          
          // Fire-and-forget logging increment view inside db
          incrementRestaurantViews(currentRest.id);
          logMenuView(currentRest.id);

          // Configure real-time synchronization live listeners so modifications reflect instantly!
          const catsRef = collection(db, 'restaurants', currentRest.id, 'categories');
          const catsQuery = query(catsRef, orderBy('order', 'asc'));
          
          const unsubCats = onSnapshot(catsQuery, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category);
            setCategories(list);
          }, (err) => {
            console.warn("Categories live-sync not accessible offline, pulling static backup", err);
          });

          const prodsRef = collection(db, 'restaurants', currentRest.id, 'products');
          const prodsQuery = query(prodsRef, orderBy('order', 'asc'));

          const unsubProds = onSnapshot(prodsQuery, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
            setProducts(list);
            setLoading(false);
          }, (err) => {
            console.warn("Products live-sync not accessible offline", err);
            setLoading(false);
          });

          // Fallback static retrieval if firestore rules allow list read but onSnapshot is hindered
          if (categories.length === 0) {
            const staticCats = await getCategories(currentRest.id);
            const staticProds = await getProducts(currentRest.id);
            setCategories(staticCats);
            setProducts(staticProds);
          }

          return () => {
            unsubCats();
            unsubProds();
          };
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Critical error building client menu reader", err);
        setLoading(false);
      }
    };

    fetchMenuAndSync();
  }, [restaurantSlug]);

  // Handle Cart Adjustments
  const addToCart = (product: Product, selectedSize?: ProductSize) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === product.id && 
        ((!item.selectedSize && !selectedSize) || (item.selectedSize?.id === selectedSize?.id))
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1, selectedSize }];
    });
  };

  const adjustQuantity = (productId: string, delta: number, sizeId?: string) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && (!sizeId || item.selectedSize?.id === sizeId)) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string, sizeId?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && (!sizeId || item.selectedSize?.id === sizeId))));
  };

  const getCartTotal = () => {
    return cart.reduce((tot, item) => {
      const basePrice = item.product.isDiscounted && item.product.discountPrice 
        ? item.product.discountPrice 
        : item.product.price;
      const extraPrice = item.selectedSize ? Number(item.selectedSize.priceAdded) : 0;
      const finalPrice = basePrice + extraPrice;
      return tot + (finalPrice * item.quantity);
    }, 0);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // WhatsApp checkout pipeline formatting
  const handleCheckoutWhatsApp = async () => {
    if (!restaurant) return;
    if (!tableNameInput.trim()) {
      alert(t.requiredTableError);
      return;
    }

    let text = "";
    if (lang === 'en') {
      text = `*New Kitchen Order from Clients 🛎️*\n`;
      text += `*Table / Customer Name:* ${tableNameInput.trim()}\n`;
      if (checkoutNotes.trim()) {
        text += `*Notes:* ${checkoutNotes.trim()}\n`;
      }
      text += `\n---------------------------------\n`;
      text += `*Requested Items:*\n`;

      cart.forEach((item, idx) => {
        const basePrice = item.product.isDiscounted && item.product.discountPrice 
          ? item.product.discountPrice 
          : item.product.price;
        const extraPrice = item.selectedSize ? Number(item.selectedSize.priceAdded) : 0;
        const itemPrice = basePrice + extraPrice;
        
        const sizeLabel = item.selectedSize 
          ? ` (${lang === 'en' ? (item.selectedSize.nameEn || item.selectedSize.name) : item.selectedSize.name})`
          : '';

        text += `${idx + 1}- _${item.product.nameEn || item.product.name}_${sizeLabel} [Qty: ${item.quantity}] \n`;
        text += `    Price: ${itemPrice * item.quantity} ${restaurant.currencyEn || restaurant.currency || 'EGP'}\n`;
      });

      text += `---------------------------------\n`;
      text += `*Total Order Value:* *${getCartTotal()} ${restaurant.currencyEn || restaurant.currency || 'EGP'}*\n\n`;
      text += `_Created via MenuClick Quick Digital Gateway_`;
    } else {
      text = `*طلب جديد للمطبخ من مناديب الطاولات 🛎️*\n`;
      text += `*اسم الزبون / رقم الطاولة:* ${tableNameInput.trim()}\n`;
      if (checkoutNotes.trim()) {
        text += `*ملاحظات الزبون:* ${checkoutNotes.trim()}\n`;
      }
      text += `\n---------------------------------\n`;
      text += `*الأصناف والمشروبات المطلوبة:*\n`;

      cart.forEach((item, idx) => {
        const basePrice = item.product.isDiscounted && item.product.discountPrice 
          ? item.product.discountPrice 
          : item.product.price;
        const extraPrice = item.selectedSize ? Number(item.selectedSize.priceAdded) : 0;
        const itemPrice = basePrice + extraPrice;

        const sizeLabel = item.selectedSize 
          ? ` (${lang === 'en' ? (item.selectedSize.nameEn || item.selectedSize.name) : item.selectedSize.name})`
          : '';

        text += `${idx + 1}- _${item.product.name}_${sizeLabel} [عدد: ${item.quantity}] \n`;
        text += `    السعر: ${itemPrice * item.quantity} ${restaurant.currency}\n`;
      });

      text += `---------------------------------\n`;
      text += `*الحساب الإجمالي للطلب:* *${getCartTotal()} ${restaurant.currency}*\n\n`;
      text += `_تم إنشاؤه وصياغته عبر بوابة منيو كليك السريعة_`;
    }

    // Log real order to Firestore for analytics and retrieve order document ID
    const orderId = await logOrder(restaurant.id, {
      tableName: tableNameInput.trim(),
      totalPrice: getCartTotal(),
      notes: checkoutNotes.trim(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleString(lang === 'en' ? 'en-US' : 'ar-EG'),
      items: cart.map(item => {
        const basePrice = item.product.isDiscounted && item.product.discountPrice 
          ? item.product.discountPrice 
          : item.product.price;
        const extraPrice = item.selectedSize ? Number(item.selectedSize.priceAdded) : 0;
        const itemPrice = basePrice + extraPrice;
        
        const sizeLabel = item.selectedSize 
          ? ` (${lang === 'en' ? (item.selectedSize.nameEn || item.selectedSize.name) : item.selectedSize.name})`
          : '';

        return {
          productId: item.product.id,
          name: (lang === 'en' ? (item.product.nameEn || item.product.name) : item.product.name) + sizeLabel,
          price: itemPrice,
          quantity: item.quantity,
          size: item.selectedSize ? (lang === 'en' ? (item.selectedSize.nameEn || item.selectedSize.name) : item.selectedSize.name) : undefined
        };
      }),
      status: 'pending'
    });

    if (orderId) {
      try {
        const storageKey = `menu_click_orders_${restaurant.id}`;
        const existingMyOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingMyOrders.push({
          id: orderId,
          tableName: tableNameInput.trim(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(storageKey, JSON.stringify(existingMyOrders));

        // Listen in real time to the newly logOrder
        const { doc, onSnapshot } = await import('firebase/firestore');
        const docRef = doc(db, 'restaurants', restaurant.id, 'orders', orderId);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const orderData = { id: docSnap.id, ...docSnap.data() } as Order;
            setMyLiveOrders(prev => {
              const index = prev.findIndex(o => o.id === orderData.id);
              if (index >= 0) {
                const newOrders = [...prev];
                newOrders[index] = orderData;
                return newOrders;
              } else {
                return [...prev, orderData];
              }
            });
          }
        });
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }

    // Dynamic database tracking logging event
    incrementWhatsappOrders(restaurant.id);

    // Play a lovely notification chime to confirm order registers in the app with audio feedback
    playNotificationSound('success');
    triggerToast(lang === 'ar' 
      ? `🎉 تم إرسال طلبك (${tableNameInput.trim()}) بنجاح ورن جرس التنبيه بالمطابخ!` 
      : `🎉 Your order (${tableNameInput.trim()}) has been sent! Chef chimes triggered.`);

    // Redirect
    const formattedPhone = restaurant.phoneNumber.replace('+', '').replace(/\s+/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-amber-500 font-sans flex flex-col justify-center items-center gap-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold font-mono tracking-wider">سحب تفاصيل المنيو فريش...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="w-full min-h-screen bg-slate-100 font-sans flex flex-col justify-center items-center p-4 text-center space-y-4" dir="rtl">
        <ChefHat className="w-14 h-14 text-rose-500 animate-pulse" />
        <h3 className="text-xl font-black text-slate-950">المطعم المطلوب غير موجود أو غير مفعل</h3>
        <p className="text-xs text-slate-500 max-w-sm leading-normal">
          تأكد من كتابة المسار بالشكل السليم، أو ارجع إلى الصفحة الرئيسية لتصفح مطاعم تجريبية أخرى.
        </p>
        <button
          onClick={onBackToLanding}
          className="bg-slate-900 text-white rounded-xl py-2.5 px-6 font-bold text-xs cursor-pointer transition"
        >
          الرجوع للصفحة الرئيسية
        </button>
      </div>
    );
  }

  // Filtering products according to searching queries and tabs selection
  const matchQuickFilter = (prod: Product) => {
    if (quickFilter === 'all') return true;
    
    const nameLower = (prod.name || "").toLowerCase();
    const descLower = (prod.description || "").toLowerCase();
    
    // Find category name if available
    const cat = categories.find(c => c.id === prod.categoryId);
    const catNameLower = (cat?.name || "").toLowerCase();
    
    if (quickFilter === 'starters') { // مقبلات
      return (
        nameLower.includes("مقبلات") || nameLower.includes("جانبية") || nameLower.includes("صوص") || nameLower.includes("ثومية") || 
        nameLower.includes("أصابع") || nameLower.includes("بطاطس") || nameLower.includes("سلطة") || nameLower.includes("خبز") ||
        descLower.includes("مقبلات") || descLower.includes("جانبية") || descLower.includes("بطاطس") ||
        catNameLower.includes("مقبلات") || catNameLower.includes("جانبية") || catNameLower.includes("طبق") ||
        nameLower.includes("fries") || nameLower.includes("appetizer") || nameLower.includes("starter") || nameLower.includes("mozzarella") || 
        nameLower.includes("sauce") || nameLower.includes("garlic") || nameLower.includes("dip")
      );
    }
    
    if (quickFilter === 'mains') { // رئيسي
      return (
        nameLower.includes("برجر") || nameLower.includes("شاورما") || nameLower.includes("وجبة") || nameLower.includes("لحم") || 
        nameLower.includes("دجاج") || nameLower.includes("سندوتش") || nameLower.includes("صاروخ") || nameLower.includes("عربي") ||
        descLower.includes("شريحة لحم") || descLower.includes("برجر") || descLower.includes("شاورما") ||
        catNameLower.includes("برجر") || catNameLower.includes("شاورما") || catNameLower.includes("وجبات") || catNameLower.includes("سندوتش") ||
        nameLower.includes("burger") || nameLower.includes("shawarma") || nameLower.includes("meal") || nameLower.includes("sandwich") || 
        nameLower.includes("chicken") || nameLower.includes("beef") || nameLower.includes("kebab")
      );
    }
    
    if (quickFilter === 'desserts') { // حلويات ومشروبات
      return (
        nameLower.includes("حلو") || nameLower.includes("لوتس") || nameLower.includes("نوتيلا") || nameLower.includes("شوكولاتة") || 
        nameLower.includes("كريب") || nameLower.includes("وافل") || nameLower.includes("مشروب") || nameLower.includes("عصير") || 
        nameLower.includes("شاي") || nameLower.includes("قهوة") || nameLower.includes("كولا") || nameLower.includes("بيبسي") || 
        nameLower.includes("أيس كريم") || nameLower.includes("ميلك شيك") || descLower.includes("آيس كريم") ||
        catNameLower.includes("حلويات") || catNameLower.includes("مشروبات") || catNameLower.includes("عصائر") ||
        nameLower.includes("sweet") || nameLower.includes("chocolate") || nameLower.includes("waffle") || nameLower.includes("crepe") || 
        nameLower.includes("cake") || nameLower.includes("dessert") || nameLower.includes("drink") || nameLower.includes("juice") || 
        nameLower.includes("shake") || nameLower.includes("coffee") || nameLower.includes("tea") || nameLower.includes("mojito") || 
        nameLower.includes("pepsi") || nameLower.includes("cola")
      );
    }
    
    return true;
  };

  const getProductIllustration = (prod: Product): string => {
    if (prod.image && prod.image.trim() !== '') {
      return prod.image;
    }
    
    const nameLower = (prod.name || "").toLowerCase();
    
    if (nameLower.includes("برجر") || nameLower.includes("burger")) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80";
    }
    if (nameLower.includes("شاورما") || nameLower.includes("shawarma") || nameLower.includes("كباب") || nameLower.includes("أنجوس") || nameLower.includes("لحم") || nameLower.includes("دجاج")) {
      return "https://images.unsplash.com/photo-1642686335162-4d0eb6a4445c?w=400&h=300&fit=crop&q=80";
    }
    if (nameLower.includes("بطاطس") || nameLower.includes("fries") || nameLower.includes("مقبلات") || nameLower.includes("أصابع") || nameLower.includes("ثومية") || nameLower.includes("صوص")) {
      return "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=400&h=300&fit=crop&q=80";
    }
    if (nameLower.includes("كوكا") || nameLower.includes("عصير") || nameLower.includes("مشروب") || nameLower.includes("شاي") || nameLower.includes("شيك") || nameLower.includes("قهوة") || nameLower.includes("cola")) {
      return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop&q=80";
    }
    if (nameLower.includes("كريب") || nameLower.includes("وافل") || nameLower.includes("حلو") || nameLower.includes("لوتس") || nameLower.includes("نوتيلا") || nameLower.includes("شوكولاتة")) {
      return "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&q=80";
    }
    
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&q=80";
  };

  const filteredProducts = products.filter(prod => {
    // Check quick filter
    if (!matchQuickFilter(prod)) return false;

    // Check categorization state
    if (selectedCategory !== 'all' && prod.categoryId !== selectedCategory) return false;
    
    // Check search inputs
    if (searchQuery.trim() !== '') {
      const matchName = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = prod.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return matchName || matchDesc;
    }

    return true;
  });

  const activeCategories = categories.filter(cat => cat.isActive);

  // Active theme presets configurations
  const activePresetKey = restaurant?.themePreset || 'amber';
  const preset = THEME_PRESETS[activePresetKey as keyof typeof THEME_PRESETS] || THEME_PRESETS.amber;
  const customColor = restaurant?.primaryColor;

  // Class presets
  const textClass = customColor ? "" : preset.text;
  const accentTextClass = customColor ? "" : preset.accentText;
  const bgClass = customColor ? "" : preset.bg;
  const bgLightClass = customColor ? "" : preset.bgLight;
  const borderLightClass = customColor ? "" : preset.borderLight;
  const hoverBgClass = customColor ? "" : preset.hoverBg;
  const shadowClass = customColor ? "" : preset.shadow;

  // Custom Inline Styles
  const textStyle = customColor ? { color: customColor } : {};
  const bgStyle = customColor ? { backgroundColor: customColor } : {};
  const borderLightStyle = customColor ? { borderColor: `${customColor}20` } : {};
  const bgLightStyle = customColor ? { backgroundColor: `${customColor}15` } : {};
  const badgeStyle = customColor ? { backgroundColor: `${customColor}15`, color: customColor } : {};
  const borderStyle = customColor ? { borderColor: customColor } : {};
  const shadowStyle = customColor ? { boxShadow: `0 4px 10px -1px ${customColor}20` } : {};

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Centered screen boundary similar to global high-end web applications */}
      <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col shadow-2xl border-x border-slate-200/50 bg-white dark:bg-slate-900">
        
        {/* Interactive Floating Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-150 dark:border-slate-800 p-4 pb-2.5 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition cursor-pointer"
          >
            {lang === 'ar' && <ArrowRight className="w-4 h-4 ml-1" />}
            {t.backLink}
            {lang === 'en' && <ArrowRight className="w-4 h-4 mr-1 rotate-180" />}
          </button>

          <div className="flex items-center gap-1.5">
            {restaurant.enableEnglish && (
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border hover:scale-105 active:scale-95 transition cursor-pointer text-[10px] font-black font-sans leading-none select-none ${bgLightClass} ${textClass} ${borderLightClass}`}
                style={customColor ? { color: customColor, borderColor: `${customColor}25`, backgroundColor: `${customColor}15` } : {}}
              >
                <span>{lang === 'ar' ? 'EN 🇺🇸' : 'العربية 🇸🇦'}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              title={t.shareMenu}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border hover:scale-105 active:scale-95 transition cursor-pointer text-[10px] font-black leading-none select-none ${bgLightClass} ${hoverBgClass} ${textClass} hover:text-white ${borderLightClass}`}
              style={customColor ? { color: customColor, borderColor: `${customColor}25`, backgroundColor: `${customColor}15` } : {}}
            >
              <Share2 className="w-3 h-3" />
              <span>{t.shareMenu}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:scale-105 active:scale-95 transition cursor-pointer ${textClass}`}
              style={isDarkMode ? textStyle : {}}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* HERO BANNER SECTION */}
        <div className="relative h-44 shrink-0 overflow-hidden select-none">
          <img 
            src={restaurant.cover} 
            className="w-full h-full object-cover" 
            alt={lang === 'en' ? (restaurant.nameEn || restaurant.name) : restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
          
          {/* Cover Details overlay */}
          <div className={`absolute inset-0 p-4 flex flex-col justify-end text-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="text-right flex-1">
                <h2 className={`text-base font-black tracking-tight leading-tight text-white ${lang === 'en' ? 'text-left' : 'text-right'}`}>{lang === 'en' ? (restaurant.nameEn || restaurant.name) : restaurant.name}</h2>
                <p className={`text-[10px] text-slate-300 mt-0.5 flex items-center gap-1 ${lang === 'en' ? 'justify-start' : 'justify-end'}`}>
                  <MapPin className="w-3 h-3 text-amber-500" style={textStyle} />
                  <span>{lang === 'en' ? (restaurant.addressEn || restaurant.address) : restaurant.address}</span>
                </p>
              </div>
              <img 
                src={restaurant.logo} 
                className="w-12 h-12 rounded-full border-2 border-white/80 bg-white shadow-lg object-cover shrink-0" 
                alt="logo"
              />
            </div>
          </div>
        </div>

        {/* Welcome message section */}
        <div 
          className={`p-4 border-b p-3.5 space-y-2 ${bgLightClass} ${borderLightClass}`}
          style={customColor ? { backgroundColor: `${customColor}10`, borderColor: `${customColor}15` } : {}}
        >
          <div className="flex justify-between items-start gap-4">
            <div className={`space-y-1 flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h4 
                className={`text-xs font-black flex items-center gap-1 ${accentTextClass} ${lang === 'en' ? 'justify-start' : 'justify-end'}`}
                style={textStyle}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'en' ? (restaurant.welcomeTitleEn || restaurant.welcomeTitle || 'Welcome!') : (restaurant.welcomeTitle || 'مرحباً بالضيوف الأعزاء')}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {lang === 'en' ? (restaurant.welcomeSubtitleEn || restaurant.welcomeSubtitle || 'Check out our digital menu.') : (restaurant.welcomeSubtitle || 'شرفنا تصفحكم للمنيو وتقديم ألذ الأصناف.')}
              </p>
            </div>

            {restaurant.phoneNumber && (
              <a 
                href={`https://wa.me/${restaurant.phoneNumber.replace('+', '').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-[10px] sm:text-xs transition-all duration-150 shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>{t.whatsappRest}</span>
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Live Categorized search input */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full">
            <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-9 py-2.5 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-850 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder={t.searchPlaceholder}
            />
          </div>
        </div>        {/* Quick Filtering Shortcut (مقبلات، رئيسي، حلويات) */}
        <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          <p className={`text-[10px] text-slate-400 dark:text-slate-500 font-extrabold mb-2 font-sans ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {t.quickTypeLabel}
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              id="qf-all"
              onClick={() => {
                setQuickFilter('all');
                setSelectedCategory('all');
              }}
              className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                quickFilter === 'all'
                  ? `${bgClass} text-white ${shadowClass} scale-[1.03] font-black`
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              style={quickFilter === 'all' ? bgStyle : {}}
            >
              <span className="text-base select-none">🍽️</span>
              <span className="text-[10px] font-black">{t.quickAll}</span>
            </button>

            <button
              id="qf-starters"
              onClick={() => {
                setQuickFilter('starters');
                setSelectedCategory('all'); // Clear category to show all starters across categories
              }}
              className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                quickFilter === 'starters'
                  ? `${bgClass} text-white ${shadowClass} scale-[1.03] font-black`
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              style={quickFilter === 'starters' ? bgStyle : {}}
            >
              <span className="text-base select-none">🍟</span>
              <span className="text-[10px] font-black">{t.quickAppetizer}</span>
            </button>

            <button
              id="qf-mains"
              onClick={() => {
                setQuickFilter('mains');
                setSelectedCategory('all');
              }}
              className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                quickFilter === 'mains'
                  ? `${bgClass} text-white ${shadowClass} scale-[1.03] font-black`
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              style={quickFilter === 'mains' ? bgStyle : {}}
            >
              <span className="text-base select-none">🍔</span>
              <span className="text-[10px] font-black">{t.quickMain}</span>
            </button>

            <button
              id="qf-desserts"
              onClick={() => {
                setQuickFilter('desserts');
                setSelectedCategory('all');
              }}
              className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                quickFilter === 'desserts'
                  ? `${bgClass} text-white ${shadowClass} scale-[1.03] font-black`
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              style={quickFilter === 'desserts' ? bgStyle : {}}
            >
              <span className="text-base select-none">🍰</span>
              <span className="text-[10px] font-black">{t.quickDessert}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Pills scroll */}
        <div className="sticky top-12 z-25 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-black transition cursor-pointer select-none ${selectedCategory === 'all' ? `${bgClass} text-white ${shadowClass}` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            style={selectedCategory === 'all' ? bgStyle : {}}
          >
            {t.allCategories}
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition cursor-pointer select-none ${selectedCategory === cat.id ? `${bgClass} text-white ${shadowClass}` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              style={selectedCategory === cat.id ? bgStyle : {}}
            >
              {lang === 'en' ? (cat.nameEn || cat.name) : cat.name}
            </button>
          ))}
        </div>

        {/* DRUM OF LISTINGS */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h5 className="text-sm font-bold text-slate-400">{t.notAvailableDesc}</h5>
              <p className="text-[11px] text-slate-500">{t.notAvailablep}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => setSelectedProductDetails(prod)}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-200 flex p-3 gap-3.5 cursor-pointer relative group"
                >
                  {/* Photo part */}
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative bg-slate-200 shadow-inner">
                    <img 
                      src={getProductIllustration(prod)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      alt={lang === 'en' ? (prod.nameEn || prod.name) : prod.name} 
                      referrerPolicy="no-referrer" 
                    />
                    {(lang === 'en' ? (prod.badgeEn || prod.badge) : prod.badge) && (
                      <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md scale-95">
                        {lang === 'en' ? (prod.badgeEn || prod.badge) : prod.badge}
                      </span>
                    )}
                    {prod.isDiscounted && prod.discountLabel && (
                      <span className="absolute bottom-1 right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md leading-none">
                        {prod.discountLabel}
                      </span>
                    )}
                    {!prod.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 text-slate-300 flex items-center justify-center text-[9px] font-bold text-center p-1">
                        {t.closedToday}
                      </div>
                    )}
                  </div>
 
                  {/* Text details column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className={`font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors ${lang === 'en' ? 'text-left' : 'text-right'}`}>{lang === 'en' ? (prod.nameEn || prod.name) : prod.name}</h4>
                        <div className={`text-xs font-black font-mono shrink-0 ${textClass}`} style={textStyle}>
                          {prod.isDiscounted && prod.discountPrice ? (
                            <div className={`${lang === 'en' ? 'text-right' : 'text-left'} flex flex-col`}>
                              <span>{prod.discountPrice} {t.currencySymbol}</span>
                              <span className="text-[9px] text-slate-400 line-through font-normal leading-none">{prod.price}</span>
                            </div>
                          ) : (
                            <span>{prod.price} {t.currencySymbol}</span>
                          )}
                        </div>
                      </div>
                      <p className={`text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                        {lang === 'en' ? (prod.descriptionEn || prod.description || 'Fresh dish prepared in our premium kitchen.') : (prod.description || 'وجبة طازجة مجهزة بمطابخنا الفاخرة.')}
                      </p>

                      {prod.isDiscounted && prod.discountExpiry && (
                        <div className={`mt-2 flex ${lang === 'en' ? 'justify-start' : 'justify-end'}`}>
                          <OfferCountdown expiry={prod.discountExpiry} lang={lang} />
                        </div>
                      )}
                    </div>
 
                    <div className={`flex ${lang === 'en' ? 'justify-between' : 'justify-between flex-row-reverse'} items-center pt-1`}>
                      <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-extrabold hover:underline">
                        {lang === 'ar' ? 'التفاصيل وصور ترويجية 👁️' : 'Details & Photos 👁️'}
                      </span>
                      {prod.isAvailable ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid triggering details popup click
                            if (prod.sizes && prod.sizes.length > 0) {
                              setSelectedProductDetails(prod);
                            } else {
                              addToCart(prod, undefined);
                            }
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold transition cursor-pointer select-none border ${bgLightClass} ${hoverBgClass} ${textClass} hover:text-white ${borderLightClass}`}
                          style={customColor ? { color: customColor, borderColor: `${customColor}25`, backgroundColor: `${customColor}12` } : {}}
                        >
                          {t.addToCart}
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg select-none p-1">
                          {t.noAvailable}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM ORDER BAR FLOAT TRIGGER */}
        <AnimatePresence>
          {totalCartCount > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 shadow-2xl z-25 flex items-center justify-between"
            >
              <div className={`flex items-center gap-2 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="relative">
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px]">
                    {totalCartCount}
                  </span>
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                    <ShoppingCart className="w-5 h-5 font-bold" />
                  </div>
                </div>

                <div className={lang === 'en' ? 'text-left' : 'text-right'}>
                  <h5 className="text-[10px] text-slate-400 font-bold uppercase">{t.orderPrice}</h5>
                  <p className={`text-sm font-black font-mono ${textClass}`} style={textStyle}>
                    {getCartTotal()} {t.currencySymbol}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 font-black rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5 select-none"
              >
                {t.updatingCart}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CART DRAWER SIDE BAR MODAL OVERLAY */}
        {isCartOpen && (
          <div id="cart-drawer" className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end">
            <motion.div
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-t-[32px] max-h-[90%] flex flex-col p-5 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCartOpen(false)}
                className="absolute top-4 left-4 p-2 font-black text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className={`text-base font-black text-slate-950 dark:text-white mb-4 mt-1 flex items-center gap-2 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
                <ShoppingBag className={`w-5 h-5 ${textClass}`} style={textStyle} />
                <span>{t.cartTitle}</span>
              </h3>

              {/* Items List scroll */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px] min-h-[140px] border-b border-slate-100 dark:border-slate-850 pb-4">
                {cart.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-10">{t.emptyCart}</p>
                ) : (
                  cart.map((item) => {
                    const basePrice = item.product.isDiscounted && item.product.discountPrice 
                      ? item.product.discountPrice 
                      : item.product.price;
                    const extraPrice = item.selectedSize ? Number(item.selectedSize.priceAdded) : 0;
                    const price = basePrice + extraPrice;
                    
                    const sizeLabel = item.selectedSize 
                      ? ` - ${lang === 'en' ? (item.selectedSize.nameEn || item.selectedSize.name) : item.selectedSize.name}`
                      : '';

                    return (
                      <div key={`${item.product.id}-${item.selectedSize?.id || 'standard'}`} className={`flex justify-between items-center gap-3 ${lang === 'en' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-1 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {lang === 'en' ? (item.product.nameEn || item.product.name) : item.product.name}
                            <span className="text-[10px] text-amber-500 font-extrabold">{sizeLabel}</span>
                          </h4>
                          <span className={`text-[10px] font-semibold font-mono ${textClass}`} style={textStyle}>
                            {price * item.quantity} {t.currencySymbol}
                          </span>
                        </div>
 
                        {/* Adjust qty triggers */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => adjustQuantity(item.product.id, -1, item.selectedSize?.id)}
                            className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition select-none"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="text-xs font-bold font-mono px-1.5 text-slate-800 dark:text-slate-100">{item.quantity}</span>
 
                          <button
                            onClick={() => addToCart(item.product, item.selectedSize)}
                            className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition select-none"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
 
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize?.id)}
                          className="text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Credentials inputs */}
              <div className="py-4 space-y-3.5">
                <div>
                  <label className={`block text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-350 mb-1.5 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                    {t.tableNameLabel}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={tableNameInput}
                    onChange={(e) => setTableNameInput(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 outline-none rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 ${lang === 'en' ? 'text-left' : 'text-right'}`}
                    placeholder={t.tableNamePlaceholder}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-350 mb-1.5 flex justify-between items-center select-none ${lang === 'en' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span>{t.notesLabel}</span>
                    {getCartSuggestions().length > 0 && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${textClass} ${bgLightClass}`} style={badgeStyle}>
                        <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                        {t.smartRecommendations}
                      </span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 outline-none rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${lang === 'en' ? 'text-left' : 'text-right'}`}
                    placeholder={t.notesPlaceholder}
                  />

                  {/* Smart Suggestions Auto-Complete Pills */}
                  {getCartSuggestions().length > 0 && (
                    <div className={`mt-2 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                      <div className={`flex flex-wrap gap-1.5 ${lang === 'en' ? 'justify-end' : 'justify-start'}`}>
                        {getCartSuggestions()
                          .filter(suggestion => {
                            const notesNormalized = checkoutNotes.toLowerCase();
                            if (notesNormalized.includes(suggestion.text.toLowerCase()) || notesNormalized.includes(suggestion.label.toLowerCase())) {
                              return false;
                            }
                            
                            if (checkoutNotes.trim() !== "") {
                              const tokens = checkoutNotes.split(/[،,]\s*/);
                              const lastToken = tokens[tokens.length - 1]?.trim().toLowerCase() || "";
                              if (!lastToken) return true;
                              return (
                                suggestion.text.toLowerCase().includes(lastToken) ||
                                suggestion.label.toLowerCase().includes(lastToken)
                              );
                            }
                            
                            return true;
                          })
                          .slice(0, 5)
                          .map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const trimmed = checkoutNotes.trim();
                                if (!trimmed) {
                                  setCheckoutNotes(suggestion.text);
                                } else {
                                  const endsWithSeparator = /[،,]\s*$/.test(checkoutNotes);
                                  const separator = endsWithSeparator ? " " : "، ";
                                  
                                  const tokens = checkoutNotes.split(/[،,]\s*/);
                                  const lastToken = tokens[tokens.length - 1]?.trim() || "";
                                  
                                  if (
                                    lastToken && 
                                    (suggestion.text.toLowerCase().includes(lastToken.toLowerCase()) || 
                                     suggestion.label.toLowerCase().includes(lastToken.toLowerCase()))
                                  ) {
                                    tokens[tokens.length - 1] = suggestion.text;
                                    setCheckoutNotes(tokens.join("، "));
                                  } else {
                                    setCheckoutNotes(trimmed + separator + suggestion.text);
                                  }
                                }
                              }}
                              className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-lg border transition duration-150 cursor-pointer select-none ${bgLightClass} ${hoverBgClass} ${textClass} hover:text-white ${borderLightClass}`}
                              style={customColor ? { color: customColor, borderColor: `${customColor}25`, backgroundColor: `${customColor}11` } : {}}
                            >
                              + {suggestion.text}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Final dispatch checkout trigger block */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className={`flex justify-between items-center text-xs sm:text-sm font-black dark:text-white font-mono ${lang === 'en' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span>{t.invoiceTitle}</span>
                  <span className={`${textClass}`} style={textStyle}>{getCartTotal()} {t.currencySymbol}</span>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  {t.submitOrder}
                </button>

                <p className="text-[9px] text-center text-slate-450 dark:text-slate-400">
                  {t.checkoutWarning}
                </p>
              </div>

            </motion.div>
          </div>
        )}

        {/* DISH ILLUSTRATION / DETAILS POPUP MODAL OVERLAY */}
        {selectedProductDetails && (
          <div 
            id="dish-desc-popup" 
            className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedProductDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[28px] max-w-sm w-full overflow-hidden shadow-2xl relative border border-slate-150 dark:border-slate-800 flex flex-col"
            >
              {/* Image banner preview with large illustration */}
              <div className="relative h-56 w-full bg-slate-100">
                <img 
                  src={getProductIllustration(selectedProductDetails)} 
                  className="w-full h-full object-cover" 
                  alt={lang === 'en' ? (selectedProductDetails.nameEn || selectedProductDetails.name) : selectedProductDetails.name} 
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating badge */}
                {(lang === 'en' ? (selectedProductDetails.badgeEn || selectedProductDetails.badge) : selectedProductDetails.badge) && (
                  <span className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                    {lang === 'en' ? (selectedProductDetails.badgeEn || selectedProductDetails.badge) : selectedProductDetails.badge}
                  </span>
                )}

                {/* Close absolute wrapper */}
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="absolute top-4 left-4 p-2 bg-slate-950/40 hover:bg-slate-950/60 transition text-white rounded-full cursor-pointer backdrop-blur-xs"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Informational content detailing dish */}
              <div className={`p-5 space-y-4 flex-1 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">
                      {lang === 'en' ? (selectedProductDetails.nameEn || selectedProductDetails.name) : selectedProductDetails.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold font-mono mt-1">
                      {lang === 'en' ? '100% Chef Certified Special' : 'طهي فاخر ومضمون ١٠٠٪ 🍽️'}
                    </p>
                  </div>

                  {(() => {
                    const priceAdd = modalSelectedSize ? Number(modalSelectedSize.priceAdded) : 0;
                    const displayPrice = selectedProductDetails.price + priceAdd;
                    const displayDiscountPrice = selectedProductDetails.discountPrice ? (selectedProductDetails.discountPrice + priceAdd) : undefined;

                    return (
                      <div className={`text-sm font-black font-mono shrink-0 ${textClass}`} style={textStyle}>
                        {selectedProductDetails.isDiscounted && displayDiscountPrice ? (
                          <div className="flex flex-col items-end">
                            <span className="text-base text-rose-600 dark:text-rose-400">{displayDiscountPrice} {t.currencySymbol}</span>
                            <span className="text-[11px] text-slate-400 line-through font-normal leading-none">{displayPrice}</span>
                          </div>
                        ) : (
                          <span className="text-base">{displayPrice} {t.currencySymbol}</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Illustrative Food Attribute Pill Tags */}
                <div className={`flex flex-wrap gap-1.5 ${lang === 'en' ? 'justify-start' : 'justify-end'}`}>
                  {selectedProductDetails.isDiscounted && selectedProductDetails.discountLabel && (
                    <span className="bg-rose-100 dark:bg-rose-950/45 text-rose-800 dark:text-rose-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/30 animate-pulse">
                      🏷️ {selectedProductDetails.discountLabel}
                    </span>
                  )}
                  <span className="bg-amber-100 dark:bg-amber-950/45 text-amber-800 dark:text-amber-400 text-[9px] font-black px-2.5 py-0.5 rounded-full">
                    {lang === 'en' ? '🔥 Served Fresh' : '🔥 مجهز طازجاً'}
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400 text-[9px] font-black px-2.5 py-0.5 rounded-full">
                    {lang === 'en' ? '✨ Premium Quality' : '✨ مكونات ممتازة'}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-950/45 text-blue-800 dark:text-blue-400 text-[9px] font-black px-2.5 py-0.5 rounded-full">
                    {lang === 'en' ? '🥦 100% Healthy' : '🥦 غني وصحي'}
                  </span>
                </div>

                {/* Size selection options selector */}
                {selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                      {lang === 'en' ? 'Select Size / Option' : 'اختر الحجم أو الخيار المطلوب'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProductDetails.sizes.map((size) => {
                        const isSel = modalSelectedSize?.id === size.id;
                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => setModalSelectedSize(size)}
                            className={`p-2 rounded-xl flex items-center justify-between border transition cursor-pointer relative text-[11px] font-black ${
                              isSel 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' 
                                : 'bg-slate-50 dark:bg-slate-850/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                            }`}
                          >
                            <span className="truncate">
                              {lang === 'en' ? (size.nameEn || size.name) : size.name}
                            </span>
                            <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 ml-1 shrink-0">
                              {size.priceAdded > 0 
                                ? `+${size.priceAdded} ${t.currencySymbol}` 
                                : lang === 'en' ? 'Base' : 'أساسي'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Countdown banner inside the details modal */}
                {selectedProductDetails.isDiscounted && selectedProductDetails.discountExpiry && (
                  <div className="bg-rose-500/5 dark:bg-rose-400/5 border border-rose-500/10 rounded-2xl p-3 flex items-center justify-between gap-2.5">
                    <span className="text-[10px] sm:text-xs font-black text-rose-700 dark:text-rose-400">
                      🚨 {lang === 'en' ? 'Limited Time Offer!' : 'عرض لفترة محدودة جداً!'}
                    </span>
                    <OfferCountdown expiry={selectedProductDetails.discountExpiry} lang={lang} />
                  </div>
                )}

                {/* Description Text */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <h4 className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase">
                    {lang === 'en' ? 'Description & Ingredients' : 'مكونات الطبق والوصف'}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    {lang === 'en' ? (selectedProductDetails.descriptionEn || selectedProductDetails.description || 'Our finest authentic selection prepared with delicious premium ingredients according to local heritage recipes.') : (selectedProductDetails.description || 'تم إعداد هذا الطبق بعناية فائقة باستخدام مكوناتنا الخاصة، ممزوجة بتشكيلة غنية من التوابل الطازجة لتقدم لكم المذاق الأصيل والمميز.')}
                  </p>
                </div>

                {/* Actions / Add to cart row */}
                <div className="pt-2 flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedProductDetails(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 font-black text-xs transition cursor-pointer text-center"
                  >
                    {lang === 'en' ? 'Close description' : 'العودة للمنيو'}
                  </button>

                  {selectedProductDetails.isAvailable ? (
                    <button
                      onClick={() => {
                        addToCart(selectedProductDetails, modalSelectedSize);
                        setSelectedProductDetails(null); // Auto close on successful add
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 text-center"
                    >
                      <span>{t.addToCart}</span>
                      <span className="text-xs">🛒</span>
                    </button>
                  ) : (
                    <span className="flex-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl select-none text-center font-bold">
                      {t.noAvailable}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating WhatsApp contact connection button */}
        {restaurant.phoneNumber && (
          <motion.a
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            href={`https://wa.me/${restaurant.phoneNumber.replace('+', '').replace(/\s+/g, '')}`}
            target="_blank"
            rel="noreferrer"
            title="تواصل مباشرة عبر واتساب"
            className={`absolute z-20 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 duration-200 ${
              cart.length > 0 ? 'bottom-24 left-4' : 'bottom-6 left-4'
            }`}
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="text-[10px] font-black pl-1">{t.chatRestaurant}</span>
          </motion.a>
        )}

        {/* Floating live orders track widget */}
        {myLiveOrders.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowMyOrdersModal(true)}
            className={`absolute z-20 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 duration-200 ${
              cart.length > 0 ? 'bottom-24 right-4' : 'bottom-6 right-4'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-black">{lang === 'ar' ? 'تتبع طلبك 🍳' : 'Track Order 🛎️'}</span>
            <span className="bg-white text-amber-600 rounded-full px-1.5 py-0.2 font-sans font-black text-[9px] scale-90">
              {myLiveOrders.filter(o => o.status !== 'completed').length > 0 ? '⏳' : '✅'}
            </span>
          </motion.button>
        )}

        {/* Customer Live Orders Modal */}
        {showMyOrdersModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-4 shadow-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 max-h-[85vh] border border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>{lang === 'ar' ? 'متابعة حالة طلباتك الحالية 🛎️' : 'Live Orders Tracking 🛎️'}</span>
                </h3>
                <button
                  onClick={() => setShowMyOrdersModal(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto pt-4 space-y-6">
                {myLiveOrders.map((order, index) => {
                  const status = order.status || 'pending';
                  return (
                    <div key={order.id || index} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                      {/* Name Card and price */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black dark:text-white block">{order.tableName}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            ID: {order.id?.substring(0, 8)}... ({order.createdAt || 'الآن'})
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 block">
                          {order.totalPrice} {restaurant.currency || 'EGP'}
                        </span>
                      </div>

                      {/* Real-time elegant progress timeline steps */}
                      <div className="relative pt-2 pb-1">
                        {/* Track line behind */}
                        <div className="absolute top-[14px] left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 z-0" />
                        <div 
                          className="absolute top-[14px] left-5 right-5 h-1 bg-amber-500 z-0 transition-all duration-500"
                          style={{
                            width: status === 'pending' ? '0%' : status === 'preparing' ? '50%' : '100%',
                            right: lang === 'ar' ? '1.25rem' : 'auto',
                            left: lang === 'en' ? '1.25rem' : 'auto'
                          }}
                        />

                        {/* Three step indicators */}
                        <div className="flex justify-between items-center relative z-10 text-center text-[10px]">
                          {/* Step 1: Received */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 transition ${
                              status === 'pending' || status === 'preparing' || status === 'completed'
                                ? 'bg-amber-500 text-white ring-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 ring-transparent'
                            }`}>
                              ⏳
                            </div>
                            <span className={`font-black ${
                              status === 'pending' || status === 'preparing' || status === 'completed' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'
                            }`}>
                              {lang === 'ar' ? 'تم الاستلام' : 'Received'}
                            </span>
                          </div>

                          {/* Step 2: Preparing */}
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs ring-4 transition ${
                              status === 'preparing' || status === 'completed'
                                ? 'bg-indigo-505 bg-indigo-500 text-white ring-indigo-500/20'
                                : 'bg-slate-200 dark:bg-slate-850 text-slate-400 ring-transparent'
                            }`}>
                              🍳
                            </div>
                            <span className={`font-black ${
                              status === 'preparing' || status === 'completed' ? 'text-indigo-500' : 'text-slate-400'
                            }`}>
                              {lang === 'ar' ? 'قيد التحضير' : 'Preparing'}
                            </span>
                          </div>

                          {/* Step 3: Completed */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 transition ${
                              status === 'completed'
                                ? 'bg-emerald-500 text-white ring-emerald-500/20'
                                : 'bg-slate-200 dark:bg-slate-850 text-slate-400 ring-transparent'
                            }`}>
                              🎉
                            </div>
                            <span className={`font-black ${
                              status === 'completed' ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {lang === 'ar' ? 'جاهز للتسليم!' : 'Ready! 🎉'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Descriptive micro-copy based on active status */}
                      <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold leading-relaxed">
                          {status === 'pending' && (lang === 'ar' ? '🛎️ تلقى طاقمنا طلبك وبانتظار الموافقة والتشغيل السريع.' : '🛎️ Our team received your order and is setting it up.')}
                          {status === 'preparing' && (lang === 'ar' ? '👨‍🍳 يمارس الطاهي مهاراته الآن لتجهيز وجبتك اللذيذة بحب!' : '👨‍🍳 The chef is preparing your delicious meal with love!')}
                          {status === 'completed' && (lang === 'ar' ? '✨ طلبك جاهز ولذيذ بالهناء والشفاء! يسعدنا نيل رضاك وسنلتقي بطاولتك.' : '✨ Your order is ready & hot! Enjoy your meal! ❤️')}
                        </p>
                      </div>

                      {/* Items summaries in order */}
                      <div className="text-[10px] space-y-1.5 font-bold text-slate-500">
                        {order.items && Array.isArray(order.items) && order.items.map((item: any, indx: number) => (
                          <div key={indx} className="flex justify-between">
                            <span>- {item.name} <strong className="text-slate-800 dark:text-slate-200 font-mono">x{item.quantity}</strong></span>
                            <span className="font-mono">{item.price * item.quantity} {restaurant.currency || 'EGP'}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="bg-amber-50/40 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10 p-2 rounded-xl text-[9.5px]">
                          📝 <strong className="text-amber-800 dark:text-amber-400">{lang === 'ar' ? 'توصيات الجودة:' : 'Spices/Notes:'}</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom notice */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[9px] text-slate-400 mt-4 leading-relaxed">
                {lang === 'ar' 
                  ? 'تم تشغيل البث المباشر للطلب بالربط بقاعدة بيانات مطاعم منيو كليك الحرة.' 
                  : 'Connected in database live with MenuClick digital queue.'}
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Dynamic Toast feedback */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute bottom-24 left-4 right-4 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-950 backdrop-blur-md py-3 px-4 rounded-2xl text-[11px] font-extrabold shadow-2xl z-50 text-center border border-slate-800/10 dark:border-white/10 select-none"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
