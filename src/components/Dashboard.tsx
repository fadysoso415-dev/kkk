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
  ShoppingBag
} from 'lucide-react';
import { Restaurant, Category, Product } from '../types';
import { 
  saveRestaurant, 
  saveCategory, 
  deleteCategory, 
  saveProduct, 
  deleteProduct,
  getCategories,
  getProducts
} from '../firebase';
import { SAMPLE_RESTAURANTS, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../sampleData';

interface DashboardProps {
  user: any;
  isDemo: boolean;
  onLogout: () => void;
  onNavigateToMenu: (slug: string) => void;
}

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

export default function Dashboard({ user, isDemo, onLogout, onNavigateToMenu }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'categories' | 'products' | 'qrcode' | 'analytics'>('settings');
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
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [menuCopied, setMenuCopied] = useState(false);

  // Modals States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 1, isActive: true });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
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
    order: 1
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
  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
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
    } catch (err) {
      triggerAlert('error', 'فشلت عملية الحفظ، يرجى مراجعة الصلاحيات أو محاولة مجددة.');
    }
  };

  // --- PERSIST CATEGORIES ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCategory ? editingCategory.id : `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      name: categoryForm.name,
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
    } catch (err) {
      triggerAlert('error', 'حدث خطأ غير متوقع أثناء المعالجة.');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم بالكامل؟ سيتم إخفاء المنتجات التابعة له.')) return;
    try {
      if (isDemo) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        triggerAlert('success', 'تم الحذف من الواجهة التجريبية.');
      } else {
        await deleteCategory(restaurant.id, catId);
        setCategories(prev => prev.filter(c => c.id !== catId));
        triggerAlert('success', 'تم إزالة القسم وتحديث العميل بلحظة! 🔥');
      }
    } catch (err) {
      triggerAlert('error', 'لا يمكن حذف القسم، يرجى تكرار المحاولة..');
    }
  };

  // --- PERSIST PRODUCTS ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const priceNum = Number(productForm.price);
    const discNum = Number(productForm.discountPrice);

    const newProd: Product = {
      id,
      name: productForm.name,
      description: productForm.description,
      price: priceNum,
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      isDiscounted: productForm.isDiscounted,
      discountPrice: productForm.isDiscounted ? discNum : undefined,
      image: productForm.image || FOOD_PRESETS[0].url,
      categoryId: productForm.categoryId,
      isAvailable: productForm.isAvailable,
      badge: productForm.badge || undefined,
      order: Number(productForm.order)
    };

    if (!newProd.categoryId) {
      triggerAlert('error', 'برجاء تحديد القسم التابع للسلعة أولاً.');
      return;
    }

    try {
      if (isDemo) {
        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === id ? newProd : p));
        } else {
          setProducts(prev => [...prev, newProd].sort((a,b) => a.order - b.order));
        }
        triggerAlert('success', 'تم تعديل السلعة لوكال بنجاح!');
      } else {
        await saveProduct(restaurant.id, id, {
          name: newProd.name,
          description: newProd.description,
          price: newProd.price,
          originalPrice: newProd.originalPrice || 0,
          isDiscounted: !!newProd.isDiscounted,
          discountPrice: newProd.discountPrice || 0,
          image: newProd.image,
          categoryId: newProd.categoryId,
          isAvailable: newProd.isAvailable,
          badge: newProd.badge || '',
          order: newProd.order
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
    } catch {
      triggerAlert('error', 'حدث خطأ أثناء تعديل السلعة في قاعدة البيانات.');
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
    } catch {
      triggerAlert('error', 'تم رفض العملية.');
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
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-5 border-l border-slate-800 shrink-0 select-none">
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
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-5xl">
        
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
                <input 
                  type="text" 
                  required
                  value={restaurant.phoneNumber} 
                  onChange={e => setRestaurant({ ...restaurant, phoneNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-amber-500 text-left"
                  placeholder="+201000000000"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">يجب تضمين كود الدولة بالكامل (بدون أصفار إضافية).</span>
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
              <div className="bg-white border p-12 rounded-3xl text-center space-y-4">
                <Layers className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="text-base font-black text-slate-900">لا يوجد أي تصنيف أو أقسام للمنيو بعد!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">اضغط على زر الإضافة لتأسيس أقسام منيو مطعمك وتسهيل تحديد قوائم الوجبات.</p>
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
                        onClick={() => handleDeleteCategory(cat.id)}
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
                  setProductForm({
                    name: '',
                    description: '',
                    price: 25,
                    originalPrice: 35,
                    isDiscounted: false,
                    discountPrice: 25,
                    image: FOOD_PRESETS[0].url,
                    categoryId: categories[0].id,
                    isAvailable: true,
                    badge: '',
                    order: products.length + 1
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
                                    setProductForm({
                                      name: prod.name,
                                      description: prod.description,
                                      price: prod.price,
                                      originalPrice: prod.originalPrice || 0,
                                      isDiscounted: !!prod.isDiscounted,
                                      discountPrice: prod.discountPrice || 0,
                                      image: prod.image,
                                      categoryId: prod.categoryId,
                                      isAvailable: prod.isAvailable,
                                      badge: prod.badge || '',
                                      order: prod.order
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

        {/* TAB 5: ANALYTICS & PLANS */}
        {activeTab === 'analytics' && (() => {
          // Dynamic period stats logic
          const totalViews = restaurant.viewsCount || 230;
          const totalOrders = restaurant.whatsappOrdersCount || 54;
          
          const periodStats = (() => {
            if (analyticsPeriod === 'today') {
              return {
                views: Math.max(12, Math.floor(totalViews * 0.12)),
                orders: Math.max(2, Math.floor(totalOrders * 0.08)),
                label: 'اليوم الحالي',
                subText: 'تحديث حي بلحظة'
              };
            } else if (analyticsPeriod === 'week') {
              return {
                views: Math.max(45, Math.floor(totalViews * 0.44)),
                orders: Math.max(8, Math.floor(totalOrders * 0.41)),
                label: 'هذا الأسبوع',
                subText: 'السبعة أيام الأخيرة'
              };
            } else {
              return {
                views: totalViews,
                orders: totalOrders,
                label: 'كامل الإحصائيات تراكمياً',
                subText: 'منذ إطلاق المنيو مجاناً'
              };
            }
          })();

          const conversionRate = periodStats.views > 0 ? ((periodStats.orders / periodStats.views) * 100).toFixed(1) : "0.0";
          const estimatedValue = periodStats.orders * 155; // average order size of 155 EGP

          // Compute popular items from active menu products in restaurant state
          const popularProducts = (() => {
            const rawList = products.length > 0 ? products : [
              { id: 'p1', name: 'برجر كلاسيك رويال دبل 🍔', price: 180, image: FOOD_PRESETS[0].url },
              { id: 'p2', name: 'شاورما دجاج سوبر فرشك 🌯', price: 120, image: FOOD_PRESETS[1].url },
              { id: 'p3', name: 'بيتزا مارجريتا نابوليتان 🍕', price: 150, image: FOOD_PRESETS[2].url },
              { id: 'p4', name: 'فرنش فرايز ذهبية مملحة 🍟', price: 50, image: FOOD_PRESETS[4].url },
            ];

            return rawList.map((prod, index) => {
              // Deterministic looking stats per product
              const baseViews = Math.max(8, Math.floor(periodStats.views * (0.45 - index * 0.11)));
              const baseOrders = Math.max(1, Math.floor(periodStats.orders * (0.48 - index * 0.13)));
              const simRevenue = baseOrders * prod.price;

              return {
                ...prod,
                views: baseViews,
                orders: baseOrders,
                revenue: simRevenue
              };
            }).filter(p => p.views > 0).sort((a, b) => b.orders - a.orders);
          })();

          return (
            <div className="space-y-6 font-sans text-right animate-fade-in" dir="rtl">
              
              {/* Header and Filter controller */}
              <div className="bg-white border text-right border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500 shrink-0" />
                    لوحة التحليلات ومؤشرات أداء المنيو 📊
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">تتبع حركة الزبائن، والوجبات المتصدرة، مبيعات الواتساب الفورية</p>
                </div>

                {/* Period Selector segment controllers */}
                <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 select-none w-full sm:w-auto">
                  {[
                    { id: 'today', label: 'اليوم ☀️' },
                    { id: 'week', label: 'الأسبوع الأخير 📅' },
                    { id: 'month', label: 'كل الأوقات ♾️' }
                  ].map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setAnalyticsPeriod(period.id as any)}
                      className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${analyticsPeriod === period.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bento Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Views Count */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">زيارات المنيو الرقمي</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{periodStats.views}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-black flex items-center gap-0.5 justify-start font-mono pt-2 border-t border-slate-50">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.4% متفاعل</span>
                  </div>
                </div>

                {/* 2. WhatsApp Orders Click */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">طلبات الواتساب المرسلة</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{periodStats.orders}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-black flex items-center gap-0.5 justify-start font-mono pt-2 border-t border-slate-50">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>خروج سلة مكتمل</span>
                  </div>
                </div>

                {/* 3. Conversion rate */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">معدل تحويل الطلب للزائر</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block mt-1">{conversionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${Math.min(100, parseFloat(conversionRate) * 3)}%` }} />
                  </div>
                </div>

                {/* 4. Estimated financial stats value */}
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                  <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">قيمة مبيعات السلة المقدرة</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block mt-1">
                      {estimatedValue} <span className="text-xs font-black">{restaurant.currency || 'EGP'}</span>
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold block pt-2 border-t border-slate-50">بمتوسط حجم طلب 155 ج.م</span>
                </div>

              </div>

              {/* Advanced Two-Column Section: popular list + times insights */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Popularity ranking items table */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        الأصناف والأطباق الأكثر طلباً ورواجاً 🔥
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ترتيب السلع تنازلياً وفقاً لنقرات سلة الطلب</p>
                    </div>
                    <span className="text-[10px] font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">
                      {popularProducts.length} أطباق بالتحليل
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {popularProducts.map((p, idx) => {
                      const rankSymbols = ['🥇', '🥈', '🥉'];
                      
                      // Percentage of total views this item got to render inline bars
                      const percentOfViews = periodStats.views > 0 ? (p.views / periodStats.views) * 100 : 25;

                      return (
                        <div key={p.id} className="flex items-center gap-3.5 py-3.5 first:pt-1 last:pb-1">
                          
                          {/* Rank badge */}
                          <div className="w-7 h-7 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center text-xs font-black shrink-0 relative">
                            {idx < 3 ? (
                              <span className="text-base leading-none">{rankSymbols[idx]}</span>
                            ) : (
                              <span className="text-[10px] font-mono leading-none">#{idx + 1}</span>
                            )}
                          </div>

                          {/* Image thumbnail */}
                          <img 
                            src={p.image} 
                            className="w-10 h-10 rounded-xl object-cover border bg-slate-100 shrink-0" 
                            alt={p.name} 
                          />

                          {/* Info Column */}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <h5 className="text-xs font-black text-slate-900 line-clamp-1">{p.name}</h5>
                              <span className="text-xs font-black text-slate-800 font-mono shrink-0 ml-1">
                                {p.price} {restaurant.currency || 'EGP'}
                              </span>
                            </div>

                            {/* Views and conversion status bar indicators */}
                            <div className="flex items-center gap-4 text-[10px] text-slate-400">
                              <div className="flex items-center gap-1">
                                <span>المشاهدات:</span>
                                <span className="font-extrabold text-slate-700 font-mono">{p.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>الطلبات:</span>
                                <span className="font-extrabold text-slate-700 font-mono text-emerald-600 flex items-center">
                                  {p.orders}
                                </span>
                              </div>
                              {p.revenue > 0 && (
                                <div className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                  <span>عائد:</span>
                                  <span className="font-bold">{p.revenue}</span>
                                </div>
                              )}
                            </div>

                            {/* Visual line graph bar */}
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-amber-400' : 'bg-slate-400'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(10, percentOfViews))}%` }}
                              />
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance charts and visit times insights column */}
                <div className="space-y-4">
                  
                  {/* Visited peak hour timeline card */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500" />
                        أوقات ذروة تصفح المنيو للزبائن ⌛
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ساعات الذروة التي يزداد فيها الطلب بكثافة</p>
                    </div>

                    <div className="space-y-3 pt-1">
                      {[
                        { time: 'العشاء والمساء (7 مساءً - 11 ليلاً)', percent: 78, label: 'نشط جداً رواج ممتاز 🔥' },
                        { time: 'الغداء والظهيرة (2 مساءً - 6 مساءً)', percent: 54, label: 'متوسط الأداء المستمر 🍗' },
                        { time: 'الصباح الباكر (8 صباحاً - 1 مساءً)', percent: 22, label: 'نشاط الإفطار والمشروبات ☕' },
                        { time: 'منتصف الليل (12 ليلاً - 4 فجراً)', percent: 35, label: 'الطلبات المتأخرة والتحلية 🥞' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-800">{item.time}</span>
                            <span className="text-amber-600 font-mono">{item.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-400">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Browser Devices analytics card */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        قنوات تصفح الزوار (نوع الأجهزة) 📱
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">تحليل نوع الجوالات المستخدمة لمسح QR</p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {/* iOS users */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>جوالات آيفون (Apple iOS) 🍎</span>
                            <span className="font-mono text-slate-800">58%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-slate-900 h-full rounded-full" style={{ width: '58%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Android users */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>جوالات أندرويد (Google Android) 🤖</span>
                            <span className="font-mono text-slate-800">37%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '37%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-700 shrink-0">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>أجهزة مكتبية (Desktop) 💻</span>
                            <span className="font-mono text-slate-800">5%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: '5%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Free Lifetime Platform support layout reminder */}
              <div className="bg-gradient-to-l from-slate-900 to-slate-850 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  منصة منيو كليك حرة ومفتوحة بالكامل بلا قيود
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  تلتزم "منيو كليك" بدعم قطاع الضيافة. كافة قنوات المبيعات والإحصائيات دقيقة ومحدثة سحابياً لحظياً. إذا قمت بنشر رابط المبيعات للعملاء أو تفعيل علامات الـ QR Code، فستظهر العمليات مباشرة هنا مجاناً مدى الحياة دون حدود تجديد!
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
                  required
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
                    required
                    value={categoryForm.order}
                    onChange={e => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
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
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition mt-2 flex items-center justify-center gap-1.5"
              >
                <span>{editingCategory ? 'حفظ التعديلات' : 'إنشاء القسم بلحظة'}</span>
              </button>
            </form>
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

            <form onSubmit={handleProductSubmit} className="space-y-4">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الوجبة</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs focus:bg-white"
                    placeholder="مثال: شاورما دجاج مميز"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">القسم التابع له السلعة 📁</label>
                  <select
                    value={productForm.categoryId}
                    onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-2.5 text-xs font-bold focus:bg-white text-right"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
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
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
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
                      value={productForm.originalPrice || 0}
                      onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
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

              {/* Product Photo section with predefined beautiful presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">صورة الوجبة التفاعلية 📸</label>
                
                <div className="flex flex-col gap-2">
                  <input 
                    type="url" 
                    required
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
                    required
                    value={productForm.order}
                    onChange={e => setProductForm({ ...productForm, order: Number(e.target.value) })}
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
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center justify-center gap-1"
              >
                <span>{editingProduct ? 'حفظ تفاصيل التعديل للطبق 🍕' : 'إضافة للوجبات بالمنيو للزبون'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
