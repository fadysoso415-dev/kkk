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
  Share2
} from 'lucide-react';
import { Restaurant, Category, Product, CartItem } from '../types';
import { 
  getRestaurantBySlug, 
  getCategories, 
  getProducts, 
  incrementRestaurantViews, 
  incrementWhatsappOrders,
  db
} from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { SAMPLE_RESTAURANTS, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../sampleData';

interface MenuViewerProps {
  restaurantSlug: string;
  onBackToLanding: () => void;
}

export default function MenuViewer({ restaurantSlug, onBackToLanding }: MenuViewerProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom function to show a beautiful temporary message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Web Share API with Clipboard Fallback
  const handleShare = async () => {
    if (!restaurant) return;
    const shareUrl = window.location.href;
    const shareTitle = restaurant.name;
    const shareText = `تصفح منيو ${restaurant.name} الإلكتروني والطلب المباشر! 🍽️✨`;

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
        triggerToast("تم نسخ رابط المنيو بنجاح (QR URL)! جاهز الآن للمشاركة 📋");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        triggerToast("عذراً، لم نتمكن من نسخ الرابط تلقائياً.");
      }
    }
  };

  // Cart Management States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [tableNameInput, setTableNameInput] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

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
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const adjustQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((tot, item) => {
      const price = item.product.isDiscounted && item.product.discountPrice 
        ? item.product.discountPrice 
        : item.product.price;
      return tot + (price * item.quantity);
    }, 0);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // WhatsApp checkout pipeline formatting
  const handleCheckoutWhatsApp = () => {
    if (!restaurant) return;
    if (!tableNameInput.trim()) {
      alert("الرجاء تحديد رقم الطاولة أو اسم المستلم لتزويد الطاهي بالهوية الصحيحة للطلب.");
      return;
    }

    // Format Arabic whatsapp text string template
    let text = `*طلب جديد للمطبخ من مناديب الطاولات 🛎️*\n`;
    text += `*اسم الزبون / رقم الطاولة:* ${tableNameInput.trim()}\n`;
    if (checkoutNotes.trim()) {
      text += `*ملاحظات الزبون:* ${checkoutNotes.trim()}\n`;
    }
    text += `\n---------------------------------\n`;
    text += `*الأصناف والمشروبات المطلوبة:*\n`;

    cart.forEach((item, idx) => {
      const itemPrice = item.product.isDiscounted && item.product.discountPrice 
        ? item.product.discountPrice 
        : item.product.price;
      text += `${idx + 1}- _${item.product.name}_ [عدد: ${item.quantity}] \n`;
      text += `    السعر: ${itemPrice * item.quantity} ${restaurant.currency}\n`;
    });

    text += `---------------------------------\n`;
    text += `*الحساب الإجمالي للطلب:* *${getCartTotal()} ${restaurant.currency}*\n\n`;
    text += `_تم إنشاؤه وصياغته عبر بوابة منيو كليك السريعة_`;

    // Dynamic database tracking logging event
    incrementWhatsappOrders(restaurant.id);

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
  const filteredProducts = products.filter(prod => {
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

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      
      {/* Centered screen boundary similar to global high-end web applications */}
      <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col shadow-2xl border-x border-slate-200/50 bg-white dark:bg-slate-900">
        
        {/* Interactive Floating Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-150 dark:border-slate-800 p-4 pb-2.5 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            منيو كليك
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="مشاركة رابط المنيو"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer text-[11px] font-extrabold select-none"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* HERO BANNER SECTION */}
        <div className="relative h-44 shrink-0 overflow-hidden select-none">
          <img 
            src={restaurant.cover} 
            className="w-full h-full object-cover" 
            alt={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
          
          {/* Cover Details overlay */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end text-white text-right">
            <div className="flex items-center gap-3">
              <img 
                src={restaurant.logo} 
                className="w-12 h-12 rounded-full border-2 border-white/80 bg-white shadow-lg object-cover" 
                alt="logo"
              />
              <div>
                <h2 className="text-base font-black tracking-tight leading-tight">{restaurant.name}</h2>
                <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{restaurant.address}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome message section */}
        <div className="p-4 bg-amber-500/5 dark:bg-amber-400/5 border-b border-amber-500/10 p-3.5 space-y-1">
          <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {restaurant.welcomeTitle || 'مرحباً بالضيوف الأعزاء'}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-right font-medium">
            {restaurant.welcomeSubtitle || 'شرفنا تصفحكم للمنيو وتقديم ألذ الأصناف.'}
          </p>
        </div>

        {/* Dynamic Live Categorized search input */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-9 py-2.5 rounded-xl outline-none text-xs text-right text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-850"
              placeholder="ابحث عن وجبة أو شراب في الـ QR..."
            />
          </div>
        </div>

        {/* Horizontal Navigation Pills scroll */}
        <div className="sticky top-12 z-25 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-black transition cursor-pointer select-none ${selectedCategory === 'all' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            كل المأكولات 🍽️
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition cursor-pointer select-none ${selectedCategory === cat.id ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* DRUM OF LISTINGS */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h5 className="text-sm font-bold text-slate-400">لا توجد منتجات مطابقة لعملية البحث</h5>
              <p className="text-[11px] text-slate-500">جرب تصفح قسم آخر أو تعديل حقول البحث.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex p-2 gap-3"
                >
                  {/* Photo part */}
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative bg-slate-200">
                    <img ssc={prod.image} src={prod.image} className="w-full h-full object-cover" alt={prod.name} referralpolicy="no-referrer" />
                    {prod.badge && (
                      <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md scale-95">
                        {prod.badge}
                      </span>
                    )}
                    {!prod.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 text-slate-300 flex items-center justify-center text-[9px] font-bold text-center p-1">
                        انتهى اليوم
                      </div>
                    )}
                  </div>

                  {/* Text details column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1">{prod.name}</h4>
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono shrink-0">
                          {prod.isDiscounted && prod.discountPrice ? (
                            <div className="flex flex-col text-left">
                              <span>{prod.discountPrice} {restaurant.currency}</span>
                              <span className="text-[9px] text-slate-400 line-through font-normal leading-none">{prod.price}</span>
                            </div>
                          ) : (
                            <span>{prod.price} {restaurant.currency}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                        {prod.description || 'وجبة طازجة مجهزة بمطابخنا الفاخرة.'}
                      </p>
                    </div>

                    <div className="flex justify-end pt-1">
                      {prod.isAvailable ? (
                        <button
                          onClick={() => addToCart(prod)}
                          className="bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-500/20 rounded-lg px-2.5 py-1 text-[9px] font-extrabold transition cursor-pointer select-none"
                        >
                          إضافة للسلة +
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg select-none">
                          غير متوفر ❌
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
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px]">
                    {totalCartCount}
                  </span>
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                    <ShoppingCart className="w-5 h-5 font-bold" />
                  </div>
                </div>

                <div className="text-right">
                  <h5 className="text-[10px] text-slate-400 font-bold uppercase">إجمالي السلة ✅</h5>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                    {getCartTotal()} {restaurant.currency}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 font-black rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5 select-none"
              >
                تحديث الطلب ومراجعته 📱
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

              <h3 className="text-base font-black text-slate-950 dark:text-white mb-4 mt-1 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                سلة المأكولات والمقبلات (الـ QR)
              </h3>

              {/* Items List scroll */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px] min-h-[140px] border-b border-slate-100 dark:border-slate-850 pb-4">
                {cart.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-10">السلة فارغة حالياً. أضف وجباتك لتسهيل تجهيز المطبخ!</p>
                ) : (
                  cart.map((item) => {
                    const price = item.product.isDiscounted && item.product.discountPrice 
                      ? item.product.discountPrice 
                      : item.product.price;
                    return (
                      <div key={item.product.id} className="flex justify-between items-center gap-3">
                        <div className="flex-1 text-right">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                            {price * item.quantity} {restaurant.currency}
                          </span>
                        </div>

                        {/* Adjust qty triggers */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => adjustQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition select-none"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="text-xs font-bold font-mono px-1.5 text-slate-800 dark:text-slate-100">{item.quantity}</span>

                          <button
                            onClick={() => addToCart(item.product.id as any ? item.product : item.product)}
                            className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition select-none"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-300 hover:text-rose-600 transition p-1"
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
                  <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-350 mb-1.5 text-right">
                    رقم أو كود طاولة الجلوس / اسم الزبون 🛎️ *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={tableNameInput}
                    onChange={(e) => setTableNameInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 outline-none rounded-xl p-2.5 text-xs text-right text-slate-800 dark:text-slate-100"
                    placeholder="طاولة رقم #4 أو سفري عائلي"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-350 mb-1.5 text-right flex justify-between items-center select-none">
                    <span>إرشادات المطبخ أو بهارات خاصة للوجبة (اختياري)</span>
                    {getCartSuggestions().length > 0 && (
                      <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                        توصيات ذكية ✨
                      </span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 outline-none rounded-xl p-2.5 text-xs text-right text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="مثال: بدون مايونيز، صوص زيادة..."
                  />

                  {/* Smart Suggestions Auto-Complete Pills */}
                  {getCartSuggestions().length > 0 && (
                    <div className="mt-2 text-right">
                      <div className="flex flex-wrap gap-1.5 justify-start">
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
                              className="text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-500/5 hover:bg-amber-500 border border-amber-500/10 hover:border-amber-500 dark:bg-amber-400/5 dark:hover:bg-amber-500 text-slate-700 dark:text-slate-350 hover:text-white dark:hover:text-white transition duration-150 cursor-pointer select-none"
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
                <div className="flex justify-between items-center text-xs sm:text-sm font-black dark:text-white font-mono">
                  <span>إجمالي الحساب الفاتورة:</span>
                  <span className="text-amber-600 dark:text-amber-400">{getCartTotal()} {restaurant.currency}</span>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  إرسال الطلب عبر الواتس اب 💬
                </button>

                <p className="text-[9px] text-center text-slate-450 dark:text-slate-400">
                  سيتم تجهيز طلبك في المطبخ وتحويلك لتستلم تفاصيل الفاتورة على الواتساب مع العاملين بالصالة.
                </p>
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
