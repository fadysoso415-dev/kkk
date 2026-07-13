import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  Settings, 
  HelpCircle,
  Eye,
  X,
  Edit2
} from 'lucide-react';
import { Product, Category, Restaurant } from '../types';

interface InventoryManagerProps {
  restaurant: Restaurant;
  products: Product[];
  categories: Category[];
  onUpdateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<void>;
  onUpdateRestaurant: (updatedFields: Partial<Restaurant>) => Promise<void>;
  isDemo: boolean;
  lang: 'ar' | 'en';
}

export default function InventoryManager({
  restaurant,
  products,
  categories,
  onUpdateProduct,
  onUpdateRestaurant,
  isDemo,
  lang
}: InventoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'untracked'>('all');
  
  // State for specific inline quick adjustment modal/popover
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editAlertValue, setEditAlertValue] = useState<number>(5);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Statistics
  const totalProducts = products.length;
  const trackedProducts = products.filter(p => p.trackInventory).length;
  const outOfStockProducts = products.filter(p => p.trackInventory && (p.stockQuantity || 0) <= 0).length;
  const lowStockProducts = products.filter(p => p.trackInventory && (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.alertLowStock || 5)).length;

  const isAr = lang === 'ar';

  const t = {
    title: isAr ? 'إدارة المخزون والمستودع' : 'Inventory & Warehouse Management',
    autoLinkCardTitle: isAr ? 'الربط التلقائي للمخزون بالطلبات ⚡' : 'Auto Inventory Link with Orders ⚡',
    autoLinkCardDesc: isAr 
      ? 'عند تفعيل هذا الخيار، سيقوم النظام تلقائياً بخصم كميات الأصناف من المخزون بمجرد استقبال طلب جديد من الزبائن.' 
      : 'When enabled, the system will automatically deduct product quantities from the stock once a new order is placed by customers.',
    autoLinkToggleActive: isAr ? 'نظام الربط التلقائي نشط حالياً ✅' : 'Auto Linking System is Active ✅',
    autoLinkToggleInactive: isAr ? 'الربط التلقائي معطل (تعديل يدوي فقط) 🔒' : 'Auto Linking is Disabled (Manual updates only) 🔒',
    statsTotal: isAr ? 'إجمالي الأصناف' : 'Total Items',
    statsTracked: isAr ? 'أصناف تحت التتبع' : 'Tracked Items',
    statsLow: isAr ? 'منخفض المخزون ⚠️' : 'Low Stock ⚠️',
    statsOut: isAr ? 'نفذت من المخزون 🚨' : 'Out of Stock 🚨',
    searchPlaceholder: isAr ? 'بحث عن صنف...' : 'Search for an item...',
    filterCategory: isAr ? 'تصنيف القسم' : 'Category Filter',
    filterStatus: isAr ? 'حالة المخزون' : 'Stock Status',
    statusAll: isAr ? 'جميع الحالات' : 'All States',
    statusLowFilter: isAr ? 'مخزون منخفض' : 'Low Stock',
    statusOutFilter: isAr ? 'غير متوفر / نفذ' : 'Out of Stock',
    statusUntrackedFilter: isAr ? 'غير مفعّل تتبعه' : 'Untracked',
    colProduct: isAr ? 'الوجبة / الطبق' : 'Product',
    colCategory: isAr ? 'القسم' : 'Category',
    colTracking: isAr ? 'تتبع المخزون' : 'Track Stock',
    colQuantity: isAr ? 'الكمية المتوفرة' : 'Stock Qty',
    colAlert: isAr ? 'حد التنبيه' : 'Alert Limit',
    colStatus: isAr ? 'الحالة' : 'Status',
    colActions: isAr ? 'إجراءات سريعة' : 'Quick Actions',
    trackActive: isAr ? 'نشط' : 'Active',
    trackInactive: isAr ? 'معطل' : 'Disabled',
    statusInStock: isAr ? 'متوفر بكثرة' : 'In Stock',
    statusLowStock: isAr ? 'مخزون حرج' : 'Low Stock',
    statusOutOfStock: isAr ? 'غير متوفر' : 'Out of Stock',
    untracked: isAr ? 'غير متتبع' : 'Untracked',
    manualEditTitle: isAr ? 'تعديل المخزون للصنف' : 'Edit Product Stock',
    saveBtn: isAr ? 'حفظ التغييرات' : 'Save Changes',
    cancelBtn: isAr ? 'إلغاء' : 'Cancel',
    manualQuantity: isAr ? 'الكمية الحالية في الرفوف:' : 'Current Qty in Shelves:',
    alertThreshold: isAr ? 'حد التنبيه بالانخفاض:' : 'Low Stock Alert Threshold:',
    quickAdjustTip: isAr ? 'استخدم أزرار (+ / -) للتعديل السريع المباشر بمقدار واحد.' : 'Use (+ / -) buttons for quick inline adjustment by 1.',
  };

  const handleToggleAutoInventory = async () => {
    const nextVal = !restaurant.enableAutoInventory;
    await onUpdateRestaurant({ enableAutoInventory: nextVal });
  };

  const handleToggleProductTracking = async (productId: string, currentVal: boolean) => {
    await onUpdateProduct(productId, { 
      trackInventory: !currentVal,
      // Initialize with default values if empty
      stockQuantity: currentVal ? undefined : 20,
      alertLowStock: currentVal ? undefined : 5
    });
  };

  const handleQuickAdjust = async (productId: string, currentQty: number, delta: number) => {
    const nextQty = Math.max(0, currentQty + delta);
    await onUpdateProduct(productId, { stockQuantity: nextQty });
  };

  const openEditModal = (product: Product) => {
    setEditingStockProduct(product);
    setEditStockValue(product.stockQuantity !== undefined ? product.stockQuantity : 10);
    setEditAlertValue(product.alertLowStock !== undefined ? product.alertLowStock : 5);
  };

  const handleSaveModalStock = async () => {
    if (!editingStockProduct) return;
    setIsSavingEdit(true);
    try {
      await onUpdateProduct(editingStockProduct.id, {
        stockQuantity: Number(editStockValue),
        alertLowStock: Number(editAlertValue),
        trackInventory: true // Auto enable tracking if manually modified
      });
      setEditingStockProduct(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     (product.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Category
    const categoryMatch = selectedCategory === 'all' || product.categoryId === selectedCategory;

    // 3. Status
    let statusMatch = true;
    if (statusFilter === 'low') {
      statusMatch = !!product.trackInventory && (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= (product.alertLowStock || 5);
    } else if (statusFilter === 'out') {
      statusMatch = !!product.trackInventory && (product.stockQuantity || 0) <= 0;
    } else if (statusFilter === 'untracked') {
      statusMatch = !product.trackInventory;
    }

    return nameMatch && categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. AUTO LINKING TOGGLE CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <h4 className="text-md sm:text-lg font-black flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{t.autoLinkCardTitle}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.autoLinkCardDesc}
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={handleToggleAutoInventory}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-4 ${
                restaurant.enableAutoInventory 
                  ? 'bg-amber-500 ring-amber-500/20' 
                  : 'bg-slate-700 ring-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  restaurant.enableAutoInventory 
                    ? isAr ? '-translate-x-7' : 'translate-x-7' 
                    : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-black tracking-wide ${restaurant.enableAutoInventory ? 'text-amber-400' : 'text-slate-400'}`}>
              {restaurant.enableAutoInventory ? t.autoLinkToggleActive : t.autoLinkToggleInactive}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total products */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold">{t.statsTotal}</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalProducts}</span>
          </div>
        </div>

        {/* Tracked */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold">{t.statsTracked}</span>
            <span className="text-lg font-black text-blue-600 font-mono">{trackedProducts}</span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${lowStockProducts > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold">{t.statsLow}</span>
            <span className={`text-lg font-black font-mono ${lowStockProducts > 0 ? 'text-amber-500' : 'text-slate-500'}`}>{lowStockProducts}</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${outOfStockProducts > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold">{t.statsOut}</span>
            <span className={`text-lg font-black font-mono ${outOfStockProducts > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{outOfStockProducts}</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS CONTROLS */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search box */}
          <div className="relative w-full">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-50 focus:bg-white px-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-xs text-slate-800 ${isAr ? 'text-right' : 'text-left'}`}
              placeholder={t.searchPlaceholder}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none cursor-pointer focus:border-amber-500"
            >
              <option value="all">{isAr ? 'جميع الأقسام' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{isAr ? cat.name : (cat.nameEn || cat.name)}</option>
              ))}
            </select>
          </div>

          {/* Stock status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none cursor-pointer focus:border-amber-500"
            >
              <option value="all">{t.statusAll}</option>
              <option value="low">{t.statusLowFilter}</option>
              <option value="out">{t.statusOutFilter}</option>
              <option value="untracked">{t.statusUntrackedFilter}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. STOCK LISTINGS TABLE */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir={isAr ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-black text-slate-450 uppercase tracking-wider">
                <th className="py-4 px-5 text-right">{t.colProduct}</th>
                <th className="py-4 px-5 text-right">{t.colCategory}</th>
                <th className="py-4 px-5 text-center">{t.colTracking}</th>
                <th className="py-4 px-5 text-center">{t.colQuantity}</th>
                <th className="py-4 px-5 text-center">{t.colAlert}</th>
                <th className="py-4 px-5 text-center">{t.colStatus}</th>
                <th className="py-4 px-5 text-center">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    {isAr ? 'لم يتم العثور على وجبات مطابقة لفلاتر البحث.' : 'No products found matching the filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const cat = categories.find(c => c.id === prod.categoryId);
                  const isTracked = !!prod.trackInventory;
                  const qty = prod.stockQuantity || 0;
                  const limit = prod.alertLowStock || 5;

                  // Status determination
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                      {t.untracked}
                    </span>
                  );
                  if (isTracked) {
                    if (qty <= 0) {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black animate-pulse">
                          {t.statusOutOfStock} 🚨
                        </span>
                      );
                    } else if (qty <= limit) {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black">
                          {t.statusLowStock} ⚠️
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black">
                          {t.statusInStock} ✓
                        </span>
                      );
                    }
                  }

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition duration-150">
                      {/* Product details */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center gap-3">
                          <img 
                            src={prod.image} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-150 shrink-0" 
                            alt={prod.name}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{isAr ? prod.name : (prod.nameEn || prod.name)}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: {prod.id.slice(0, 10)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5 text-right text-slate-500">
                        {cat ? (isAr ? cat.name : (cat.nameEn || cat.name)) : '—'}
                      </td>

                      {/* Tracking Toggle Switch */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleProductTracking(prod.id, isTracked)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isTracked ? 'bg-amber-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                              isTracked 
                                ? isAr ? '-translate-x-5' : 'translate-x-5' 
                                : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-4 px-5 text-center font-mono text-sm font-black">
                        {isTracked ? (
                          <span className={qty <= 0 ? 'text-rose-600' : qty <= limit ? 'text-amber-500' : 'text-slate-900'}>
                            {qty}
                          </span>
                        ) : (
                          <span className="text-slate-350">—</span>
                        )}
                      </td>

                      {/* Alert Limit */}
                      <td className="py-4 px-5 text-center font-mono text-slate-500">
                        {isTracked ? limit : <span className="text-slate-350">—</span>}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        {statusBadge}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Quick Adjust Minus */}
                          <button
                            disabled={!isTracked || qty <= 0}
                            onClick={() => handleQuickAdjust(prod.id, qty, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                            title="تقليل المخزون بمقدار 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Adjust Plus */}
                          <button
                            disabled={!isTracked}
                            onClick={() => handleQuickAdjust(prod.id, qty, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                            title="زيادة المخزون بمقدار 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Manual Edit Button */}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 flex items-center justify-center transition cursor-pointer"
                            title="تعديل يدوي تفصيلي للكميات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MANUAL EDIT POPUP MODAL */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <span>{t.manualEditTitle}</span>
              </h4>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <img 
                  src={editingStockProduct.image} 
                  className="w-12 h-12 rounded-xl object-cover border" 
                  alt={editingStockProduct.name}
                />
                <div>
                  <h5 className="font-bold text-slate-950 text-xs">{isAr ? editingStockProduct.name : (editingStockProduct.nameEn || editingStockProduct.name)}</h5>
                  <span className="text-[10px] text-slate-400 block">{editingStockProduct.price} {restaurant.currency}</span>
                </div>
              </div>

              {/* Stock Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">{t.manualQuantity}</label>
                <input 
                  type="number" 
                  min={0}
                  value={editStockValue}
                  onChange={e => setEditStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-2.5 text-xs font-mono font-black text-slate-800 outline-none"
                />
              </div>

              {/* Alert Limit Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">{t.alertThreshold}</label>
                <input 
                  type="number" 
                  min={0}
                  value={editAlertValue}
                  onChange={e => setEditAlertValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl p-2.5 text-xs font-mono text-slate-500 outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                💡 {t.quickAdjustTip}
              </p>
            </div>

            {/* Footer buttons */}
            <div className="p-5 border-t border-slate-100 flex gap-2">
              <button
                disabled={isSavingEdit}
                onClick={handleSaveModalStock}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer transition text-center"
              >
                {isSavingEdit ? '...' : t.saveBtn}
              </button>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition text-center"
              >
                {t.cancelBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
