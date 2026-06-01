/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  motion 
} from 'motion/react';
import { 
  Menu as MenuIcon, 
  ChevronLeft, 
  QrCode, 
  Smartphone, 
  Share2, 
  Zap, 
  Settings, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Check, 
  Globe, 
  ChefHat, 
  BarChart2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_RESTAURANTS } from '../sampleData';

interface LandingPageProps {
  onNavigate: (page: string, restaurantSlug?: string) => void;
  onLogin: () => void;
  user: any;
}

export default function LandingPage({ onNavigate, onLogin, user }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurant: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API contact submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', restaurant: '', message: '' });
    }, 4000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden flex flex-col" dir="rtl">
      {/* Dynamic Header */}
      <nav id="header-nav" className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 p-2 rounded-xl text-white shadow-md shadow-amber-500/10">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">منيو كليك</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">SAS DIGITAL MENU</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-amber-600 transition-colors">المميزات</a>
          <a href="#demo" className="hover:text-amber-600 transition-colors">تطبيقات حية</a>
          <a href="#pricing" className="hover:text-amber-600 transition-colors">مجاني للأبد 🎁</a>
          <a href="#contact" className="hover:text-amber-600 transition-colors">اتصل بنا</a>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button 
              id="goto-dashboard-btn"
              onClick={() => onNavigate('dashboard')} 
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              لوحة التحكم
            </button>
          ) : (
            <button 
              id="login-landing-btn"
              onClick={onLogin} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 cursor-pointer"
            >
              دخول أصحاب المطاعم
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-white to-slate-50 flex-1">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center md:text-right"
          >
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-700 font-semibold mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              مستقبل قطاع الأغذية والمشروبات جاهز بين يديك
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              اجعل المنيو الخاص بمطعمك <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">ذكياً وتفاعلياً</span> عبر رمز الـ QR!
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
              نظام SaaS سحابي متكامل يتيح لك تصميم وإدارة قائمة المشروبات والمأكولات الخاصة بمطعمك بلحظة واحدة. تعديل فوري للأسعار، صور احترافية، تنظيم مبهر للأقسام، واستقبال مباشر للطلبات عبر واتساب دون عمولات أو وسيط.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <button
                id="get-started-hero"
                onClick={onLogin}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                اصنع منيو مطعمك الآن مجاناً 🚀
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 font-bold px-8 py-4 rounded-2xl transition text-center flex items-center justify-center gap-2"
              >
                مشاهدة منيو تجريبي
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 max-w-md mx-auto md:mx-0">
              <div>
                <b className="text-2xl font-black text-slate-900">0%</b>
                <p className="text-xs text-slate-500">عمولات ومصاريف مبيعات</p>
              </div>
              <div className="border-r border-slate-200 pr-4">
                <b className="text-2xl font-black text-slate-900">10x</b>
                <p className="text-xs text-slate-500">أسرع من المنيوهات الورقية</p>
              </div>
              <div className="border-r border-slate-200 pr-4">
                <b className="text-2xl font-black text-slate-900">100%</b>
                <p className="text-xs text-slate-500">تحديث لحظي وفوري للبيانات</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Simulated Device */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl -z-10" />

            {/* Smart Device Layout Mockup */}
            <div className="relative w-72 h-[540px] bg-slate-900 rounded-[40px] shadow-2xl p-3 border-4 border-slate-800 flex flex-col overflow-hidden">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full flex items-center justify-center gap-2 z-20">
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Live Mock Menu Frame Screensaver */}
              <div className="flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col relative text-[11px]">
                {/* Simulated Restaurant Header */}
                <div className="h-28 bg-slate-800 relative flex flex-col justify-end p-2 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt="mock"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-0.5 text-[8px] flex items-center gap-1">
                    🟢 متاح للطلب
                  </div>
                  <div className="z-10 flex items-center gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100" 
                      className="w-8 h-8 rounded-full border border-white/60 bg-white"
                      alt="mock logo"
                    />
                    <div>
                      <h4 className="font-bold text-xs">برجر بالاس الفاخر</h4>
                      <p className="text-[8px] text-slate-300">أول منيو رقمي ذكي بالكامل</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Subcategories Scroll */}
                <div className="bg-slate-100 p-1.5 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-slate-200">
                  <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 font-bold text-[8px]">🍔 برجر لحم</span>
                  <span className="bg-white text-slate-600 rounded-full px-2 py-0.5 text-[8px] border border-slate-200">🍟 أطباق جانبية</span>
                  <span className="bg-white text-slate-600 rounded-full px-2 py-0.5 text-[8px] border border-slate-200">🥤 مشروبات</span>
                </div>

                {/* Simulated Product Items */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-slate-50">
                  <div className="bg-white p-1.5 rounded-xl border border-slate-100 flex gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100" 
                      className="w-12 h-12 rounded-lg object-cover"
                      alt="burger"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <b className="text-slate-900 truncate max-w-[100px]">شيدر تربل تشيز</b>
                          <span className="text-amber-600 font-bold font-mono">185 EGP</span>
                        </div>
                        <p className="text-[8px] text-slate-400 line-clamp-1">لحم أنجوس مشوي على الفحم</p>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="bg-rose-50 text-rose-600 px-1 rounded text-[7px] font-bold">خصم 15%</span>
                        <div className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[8px] scale-90">إضافة للسلة +</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-1.5 rounded-xl border border-slate-100 flex gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=100&h=100" 
                      className="w-12 h-12 rounded-lg object-cover"
                      alt="burger stack"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <b className="text-slate-900 truncate max-w-[100px]">سموكي برجر باربكيو</b>
                          <span className="text-amber-600 font-bold font-mono">160 EGP</span>
                        </div>
                        <p className="text-[8px] text-slate-400 line-clamp-1">لحم مقدد مع الصوص المدخن اللذيذ</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <div className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[8px] scale-90">إضافة للسلة +</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Checkout Floater */}
                <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                    <span className="text-slate-600">طلب جاهز</span>
                  </div>
                  <div className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[9px]">
                    <Phone className="w-3 h-3 fill-white" />
                    إرسال للواتساب (185 EGP)
                  </div>
                </div>
              </div>

              {/* Scanning Overlay Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 p-4 rounded-2xl flex flex-col items-center gap-2 border border-amber-500/35 backdrop-blur-sm shadow-xl max-w-[180px] text-center z-10 pointer-events-none">
                <QrCode className="w-8 h-8 text-amber-400 animate-pulse" />
                <span className="text-[10px] text-slate-100 font-bold">مسح فوري بالـ QR</span>
                <span className="text-[8px] text-slate-400 leading-normal">جرب مسح الكود من كاميرا جوالك لتصفح منيو حي</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* SaaS Feature Cards */}
      <section id="features" className="py-20 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">أقوى حزمة برمجية لتأمين وإدارة منيو مطعمك</h3>
            <p className="text-slate-500 text-sm md:text-base leading-normal">
              لا داعي لطرد الزبائن بقائمتك الورقية القديمة الصامتة. مع تطبيق المنيو السحابي، ستحصل على مميزات لا حصر لها تضاعف مبيعاتك وتوفر مصاريف الطباعة اليومية المزعجة.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">توليد تلقائي للـ QR Code</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                يقوم النظام تلقائياً بتكوين وتوليد رمز QR فريد وذكي ومخصص لكل مطعم، بمجرد أن يقرأه العميل يفتح المنيو في أقل من ثانية.
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">تلقي الطلبات عبر واتساب</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                سلة مشتريات ذكية، حيث يختار العميل أطباقه المفضلة، ويكتب ملاحظاته، وبضغطة زر يُرسل الطلب مرتباً مبهراً إلى رقم واتساب مطعمك.
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">تحديث لحظي وفوري</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                أي تعديل يجريه مدير المطعم على اسم طبق، أو تفاصيل المكونات، أو إخفاء منيو السلعة لانتهاء المخزون، ينعكس فوراً وتلقائياً على العميل الحالي دون الحاجة لإعادة تحميل الصفحة.
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">تصميم وتجربة Mobile First</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                الواجهة البرمجية للمنيو مهيأة بعناية وبأحدث المقاييس الفنية لشاشات الهواتف بكافة أحجامها وتعمل بنفس خفة التطبيقات المثبتة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Area */}
      <section id="demo" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold font-mono">انقر لتجربة المنيو النهائي للعميل</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">تمنياتك في منيو مطعم تجريبي حقيقي</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              اختر أحد المطاعم النموذجية التالية لتجربة صفحة العميل التي سيراها الزوار عند مسح كود QR Code. يمكنك التصفح، تبديل الوضع الليلي (Dark Mode) وتعبئة السلة كتجربة حية!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SAMPLE_RESTAURANTS.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col md:flex-row"
              >
                {/* Image panel */}
                <div className="md:w-2/5 h-44 md:h-full relative">
                  <img 
                    src={restaurant.cover} 
                    className="w-full h-full object-cover" 
                    alt={restaurant.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 bg-emerald-605 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    منيو ذكي نشط ✅
                  </div>
                </div>

                {/* Brand description and entry */}
                <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={restaurant.logo} 
                        className="w-10 h-10 rounded-full border border-slate-200 bg-white" 
                        alt="logo"
                      />
                      <h4 className="text-lg font-black text-slate-900 leading-tight">{restaurant.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {restaurant.welcomeSubtitle}
                    </p>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                      <span>👁️ {restaurant.viewsCount} زيارة</span>
                      <span>•</span>
                      <span>💬 {restaurant.whatsappOrdersCount} طلب</span>
                    </div>

                    <button
                      id={`test-menu-${restaurant.slug}`}
                      onClick={() => onNavigate('menu', restaurant.slug)}
                      className="bg-slate-900 hover:bg-amber-500 hover:text-white text-white rounded-xl py-2 px-4 text-xs font-bold transition duration-300 flex items-center gap-1 cursor-pointer"
                    >
                      افتح المنيو 📱
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Pricing Plans -> Free Announcement */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-amber-500/5 to-amber-650/10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold font-mono">بدون اشتراكات وبدون عمولات 🎁</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">منيو كليك مجاني بالكامل للأبد!</h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              لقد قمنا بإلغاء كافة باقات الاشتراك وإتاحة نظام "منيو كليك" بالكامل وبصفة مجانية 100% لمساعدة أصحاب المطاعم، المقاهي، وعربات الطعام على التحول الرقمي وتسهيل الطلبات دون أي أعباء مالية.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-amber-200/60 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="text-amber-500">🏆</span>
                  باقة المميزات اللامحدودة (مفتوحة للجميع مجاناً)
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  استمتع بكامل الميزات والقدرات التي كانت مخصصة للاشتراكات الذهبية، بدون أي حدود على الإطلاق:
                </p>

                <ul className="grid grid-cols-1 gap-3">
                  {[
                    'منيو إلكتروني تفاعلي ذكي فائق السرعة والخفة',
                    'أقسام وتصنيفات وجبات لا محدودة تماماً',
                    'إضافة سلع غذائية ومشروبات بعدد غير محدود',
                    'تعديل فوري وسحب فريش لحظي لكافة الأسعار والصور',
                    'توليد رمز الاستجابة السريع QR Code بهوية مطعمك وعلامتك التجارية',
                    'تلقي طلبات السلة فوراّ وبالملاحظات عبر واتساب دون أي وسيط',
                    'تحديثات دورية وضمان حماية بيانات المنيو سحابياً'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-6">
                <div>
                  <span className="text-slate-400 text-xs font-bold font-mono line-through block">سابقاً 499 ج.م / شهرياً</span>
                  <span className="text-3xl sm:text-5xl font-black text-amber-600 font-mono block mt-1">0 ج.م</span>
                  <span className="text-emerald-600 text-xs font-bold block mt-1">مجاني بالكامل للأبد 🎉</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal max-w-[240px]">
                  لا نطلب منك إضافة أي بيانات بطاقة ائتمانية. سجل حسابك الآن وابدأ في عيش تجربة طهي رقمية.
                </p>

                <button
                  onClick={onLogin}
                  className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-black py-4 px-6 rounded-2xl text-xs sm:text-sm transition duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  ابدأ بتصميم منيو مطعمك مجاناً الآن 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription SaaS Contact Us */}
      <section id="contact" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            {/* Context information */}
            <div className="space-y-6">
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">احصل على استشارة مجانية</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">هل تحتاج لباقة مخصصة أو لديك أسئلة؟</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                فريق منيو كليك في خدمتك دائماً لمساعدة مطعمك في التحول الرقمي الكامل. يسعدنا الإجابة عن مخاوفك ومساعدتك على بناء هوية رقمية مذهلة لعملائك لزيادة سرعة وسلاسة طلب الطعام.
              </p>

              <hr className="border-slate-200" />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">تواصل عبر الواتساب</h5>
                    <p className="text-sm font-bold text-slate-800" dir="ltr">+20 100 000 0000</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">البريد الإلكتروني للشركاء</h5>
                    <p className="text-sm font-bold text-slate-800">support@menuclick.saas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">المقر الرئيسي</h5>
                    <p className="text-sm font-bold text-slate-800">القرية الذكية، الجيزة، مصر</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct message submit form */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg relative overflow-hidden">
              <h4 className="text-lg font-black text-slate-900 mb-6">أرسل استفسارك الأن</h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم ثلاثي أو اسم المدير المسؤول</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs w-full"
                    placeholder="رائد أعمال أو صاحب مطعم"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني المهني</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs w-full"
                    placeholder="name@restaurant.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم المطعم / المقهى الحالي</label>
                  <input 
                    type="text" 
                    value={formData.restaurant}
                    onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs w-full"
                    placeholder="مثال: منيو كافيه، فود كورت"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الرسالة أو باقة الاهتمام</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs w-full resize-none"
                    placeholder="يرجى كتابة رقم هاتفك أو الاستفسار بالتفصيل لنتمكن من مساعدتك..."
                  />
                </div>

                <button
                  type="submit"
                  id="submit-contact"
                  className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition duration-200 flex items-center justify-center gap-2"
                >
                  إرسال الرسالة ودعوة الاستشارة
                </button>
              </form>

              {isSubmitted && (
                <div id="contact-success" className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-slate-950">شكراً لتواصلكم معنا!</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs leading-normal">
                    لقد استقبلنا استفسارك بنجاح. سيقوم أحد مسؤولي قطاع المطاعم بالاتصال بك هاتفياً وعلى الواتساب لتقديم أفضل الحلول والعروض المناسبة لك.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-amber-500 p-2 rounded-xl">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">منيو كليك</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              نظام السحابة SaaS الرائد لتصميم وإخراج منيو المطاعم الإلكتروني الذكي لعملاء الشرق الأوسط ومصر والخليج العربي.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">روابط سريعة</h5>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-amber-500 transition">الميزات</a></li>
              <li><a href="#demo" className="hover:text-amber-500 transition">تجربة منيو</a></li>
              <li><a href="#pricing" className="hover:text-amber-500 transition">سعر الاشتراك</a></li>
              <li><a href="#contact" className="hover:text-amber-500 transition">دعم فني</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">أشهر المأكولات</h5>
            <ul className="space-y-2.5">
              <li><span className="hover:text-amber-500 cursor-pointer">🍔 منيو البرجر والفاست فود</span></li>
              <li><span className="hover:text-amber-500 cursor-pointer">🌯 الشاورما والوجبات الشامية</span></li>
              <li><span className="hover:text-amber-500 cursor-pointer">🍕 البيتزا والمعجنات الإيطالية</span></li>
              <li><span className="hover:text-amber-500 cursor-pointer">🥤 كافيهات ومشروبات ساخنة وملونة</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">اشترك في الأخبار</h5>
            <p className="text-[11px] text-slate-400 mb-3">احصل على دورات تدريبية ونصائح لزيادة حجم مبيعات مطعمك بنسبة 35%.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="bg-slate-800 border border-slate-700 outline-none text-white rounded-lg p-2 text-[11px] flex-1"
              />
              <button className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 font-semibold font-bold cursor-pointer">انضم</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px]">
          <span>حقوق النشر والملكية © 2026 منيو كليك SaaS. جميع الحقوق محفوظة للفريق البرمجي.</span>
          <div className="flex gap-4 mt-4 sm:mt-0 text-slate-400 font-bold">
            <span className="hover:text-white cursor-pointer">سياسة الخصوصية</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">شروط الاستخدام والخدمة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
