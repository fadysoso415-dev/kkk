import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Search, 
  Check, 
  ShoppingBag, 
  Percent, 
  DollarSign, 
  X, 
  CreditCard, 
  User, 
  Clipboard, 
  Sliders, 
  AlertCircle, 
  ShoppingCart,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Table
} from 'lucide-react';
import { Restaurant, Category, Product, Order, OrderItem, ProductSize } from '../types';
import { printReceiptClassic } from './PrintTemplate';

interface CashierPOSProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  onSaveOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  lang: 'ar' | 'en';
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
  notes?: string;
}

export default function CashierPOS({ restaurant, categories, products, onSaveOrder, lang }: CashierPOSProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout settings
  const [tableName, setTableName] = useState<string>('طاولة 1');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'due'>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [cashierNotes, setCashierNotes] = useState<string>('');
  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Filter products by active category and search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isAvailable) return false;
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
      const term = searchQuery.trim().toLowerCase();
      if (!term) return matchesCategory;
      const matchesName = p.name.toLowerCase().includes(term) || (p.nameEn && p.nameEn.toLowerCase().includes(term));
      const matchesDesc = p.description.toLowerCase().includes(term) || (p.descriptionEn && p.descriptionEn.toLowerCase().includes(term));
      return matchesCategory && (matchesName || matchesDesc);
    });
  }, [products, activeCategory, searchQuery]);

  // Handle adding product to cart
  const addToCart = (product: Product, size?: ProductSize) => {
    setCart(prev => {
      const idx = prev.findIndex(item => 
        item.product.id === product.id && 
        ((!size && !item.selectedSize) || (size && item.selectedSize && item.selectedSize.id === size.id))
      );
      if (idx > -1) {
        return prev.map((item, i) => 
          i === idx ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { product, quantity: 1, selectedSize: size, notes: '' }];
      }
    });
  };

  const updateQuantity = (index: number, val: number) => {
    setCart(prev => {
      const targetItem = prev[index];
      if (!targetItem) return prev;
      const newQty = targetItem.quantity + val;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      } else {
        return prev.map((item, i) => 
          i === index ? { ...item, quantity: newQty } : item
        );
      }
    });
  };

  const updateItemNotes = (index: number, notes: string) => {
    setCart(prev => {
      return prev.map((item, i) => 
        i === index ? { ...item, notes } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCashierNotes('');
    setTableName('طاولة 1');
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.product.isDiscounted && item.product.discountPrice !== undefined
        ? item.product.discountPrice
        : item.product.price;
      const extra = item.selectedSize ? item.selectedSize.priceAdded : 0;
      return acc + (price + extra) * item.quantity;
    }, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    if (!includeTax) return 0;
    // Assume standard 14% VAT (ضريبة القيمة المضافة)
    return parseFloat((subtotal * 0.14).toFixed(2));
  }, [subtotal, includeTax]);

  const totalPrice = useMemo(() => {
    const total = subtotal + taxAmount - discountAmount;
    return Math.max(0, parseFloat(total.toFixed(2)));
  }, [subtotal, taxAmount, discountAmount]);

  // Printer function: Thermal receipt layout utilizing our modular PrintTemplate engine
  const printReceipt = (order: Order, dbOrderId: string) => {
    printReceiptClassic(restaurant, { ...order, id: dbOrderId }, { lang });
  };

  // Keyboard Shortcuts System for direct quick checkout actions
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support Ctrl or Cmd (metaKey)
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier) {
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          if (successOrder) {
            printReceipt(successOrder, successOrder.id);
            setSuccessOrder(null);
          } else if (cart.length > 0 && !isSubmitting) {
            handleCheckout();
          }
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          if (successOrder) {
            setSuccessOrder(null);
          } else {
            clearCart();
          }
        } else if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          clearCart();
        }
      } else {
        if (e.key === 'Escape') {
          if (successOrder) {
            setSuccessOrder(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    cart,
    successOrder,
    isSubmitting,
    autoPrintEnabled,
    tableName,
    orderType,
    paymentMethod,
    discountAmount,
    includeTax,
    cashierNotes,
    totalPrice,
    taxAmount
  ]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      // Maps standard CartItem format into OrderItem Schema for order collection compatibility
      const items: OrderItem[] = cart.map(item => {
        const itemPrice = item.product.isDiscounted && item.product.discountPrice !== undefined
          ? item.product.discountPrice
          : item.product.price;
        const extra = item.selectedSize ? item.selectedSize.priceAdded : 0;
        return {
          productId: item.product.id,
          name: item.product.name,
          price: itemPrice + extra,
          quantity: item.quantity,
          size: item.selectedSize?.name || undefined
        };
      });

      // Construct metadata compliant payload
      const payload: Omit<Order, 'id'> = {
        tableName: `${orderType === 'dine_in' ? 'طاولة' : orderType === 'delivery' ? 'توصيل' : 'سفري'} - ${tableName}`,
        items,
        totalPrice,
        notes: cashierNotes || undefined,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'completed', // Direct completed status as Cashier generated POS transactions
        isSettled: paymentMethod === 'cash' || paymentMethod === 'card', // Auto settled if Cash/Card
        settledAt: paymentMethod === 'cash' || paymentMethod === 'card' ? new Date().toISOString() : undefined,
        // Cashier specific system metadata fields
        ...cleanUndefined({
          paymentMethod,
          orderType,
          discountAmount: discountAmount || undefined,
          taxAmount: taxAmount || undefined,
          isCashierGenerated: true
        })
      };

      const orderId = await onSaveOrder(payload);
      
      const successObj = { id: orderId, ...payload };
      setSuccessOrder(successObj);

      // Trigger standard thermal report layout print window if enabled
      if (autoPrintEnabled) {
        printReceipt(successObj, orderId);
      }
      
      // Flash clean POS board state
      setCart([]);
      setDiscountAmount(0);
      setCashierNotes('');
    } catch (error) {
      console.error(error);
      alert('خطأ أثناء تسجيل طلب POS الكاشير.');
    } finally {
      setIsSubmitting(false);
    }
  };

  function cleanUndefined<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) cleaned[k] = v;
    }
    return cleaned as T;
  }

  return (
    <div id="cashier_pos_system" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* SECTION 1: POS Itemized Catalog & Categories Filter (8 Columns RTL Layout) */}
      <div className="lg:col-span-8 space-y-6 text-right" dir="rtl">
        
        {/* Banner with Cashier Status */}
        <div className="bg-gradient-to-l from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">منصة كاشير المطعم المباشرة (Direct POS Console) 🖥️</h4>
              <p className="text-xs text-slate-400 mt-0.5">سجل مبيعاتك الفورية، اطبع الإيصالات للزبائن لتدخل تلقائياً في الإحصائيات</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 self-stretch sm:self-auto justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300">نقطة الكاشير نشطة ومربوطة بالحسابات</span>
          </div>
        </div>

        {/* Quick Settings Bar with Auto-Print toggles & Keyboard shortcuts */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
            <Sliders className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>إعدادات لوحة المبيعات السريعة والتحكم ⚙️</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Auto Print Toggle Switch */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoPrintEnabled}
                  onChange={(e) => setAutoPrintEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 relative transition-colors duration-200">
                  <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-200 ${autoPrintEnabled ? 'right-[2px]' : 'right-[18px]'}`} />
                </div>
              </div>
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                الطباعة التلقائية فور إنهاء الطلب 🖨️✨
              </span>
            </label>

            {/* Division Line */}
            <div className="hidden sm:block w-[1px] h-4 bg-slate-200" />

            {/* Interactive shortcuts legend */}
            <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
              <span className="text-slate-700 font-extrabold shrink-0">⌨️ اختصارات سريعة:</span>
              <div className="flex items-center gap-1">
                <kbd className="bg-white border border-slate-200 shadow-xs rounded px-1 font-mono text-[9px] text-slate-600">Ctrl+P</kbd>
                <span className="text-[9px] text-slate-500">حفظ وطباعة</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-white border border-slate-200 shadow-xs rounded px-1 font-mono text-[9px] text-slate-600">Ctrl+N</kbd>
                <span className="text-[9px] text-slate-500">فاتورة جديدة</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-white border border-slate-200 shadow-xs rounded px-1 font-mono text-[9px] text-slate-600">Ctrl+Q</kbd>
                <span className="text-[9px] text-slate-500">تصفير</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Layout */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="pos_search"
              placeholder="ابحث عن وجبة أو مشروب أو صنف في القائمة... 🍕"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-xs outline-none focus:bg-white focus:border-amber-500 placeholder:text-slate-450 text-right font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Horizontal scrolling array */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <button
              id="cat_all"
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/15'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              جميع العناصر ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat_${cat.id}`}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/15'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* POS Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const hasSizes = p.sizes && p.sizes.length > 0;
            const itemPrice = p.isDiscounted && p.discountPrice !== undefined ? p.discountPrice : p.price;
            
            return (
              <div 
                key={p.id}
                id={`pos_prod_${p.id}`}
                className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition duration-200 select-none"
              >
                {/* Image Section */}
                <div className="relative h-28 bg-slate-50">
                  <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                  
                  {p.badge && (
                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-[8px] font-black text-amber-500 px-2 py-0.5 rounded-full z-10 border border-amber-500/20">
                      {p.badge}
                    </span>
                  )}

                  {p.isDiscounted && (
                    <span className="absolute top-2 left-2 bg-rose-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full z-10">
                      خصم %{Math.round(((p.price - (p.discountPrice || 0)) / p.price) * 100)}
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 text-right">
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 leading-snug line-clamp-1">{p.name}</h5>
                    {p.description && <p className="text-[9px] text-slate-450 line-clamp-2 mt-1 leading-normal">{p.description}</p>}
                  </div>

                  {/* Pricing and Action Row */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                    <div className="flex flex-col text-right">
                      <span className="text-[12px] font-extrabold text-slate-900 font-mono">
                        {itemPrice.toFixed(2)} ج.م
                      </span>
                      {p.isDiscounted && (
                        <span className="text-[9px] text-slate-400 line-through font-mono">
                          {p.price.toFixed(2)} ج.م
                        </span>
                      )}
                    </div>

                    {!hasSizes ? (
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold p-1.5 rounded-lg transition text-[9px] cursor-pointer flex items-center justify-center gap-1.5 px-2.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>أضف للطلب</span>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[7px] text-slate-450 font-black">اختر الحجم:</span>
                        <div className="flex gap-1">
                          {p.sizes?.map(sz => (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => addToCart(p, sz)}
                              className="bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 font-bold p-1 px-1.5 rounded text-[8px] transition cursor-pointer font-mono"
                              title={`${sz.name} (+${sz.priceAdded})`}
                            >
                              {sz.name.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full bg-slate-50 p-12 text-center rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">لا توجد أطباق مطابقة للبحث أو القسم المحدد بالمنيو!</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="text-[10px] text-amber-500 font-extrabold mt-2 underline block mx-auto cursor-pointer"
              >
                إعادة تصفية القائمة
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: Success Confirmation Box */}
        {successOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <b className="text-xs text-emerald-950 font-extrabold">تم تسجيل الطلب رقم ({successOrder.id?.slice(0, 8)}) بالداتا بنجاح! 🧾🚀</b>
                <p className="text-[10px] text-emerald-800 leading-relaxed mt-0.5">
                  تمت التصفية تلقائياً وإضافته للحسابات. إذا لم تفتح نافذة الطباعة تلقائياً، انقر فوق الزر أدناه لإعادة طباعة الإيصال الحراري.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => printReceipt(successOrder, successOrder.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>إعادة طباعة الفاتورة 🖨️</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                إغلاق الإشعار ❌
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* SECTION 2: Receipt Sidebar / Current Bill Cart (4 Columns Layout) */}
      <div className="lg:col-span-4 sticky top-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-lg shadow-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Cart Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black">فاتورة الطلب الحالية</span>
            </div>
            <span className="bg-amber-500/20 text-amber-500 border border-amber-550/30 text-[10px] font-black px-2.5 py-0.5 rounded-lg">
              {cart.length} أصناف
            </span>
          </div>

          {/* Unified Scrollable Container */}
          <div className="flex-1 overflow-y-auto select-none min-h-0 flex flex-col justify-between scrollbar-thin">
            {/* Cart Items Area */}
            <div className="p-4 space-y-3.5 divide-y divide-slate-100">
              {cart.map((item, index) => {
                const base = item.product.isDiscounted && item.product.discountPrice !== undefined
                  ? item.product.discountPrice
                  : item.product.price;
                const sizeCost = item.selectedSize ? item.selectedSize.priceAdded : 0;
                const unitPrice = base + sizeCost;

                return (
                  <div key={`${item.product.id}-${item.selectedSize?.id || 'none'}`} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h6 className="text-[10px] font-extrabold text-slate-900 leading-tight">
                          {item.product.name}
                        </h6>
                        {item.selectedSize && (
                          <span className="bg-slate-100 text-slate-600 text-[8px] px-1.5 py-0.2 rounded font-mono mr-1">
                            حجم: {item.selectedSize.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-800 font-mono shrink-0">
                        {(unitPrice * item.quantity).toFixed(2)} ج.م
                      </span>
                    </div>

                    {/* Quantity and Custom notes controls */}
                    <div className="flex items-center justify-between gap-4">
                      <input
                        type="text"
                        placeholder="أضف ملاحظات (مثال: بدون بصل)"
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(index, e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 px-2 text-[9px] flex-1 outline-none text-right font-medium focus:bg-white focus:border-slate-350"
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, -1)}
                          className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black font-mono w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, 1)}
                          className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="text-center py-10">
                  <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                  <p className="text-[11px] font-bold text-slate-400">الفاتورة فارغة. انقر على المنتجات بالمنيو لإضافتها!</p>
                </div>
              )}
            </div>

            {/* Checkout Controls Section */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-4 mt-auto">
              
              {/* Table Name and Order Type inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-600">نوع الاستلام والطلب 🏷️</label>
                  <select
                    value={orderType}
                    onChange={(e) => {
                      const type = e.target.value as 'dine_in' | 'takeaway' | 'delivery';
                      setOrderType(type);
                      if (type === 'takeaway') setTableName('تيك اواي');
                      else if (type === 'delivery') setTableName('توصيل خارجي');
                      else setTableName('طاولة 1');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="dine_in">صالة / محلي 🍽️</option>
                    <option value="takeaway">سفري / تيك اواي 🛍️</option>
                    <option value="delivery">توصيل / ديلفري 🛵</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-600">المكان / رقم الطاولة 📍</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[10px] font-extrabold outline-none text-right"
                    placeholder="طاولة 1 ou سفري"
                  />
                </div>
              </div>

              {/* Payment Method choices */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-600">طريقة سداد الحساب 💰</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'نقدي (كاش)', icon: DollarSign },
                    { id: 'card', label: 'شبكة (فيزا)', icon: CreditCard },
                    { id: 'due', label: 'على الحساب', icon: User }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id as any)}
                      className={`py-1.5 px-1 rounded-xl border text-[9px] font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === opt.id 
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-black' 
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-650'
                      }`}
                    >
                      <opt.icon className={`w-3.5 h-3.5 ${paymentMethod === opt.id ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Discount and Tax setup */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-600">خصم مباشر للكاشير (ج.م) 💸</label>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-[10px] font-mono text-center outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] font-black text-slate-600">الضريبة والخدمة (%14) 🏛️</span>
                  <button
                    type="button"
                    onClick={() => setIncludeTax(!includeTax)}
                    className={`w-full py-2 border rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                      includeTax 
                        ? 'bg-slate-900 border-slate-900 text-amber-500 font-extrabold' 
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {includeTax ? 'مفعلة 👍' : 'غير مفعلة ❌'}
                  </button>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-1.5 text-xs select-none">
                <div className="flex justify-between font-medium text-slate-600 text-[10px]">
                  <span>المجموع الكلي للوجبات:</span>
                  <span className="font-mono">{subtotal.toFixed(2)} ج.م</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600 text-[10px]">
                    <span>الخصم المستقطع:</span>
                    <span className="font-mono">-{discountAmount.toFixed(2)} ج.م</span>
                  </div>
                )}
                {includeTax && (
                  <div className="flex justify-between font-medium text-slate-550 text-[10px]">
                    <span>ضريبة القيمة المضافة:</span>
                    <span className="font-mono">+{taxAmount.toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-slate-950 text-sm border-t border-slate-200 pt-2 shrink-0">
                  <span>الإجمالي النهائي للطلب:</span>
                  <span className="font-mono text-amber-600 text-base">{totalPrice.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* General notes */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-600">ملاحظات الفاتورة العامة 📝</label>
                <textarea
                  value={cashierNotes}
                  onChange={(e) => setCashierNotes(e.target.value)}
                  rows={1}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[10px] font-medium resize-none outline-none focus:border-amber-500"
                  placeholder="ملاظات عامة على كامل الفاتورة..."
                />
              </div>

              {/* CTA action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  title="تصفير الفاتورة"
                  className="p-3 bg-slate-200 hover:bg-slate-250 text-slate-600 rounded-xl transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handleCheckout}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{autoPrintEnabled ? 'جاري الحفظ وطباعة الفاتورة...' : 'جاري حفظ الطلب بالداتا...'}</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      <span>{autoPrintEnabled ? 'إنهاء الطلب وطباعة الإيصال 🖨️' : 'إنهاء طلب الكاشير وحفظ الفاتورة 💾'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SUCCESS ORDER PRINT PREVIEW DIALOG MODAL */}
      <AnimatePresence>
        {successOrder && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col justify-between border border-slate-100 font-sans"
            >
              {/* Modal Header */}
              <div className="bg-emerald-600 text-white p-5 text-center relative">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2.5">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black text-white">تم تسجيل الفاتورة بنجاح! 🎉</h3>
                <p className="text-[10px] text-emerald-100 mt-1">
                  رقم الصفقة: <span className="font-mono font-bold">{successOrder.id?.toUpperCase().slice(0, 10)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessOrder(null)}
                  className="absolute top-4 left-4 text-white/80 hover:text-white cursor-pointer bg-black/10 hover:bg-black/25 p-1 px-1.5 rounded-lg text-xs flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Physical/Thermal Receipt Mockup Container */}
              <div className="p-5 bg-slate-50 flex-1 overflow-y-auto max-h-[50vh]">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 font-mono text-[10px] text-slate-900 leading-relaxed max-w-sm mx-auto relative">
                  
                  {/* Decorative simulated cut pattern top */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-slate-200 to-transparent opacity-65" />

                  <div className="text-center space-y-1 mb-4">
                    {restaurant.logo && <img src={restaurant.logo} className="w-10 h-10 object-cover mx-auto rounded-lg mb-1" />}
                    <h4 className="text-[11px] font-bold font-sans text-slate-950">{restaurant.name}</h4>
                    <p className="text-[9px] text-slate-500 font-sans">فاتورة مبيعات مباشرة مبسطة</p>
                    <p className="text-[8px] text-slate-400">التاريخ: {new Date(successOrder.timestamp).toLocaleString('ar-EG', { hour12: true })}</p>
                  </div>

                  {/* Meta items */}
                  <div className="border-t border-b border-dashed border-slate-200 py-2 my-2 space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-sans">نوع الطلب / التوصيل:</span>
                      <span className="font-bold font-sans text-slate-900">
                        {successOrder.tableName} (
                        {successOrder.orderType === 'takeaway' ? 'سفري' : successOrder.orderType === 'delivery' ? 'توصيل' : 'صالة'}
                        )
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">طريقة الدفع الفورية:</span>
                      <span className="font-bold font-sans text-slate-900">
                        {successOrder.paymentMethod === 'card' ? 'بطاقة / شبكة 💳' : successOrder.paymentMethod === 'due' ? 'ذمم / على الحساب 🤵' : 'كاش / نقداً 💵'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <table className="w-full text-right border-b border-dashed border-slate-200 pb-2 mb-2">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100 pb-1 text-[9px]">
                        <th className="font-sans pb-1">الصنف</th>
                        <th className="font-sans text-center pb-1">الكمية</th>
                        <th className="font-sans text-left pb-1">السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/55">
                      {successOrder.items.map((it: any, k: number) => (
                        <tr key={k}>
                          <td className="py-2 font-sans leading-tight">
                            <span className="text-slate-950 font-bold">{it.name}</span>
                            {it.size && <span className="block text-[8px] text-slate-500 font-sans">حجم: {it.size}</span>}
                          </td>
                          <td className="text-center text-slate-700 font-sans">{it.quantity}</td>
                          <td className="text-left text-slate-950 font-sans font-bold">{(it.price * it.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Receipt totals */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="font-sans">المجموع الفرعي:</span>
                      <span>{(successOrder.totalPrice - (successOrder.taxAmount || 0) + (successOrder.discountAmount || 0)).toFixed(2)}</span>
                    </div>
                    {successOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span className="font-sans font-bold">خصومات الكاشير:</span>
                        <span>-{successOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {successOrder.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span className="font-sans">ضريبة القيمة المضافة (14%):</span>
                        <span>+{successOrder.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-950 text-[11px] text-amber-600">
                      <span className="font-sans font-black">الإجمالي الكلي:</span>
                      <span className="font-bold">{successOrder.totalPrice.toFixed(2)} {restaurant.currency || 'ج.م'}</span>
                    </div>
                  </div>

                  {successOrder.notes && (
                    <div className="mt-3 bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-500 font-sans text-[8px] leading-relaxed">
                      <b>ملاحظة الفاتورة:</b> {successOrder.notes}
                    </div>
                  )}

                  {/* Simulated cut pattern bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-t from-slate-200 to-transparent opacity-65" />
                </div>
              </div>

              {/* Action Operations */}
              <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    printReceipt(successOrder, successOrder.id);
                    setSuccessOrder(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition duration-150 flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-650/15 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة وبدء فاتورة جديدة 🖨️✨ <kbd className="bg-emerald-700 text-[10px] px-1 rounded font-mono ml-1">Ctrl+P</kbd></span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printReceipt(successOrder, successOrder.id);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>طباعة فقط 📄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccessOrder(null)}
                    className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <span>فاتورة جديدة ➕ <kbd className="bg-slate-800 text-[9px] px-1 rounded font-mono ml-1">Ctrl+N</kbd></span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
