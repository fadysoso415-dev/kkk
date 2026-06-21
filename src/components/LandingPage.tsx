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
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

const translations = {
  ar: {
    features: "المميزات",
    live_apps: "تطبيقات حية",
    free_forever: "مجاني للأبد 🎁",
    contact_us: "اتصل بنا",
    dashboard: "لوحة التحكم",
    restaurant_login: "دخول أصحاب المطاعم",
    subtitle: "مستقبل قطاع الأغذية والمشروبات جاهز بين يديك",
    hero_title_part1: "اجعل المنيو الخاص بمطعمك ",
    hero_title_part2: "ذكياً وتفاعلياً",
    hero_title_part3: " عبر رمز الـ QR!",
    hero_desc: "نظام SaaS سحابي متكامل يتيح لك تصميم وإدارة قائمة المشروبات والمأكولات الخاصة بمطعمك بلحظة واحدة. تعديل فوري للأسعار، صور احترافية، تنظيم مبهر للأقسام، واستقبال مباشر للطلبات عبر واتساب دون عمولات أو وسيط.",
    cta_start: "اصنع منيو مطعمك الآن مجاناً 🚀",
    cta_demo: "مشاهدة منيو تجريبي",
    stat_comm_val: "0%",
    stat_comm_desc: "عمولات ومصاريف مبيعات",
    stat_speed_val: "10x",
    stat_speed_desc: "أسرع من المنيوهات الورقية",
    stat_realtime_val: "100%",
    stat_realtime_desc: "تحديث لحظي وفوري للبيانات",
    integrated_saas_platform: "منصة سحابية متكاملة للمطاعم والكافيهات الحديثة",
    features_section_title: "خدمات تكنولوجية ترفع مبيعاتك وتوفر مصاريف الطباعة",
    features_desc: "أدوات مخصصة صُممت بعناية لتناسب كافيهات ومطاعم الشرق الأوسط ومصر والخليج للتفاعل المباشر مع الزبائن وتوفير تكاليف التشغيل اليومية.",
    features_list: {
      qr: {
        title: "كود QR مخصص ومتين",
        desc: "توليد كود QR عالي الوضوح خاص بمطعمك وطاولاتك لفتحه بمسح كاميرا الهاتف."
      },
      instant: {
        title: "تحديث فوري ولحظي",
        desc: "تغيير سعر طبق، إخفاء صنف انتهى من المطبخ، أو إضافة خصم في أقل من ثانية."
      },
      interactive: {
        title: "منيو تفاعلي عالي الجمال",
        desc: "صور دقيقة، تصنيفات منسقة بسلاسة، ومناسب لجميع أحجام شاشات الموبايل والتابلت."
      },
      whatsapp: {
        title: "تلقي الطلبات عبر واتساب",
        desc: "سلة مشتريات ذكية، حيث يختار العميل أطباقه المفضلة ويرسلها على واتساب مطعمك بضغطة زر."
      },
      stats: {
        title: "إحصائيات متكاملة للزيارات",
        desc: "متابعة عدد نقرات الزبائن، مشاهدات الأطباق الأكثر مبيعاً، والتحليلات لزيادة الأرباح."
      },
      ai: {
        title: "تأسيس المنيو بالذكاء الاصطناعي",
        desc: "اكتب اسم مطعمك ونوعه وسيقوم الذكاء الاصطناعي بتوليد أقسام ووجبات كاملة بالأسعار والصور!"
      }
    },
    demos_title: "نماذج حية ومطاعم شريكة",
    demos_desc: "تصفح منيو المطاعم والكافيهات التي تثق بـ 'منيو كليك' وشاهد كيف تبدو لزبائنك على الطبيعة.",
    pricing_badge: "أسعار اشتراكات منيو كليك ⭐",
    pricing_title: "بساطة في التسعير.. مجاني للأبد وميزات عملاقة للبريميوم",
    pricing_desc: "ابدأ مجاناً الآن وصمم منيو مطعمك. لا توجد أي بطاقة ائتمانية مطلوبة للتجربة والاستخدام الأساسي.",
    plan_free: {
      tag: "الخيار الافتراضي للتجربة 🌱",
      title: "الباقة المجانية للأبد",
      desc: "مثالية للمطاعم الناشئة والكافيهات الصغيرة لتجربة البداية الرقمية.",
      features: [
        "عرض منيو إلكتروني ذكي",
        "رمز QR وتنزيله بأكثر من صيغة",
        "تعديل وتحديث لحظي غير محدود",
        "حتى 3 أقسام رئيسية و 15 وجبة",
        "استضافة سحابية سريعة ومستقرة للأبد"
      ],
      price: "0 EGP",
      period: "/ شهرياً للأبد",
      btn: "اشترك مجاناً الآن 🌱"
    },
    plan_premium: {
      tag: "الخيار الأكثر مبيعاً ونمواً 🔥",
      title: "باقة البريميوم المطلقة",
      desc: "تحتوي كل الأدوات والتفاصيل التي يحتاجها مطعم محترف لزيادة أرباحه واستقبال الطلبات.",
      features: [
        "كل ميزات الباقة المجانية بالإضافة إلى:",
        "أقسام ووجبات غير محدودة نهائياً",
        "تلقي طلبات السلة فوراّ وبالملاحظات عبر واتساب دون أي وسيط",
        "تحليلات وإحصائيات الزيارات ومشاهدات الأطباق التفصيلية",
        "توليد وتأسيس المنيو بالذكاء الاصطناعي لحظياً مع الصور",
        "رفع شعار المطعم وغلاف مخصص بهوية براندك المميزة",
        "تعديل الألوان وسمات المنيو لتناسب هويتك",
        "دعم فني خاص على مدار الساعة"
      ],
      price: "185 EGP",
      period: "/ شهرياً بدلاً من 300",
      btn: "ترقية فوريّة للبريميوم 🔥"
    },
    contact_title: "اترك استفسارك أو اطلب استشارة مجانية",
    contact_desc: "سواء كنت بحاجة إلى تخصيص أكبر، نظام لوحة للمطابخ، أو استفسار بخصوص الترقية وميزات السحابة.",
    contact_form: {
      name: "اسمك الكريم 👤",
      name_place: "اكتب اسمك الثنائي",
      email: "البريد الإلكتروني أو رقم الواتساب 💬",
      email_place: "مثال: customer@gmail.com أو +2010...",
      rest: "اسم مطعمك الحالي أو المستقبلي (اختياري) 🏢",
      rest_place: "مطعم البرنس، مقهى رويال...",
      msg: "رسالتك أو تفاصيل استفسارك ✉️",
      msg_place: "اكتب هنا كل ما ترغب في الاستفسار عنه...",
      submit: "إرسال الاستفسار الآن 🚀",
      success: "تم الإرسال بنجاح! 🎉",
      success_desc: "لقد استقبلنا استفسارك بنجاح. سيقوم أحد مسؤولي قطاع المطاعم بالاتصال بك هاتفياً وعلى الواتساب لتقديم أفضل الحلول والعروض المناسبة لك."
    },
    contact_whatsapp_box: {
      title: "تواصل عبر الواتساب",
      desc: "دعم فني وتبيان فوري"
    },
    contact_email_box: {
      title: "البريد الإلكتروني المباشر",
      desc: "فريق المبيعات والشركات"
    },
    contact_location_box: {
      title: "مقر الإدارة والعمليات",
      desc: "القاهرة الجديدة، مصر"
    },
    footer_desc: "نظام السحابة SaaS الرائد لتصميم وإخراج منيو المطاعم الإلكتروني الذكي لعملاء الشرق الأوسط ومصر والخليج العربي.",
    footer_col_1: {
      title: "عناوين تهمك",
      links: ["المميزات الأساسية", "نماذج تشغيلية", "أسعار الاشتراكات", "طرق الدفع المتوفرة"]
    },
    footer_col_2: {
      title: "روابط سريعة",
      links: ["دخول الشركاء", "بناء منيو بالذكاء الاصطناعي", "الشروط والأحكام", "سياسة استرجاع الأموال"]
    },
    footer_col_3: {
      title: "الدعم والمساعدة",
      links: ["دعم فني", "مركز المساعدة", "01210651168"]
    },
    copyright: "حقوق النشر والملكية © 2026 منيو كليك SaaS. جميع الحقوق محفوظة للفريق البرمجي.",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام والخدمة"
  },
  en: {
    features: "Features",
    live_apps: "Live Demos",
    free_forever: "Free Forever 🎁",
    contact_us: "Contact Us",
    dashboard: "Dashboard",
    restaurant_login: "Restaurant Login",
    subtitle: "The future of the food & beverage sector is in your hands",
    hero_title_part1: "Make your restaurant menu ",
    hero_title_part2: "Smart & Interactive",
    hero_title_part3: " via QR code!",
    hero_desc: "A fully integrated cloud SaaS system that allows you to design and manage your restaurant menu in an instant. Instant price updates, professional images, stunning section organization, and direct order reception via WhatsApp without commission or middlemen.",
    cta_start: "Create Your Menu Now For Free 🚀",
    cta_demo: "View Demo Menu",
    stat_comm_val: "0%",
    stat_comm_desc: "Sales Commissions & Fees",
    stat_speed_val: "10x",
    stat_speed_desc: "Faster than Paper Menus",
    stat_realtime_val: "100%",
    stat_realtime_desc: "Instant & Real-Time Updates",
    integrated_saas_platform: "Integrated Cloud Platform for Modern Restaurants & Cafes",
    features_section_title: "Tech Features that Increase Sales & Save Printing Costs",
    features_desc: "Specialized tools carefully designed for Middle East, Egypt, and Gulf cafes & restaurants to interact directly with customers and save daily operating costs.",
    features_list: {
      qr: {
        title: "Custom & Resilient QR Code",
        desc: "Generate high-definition QR codes for your restaurant and tables to be scanned with any phone camera."
      },
      instant: {
        title: "Instant & Real-Time Updates",
        desc: "Change dish prices, hide out-of-stock items, or add discounts in less than a second."
      },
      interactive: {
        title: "Beautiful Interactive Menu",
        desc: "Accurate photos, cleanly organized categories, perfect for all mobile and tablet screen sizes."
      },
      whatsapp: {
        title: "Orders via WhatsApp",
        desc: "A smart shopping cart where customers select their favorite dishes and send them to your WhatsApp in one click."
      },
      stats: {
        title: "Integrated Visitor Analytics",
        desc: "Track customer clicks, most-viewed best sellers, and analytics to increase your revenue."
      },
      ai: {
        title: "AI-Powered Menu Generation",
        desc: "Just write your restaurant type and name, and AI will instantly generate complete sections and dishes with prices and images!"
      }
    },
    demos_title: "Live Demos & Partner Restaurants",
    demos_desc: "Browse menus of restaurants and cafes that trust 'Menu Click' and see how it looks to your guest live.",
    pricing_badge: "Menu Click Subscriptions ⭐",
    pricing_title: "Simple Pricing.. Free Forever & Premium Superpowers",
    pricing_desc: "Get started for free today and design your menu. No credit card required for trial and basic usage.",
    plan_free: {
      tag: "Default option to get started 🌱",
      title: "Free Forever Plan",
      desc: "Perfect for startups and small cafes to try out the digital transition.",
      features: [
        "Smart interactive digital menu menu",
        "HD QR Code downloadable in multiple formats",
        "Unlimited instant changes and updates",
        "Up to 3 main categories and 15 dishes",
        "Fast and stable cloud hosting forever"
      ],
      price: "0 EGP",
      period: "/ month forever",
      btn: "Sign Up For Free 🌱"
    },
    plan_premium: {
      tag: "Most popular choice for growth 🔥",
      title: "Ultimate Premium Plan",
      desc: "Contains all tools and features a professional establishment needs to optimize revenue and receive orders.",
      features: [
        "All Free Plan features plus:",
        "Completely unlimited categories and dishes",
        "Instant WhatsApp checkout with notes",
        "Detailed visitor analytics & dish view counters",
        "Instant AI-powered menu setup with images",
        "Upload logo & custom wide cover brand headers",
        "Customize colors & menu themes to fit your brand",
        "Dedicated 24/7 prioritized support channel"
      ],
      price: "185 EGP",
      period: "/ month instead of 300",
      btn: "Upgrade to Premium Now 🔥"
    },
    contact_title: "Send an inquiry or get a free consultation",
    contact_desc: "Whether you need larger customization, kitchen screens, or have questions about upgrading and cloud features.",
    contact_form: {
      name: "Your Name 👤",
      name_place: "Enter your first and last name",
      email: "Email or WhatsApp number 💬",
      email_place: "e.g., customer@gmail.com or +2010...",
      rest: "Your restaurant name (optional) 🏢",
      rest_place: "Prince Restaurant, Royal Cafe...",
      msg: "Your message or request details ✉️",
      msg_place: "Write anything you'd like to ask us about...",
      submit: "Submit Inquiry Now 🚀",
      success: "Submitted successfully! 🎉",
      success_desc: "We have received your inquiry. One of our specialists will contact you by phone or WhatsApp to provide the best solutions."
    },
    contact_whatsapp_box: {
      title: "Chat via WhatsApp",
      desc: "Instant help and answers"
    },
    contact_email_box: {
      title: "Direct Email Address",
      desc: "For sales and partnerships"
    },
    contact_location_box: {
      title: "HQ & Operations",
      desc: "New Cairo, Egypt"
    },
    footer_desc: "The leading SaaS cloud solution for designing and publishing interactive smart menus for hospitality brands in Egypt, GCC & Middle East.",
    footer_col_1: {
      title: "Explore",
      links: ["Core Features", "Operational Demos", "Subscriptions", "Payment Methods"]
    },
    footer_col_2: {
      title: "Quick Links",
      links: ["Partner Portal", "Build menu with AI", "Terms & Conditions", "Refund Policy"]
    },
    footer_col_3: {
      title: "Help & Support",
      links: ["Technical Support", "Help Center", "01210651168"]
    },
    copyright: "Copyright & Ownership © 2026 Menu Click SaaS. All rights reserved by the Dev Team.",
    privacy: "Privacy Policy",
    terms: "Terms of Service"
  }
};

export default function LandingPage({ onNavigate, onLogin, user, lang, onToggleLang }: LandingPageProps) {
  const t = translations[lang];

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
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Dynamic Header */}
      <nav id="header-nav" className={`sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-7xl mx-auto w-full`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 p-2 rounded-xl text-white shadow-md shadow-amber-500/10">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">{lang === 'ar' ? 'منيو كليك' : 'Menu Click'}</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">SAAS DIGITAL MENU</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-amber-600 transition-colors">{t.features}</a>
          <a href="#demo" className="hover:text-amber-600 transition-colors">{t.live_apps}</a>
          <a href="#pricing" className="hover:text-amber-600 transition-colors">{t.free_forever}</a>
          <a href="#contact" className="hover:text-amber-600 transition-colors">{t.contact_us}</a>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Language Toggle Switcher */}
          <button
            onClick={onToggleLang}
            className="bg-slate-100 hover:bg-slate-200 text-slate-850 py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-bold text-xs border border-slate-200/60"
            title={lang === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-sans">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {user ? (
            <button 
              id="goto-dashboard-btn"
              onClick={() => onNavigate('dashboard')} 
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>
          ) : (
            <button 
              id="login-landing-btn"
              onClick={onLogin} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 cursor-pointer"
            >
              {t.restaurant_login}
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-white to-slate-50 flex-1">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`space-y-6 text-center ${lang === 'ar' ? 'md:text-right' : 'md:text-left'}`}
          >
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-700 font-semibold mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              {t.subtitle}
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              {t.hero_title_part1}<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">{t.hero_title_part2}</span>{t.hero_title_part3}
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
              {t.hero_desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <button
                id="get-started-hero"
                onClick={onLogin}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                {t.cta_start}
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 font-bold px-8 py-4 rounded-2xl transition text-center flex items-center justify-center gap-2"
              >
                {t.cta_demo}
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 max-w-md mx-auto md:mx-0">
              <div>
                <b className="text-2xl font-black text-slate-900">{t.stat_comm_val}</b>
                <p className="text-xs text-slate-500">{t.stat_comm_desc}</p>
              </div>
              <div className="border-r border-slate-200 pr-4">
                <b className="text-2xl font-black text-slate-900">{t.stat_speed_val}</b>
                <p className="text-xs text-slate-500">{t.stat_speed_desc}</p>
              </div>
              <div className="border-r border-slate-200 pr-4">
                <b className="text-2xl font-black text-slate-900">{t.stat_realtime_val}</b>
                <p className="text-xs text-slate-500">{t.stat_realtime_desc}</p>
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
              <div className="flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col relative text-[11px]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {/* Simulated Restaurant Header */}
                <div className="h-28 bg-slate-800 relative flex flex-col justify-end p-2 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt="mock"
                  />
                  <div className={`absolute top-2 ${lang === 'ar' ? 'left-2' : 'right-2'} bg-black/60 rounded-full px-2 py-0.5 text-[8px] flex items-center gap-1`}>
                    🔴 {lang === 'ar' ? 'متاح للطلب' : 'Open for orders'}
                  </div>
                  <div className="z-10 flex items-center gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100" 
                      className="w-8 h-8 rounded-full border border-white/60 bg-white"
                      alt="mock logo"
                    />
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h4 className="font-bold text-xs">{lang === 'ar' ? 'برجر بالاس الفاخر' : 'Burger Palace Premium'}</h4>
                      <p className="text-[8px] text-slate-300">{lang === 'ar' ? 'أول منيو رقمي ذكي بالكامل' : 'Your first intelligent menu'}</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Subcategories Scroll */}
                <div className="bg-slate-100 p-1.5 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-slate-200">
                  <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 font-bold text-[8px]">{lang === 'ar' ? '🍔 برجر لحم' : '🍔 Beef Burger'}</span>
                  <span className="bg-white text-slate-600 rounded-full px-2 py-0.5 text-[8px] border border-slate-200">{lang === 'ar' ? '🍟 أطباق جانبية' : '🍟 Side Dishes'}</span>
                  <span className="bg-white text-slate-600 rounded-full px-2 py-0.5 text-[8px] border border-slate-200">{lang === 'ar' ? '🥤 مشروبات' : '🥤 Beverages'}</span>
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
                        <div className="flex justify-between items-center gap-1">
                          <b className="text-slate-900 truncate max-w-[100px]">{lang === 'ar' ? 'شيدر تربل تشيز' : 'Triple Cheddar'}</b>
                          <span className="text-amber-600 font-bold font-mono">185 EGP</span>
                        </div>
                        <p className={`text-[8px] text-slate-400 line-clamp-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'لحم أنجوس مشوي على الفحم' : 'Flame grilled Angus beef'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="bg-rose-50 text-rose-600 px-1 rounded text-[7px] font-bold">{lang === 'ar' ? 'خصم 15%' : '15% Off'}</span>
                        <div className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[8px] scale-90">{lang === 'ar' ? 'إضافة للسلة +' : 'Add Item +'}</div>
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
                        <div className="flex justify-between items-center gap-1">
                          <b className="text-slate-900 truncate max-w-[100px]">{lang === 'ar' ? 'سموكي برجر باربكيو' : 'Smoky BBQ Burger'}</b>
                          <span className="text-amber-600 font-bold font-mono">160 EGP</span>
                        </div>
                        <p className={`text-[8px] text-slate-400 line-clamp-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'لحم مقدد مع الصوص المدخن اللذيذ' : 'Smoked bacon with rich BBQ sauce'}</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <div className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[8px] scale-90">{lang === 'ar' ? 'إضافة للسلة +' : 'Add Item +'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Checkout Floater */}
                <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                    <span className="text-slate-600">{lang === 'ar' ? 'طلب جاهز' : 'Ready order'}</span>
                  </div>
                  <div className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[9px] truncate">
                    <Phone className="w-3 h-3 fill-white shrink-0" />
                    <span>{lang === 'ar' ? 'إرسال للواتساب (185 EGP)' : 'WhatsApp Checkout'}</span>
                  </div>
                </div>
              </div>

              {/* Scanning Overlay Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 p-4 rounded-2xl flex flex-col items-center gap-2 border border-amber-500/35 backdrop-blur-sm shadow-xl max-w-[180px] text-center z-10 pointer-events-none">
                <QrCode className="w-8 h-8 text-amber-400" />
                <span className="text-[10px] text-slate-100 font-bold">{lang === 'ar' ? 'مسح فوري بالـ QR' : 'Scan using QR'}</span>
                <span className="text-[8px] text-slate-400 leading-normal">{lang === 'ar' ? 'جرب مسح الكود من كاميرا جوالك لتصفح منيو حي' : 'Scan from your phone camera to browse lives'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* SaaS Feature Cards */}
      <section id="features" className="py-20 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{t.features_section_title}</h3>
            <p className="text-slate-500 text-sm md:text-base leading-normal">
              {t.features_desc}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t.features_list.qr.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features_list.qr.desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t.features_list.whatsapp.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features_list.whatsapp.desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t.features_list.instant.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features_list.instant.desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 hover:bg-white border hover:border-amber-200 hover:shadow-xl rounded-2xl transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t.features_list.interactive.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features_list.interactive.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Area */}
      <section id="demo" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
              {lang === 'ar' ? 'انقر لتجربة المنيو النهائي للعميل' : 'Click to experience the final user menu'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{t.demos_title}</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              {t.demos_desc}
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
                    alt={lang === 'en' ? (restaurant.nameEn || restaurant.name) : restaurant.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    {lang === 'ar' ? 'منيو ذكي نشط ✅' : 'Active smart menu ✅'}
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
                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        {lang === 'en' ? (restaurant.nameEn || restaurant.name) : restaurant.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {lang === 'en' ? (restaurant.welcomeSubtitleEn || restaurant.welcomeSubtitle) : restaurant.welcomeSubtitle}
                    </p>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-[11px] flex items-center gap-1 font-mono font-sans">
                      <span>👁️ {restaurant.viewsCount} {lang === 'ar' ? 'زيارة' : 'views'}</span>
                      <span>•</span>
                      <span>💬 {restaurant.whatsappOrdersCount} {lang === 'ar' ? 'طلب' : 'orders'}</span>
                    </div>

                    <button
                      id={`test-menu-${restaurant.slug}`}
                      onClick={() => onNavigate('menu', restaurant.slug)}
                      className="bg-slate-900 hover:bg-amber-500 hover:text-white text-white rounded-xl py-2 px-4 text-xs font-bold transition duration-300 flex items-center gap-1 cursor-pointer"
                    >
                      {lang === 'ar' ? 'افتح المنيو 📱' : 'View Menu 📱'}
                      <ChevronLeft className={`w-3.5 h-3.5 ${lang === 'en' ? 'rotate-180' : ''}`} />
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
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
              {lang === 'ar' ? 'بدون اشتراكات وبدون عمولات 🎁' : 'No subscriptions, no commissions 🎁'}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
              {lang === 'ar' ? 'منيو كليك مجاني بالكامل للأبد!' : 'Menu Click is 100% Free Forever!'}
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {lang === 'ar' 
                ? 'لقد قمنا بإلغاء كافة باقات الاشتراك وإتاحة نظام "منيو كليك" بالكامل وبصفة مجانية 100% لمساعدة أصحاب المطاعم، المقاهي، وعربات الطعام على التحول الرقمي وتسهيل الطلبات دون أي أعباء مالية.'
                : 'We have completely removed all paid tiers. Menu Click SaaS is active 100% free for all restaurant and cafe owners to design menus and accept direct orders on WhatsApp without financial friction.'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-amber-200/60 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="text-amber-500">🏆</span>
                  {lang === 'ar' ? 'باقة المميزات اللامحدودة (مفتوحة للجميع مجاناً)' : 'Unlimited Features Pack (Active Free for Everyone)'}
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {lang === 'ar' ? 'استمتع بكامل الميزات والقدرات التي كانت مخصصة للاشتراكات الذهبية، بدون أي حدود على الإطلاق:' : 'Enjoy full powerhouse capacities without limits or hidden charges:'}
                </p>

                <ul className="grid grid-cols-1 gap-3">
                  {(lang === 'ar' ? [
                    'منيو إلكتروني تفاعلي ذكي فائق السرعة والخفة',
                    'أقسام وتصنيفات وجبات لا محدودة تماماً',
                    'إضافة سلع غذائية ومشروبات بعدد غير محدود',
                    'تعديل فوري وسحب فريش لحظي لكافة الأسعار والصور',
                    'توليد رمز الاستجابة السريع QR Code بهوية مطعمك وعلامتك التجارية',
                    'تلقي طلبات السلة فوراّ وبالملاحظات عبر واتساب دون أي وسيط',
                    'تحديثات دورية وضمان حماية بيانات المنيو سحابياً'
                  ] : [
                    'Super responsive smart digital beautiful menu',
                    '100% unlimited main categories and sections',
                    'Unlimited food menu items and beverages list',
                    'Instant real-time sync for images, out-of-stocks and pricing',
                    'Generate stunning QR Code with custom branding vectors',
                    'Direct cart checkout on your WhatsApp with guest table notes',
                    'Secured stable cloud hosting and routine updates'
                  ]).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-6">
                <div>
                  <span className="text-slate-400 text-xs font-bold font-mono line-through block">
                    {lang === 'ar' ? 'سابقاً 499 ج.م / شهرياً' : 'Previously 499 EGP / month'}
                  </span>
                  <span className="text-3xl sm:text-5xl font-black text-amber-600 font-mono block mt-1">
                    {lang === 'ar' ? '0 ج.م' : '0 EGP'}
                  </span>
                  <span className="text-emerald-600 text-xs font-bold block mt-1">
                    {lang === 'ar' ? 'مجاني بالكامل للأبد 🎉' : '100% Free Forever 🎉'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal max-w-[240px]">
                  {lang === 'ar' 
                    ? 'لا نطلب منك إضافة أي بيانات بطاقة ائتمانية. سجل حسابك الآن وابدأ في عيش تجربة طهي رقمية.' 
                    : 'No credit card needed. Sign up and experience our instant smart digital setup.'}
                </p>

                <button
                  onClick={onLogin}
                  className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-black py-4 px-6 rounded-2xl text-xs sm:text-sm transition duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {lang === 'ar' ? 'ابدأ بتصميم منيو مطعمك مجاناً الآن 🚀' : 'Start Designing Your Menu For Free 🚀'}
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
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">
                {lang === 'ar' ? 'احصل على استشارة مجانية' : 'Get Free Consultation'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {lang === 'ar' ? 'هل تحتاج لمساعدة أو لديك أسئلة؟' : 'Need help or have questions?'}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {lang === 'ar' 
                  ? 'فريق منيو كليك في خدمتك دائماً لمساعدة مطعمك في التحول الرقمي الكامل. يسعدنا الإجابة عن مخاوفك ومساعدتك على بناء هوية رقمية مذهلة لعملائك لزيادة سرعة وسلاسة طلب الطعام.'
                  : 'The Menu Click team is always at your service to help your restaurant transform digitally. We answer your inquiries and guide you to establish a stunning digital identity for your guests to streamline ordering.'}
              </p>

              <hr className="border-slate-200" />

              <div className="space-y-4">
                <a href="https://wa.me/201210651168" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:opacity-85 transition cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">{t.contact_whatsapp_box.title}</h5>
                    <p className="text-sm font-bold text-slate-800" dir="ltr">01210651168</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">{t.contact_email_box.title}</h5>
                    <p className="text-sm font-bold text-slate-800">support@menuclick.saas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 font-semibold uppercase">{t.contact_location_box.title}</h5>
                    <p className="text-sm font-bold text-slate-800">
                      {lang === 'ar' ? 'القرية الذكية، الجيزة، مصر' : 'Smart Village, Giza, Egypt'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct message submit form */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg relative overflow-hidden">
              <h4 className="text-lg font-black text-slate-900 mb-6">{lang === 'ar' ? 'أرسل استفسارك الأن' : 'Send us your message'}</h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.contact_form.name}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs"
                    placeholder={t.contact_form.name_place}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.contact_form.email}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs"
                    placeholder={t.contact_form.email_place}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.contact_form.rest}</label>
                  <input 
                    type="text" 
                    value={formData.restaurant}
                    onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs"
                    placeholder={t.contact_form.rest_place}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.contact_form.msg}</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none rounded-xl p-3 text-xs resize-none"
                    placeholder={t.contact_form.msg_place}
                  />
                </div>

                <button
                  type="submit"
                  id="submit-contact"
                  className="w-full bg-slate-900 hover:bg-amber-500 hover:text-white text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition duration-200 flex items-center justify-center gap-2"
                >
                  {t.contact_form.submit}
                </button>
              </form>

              {isSubmitted && (
                <div id="contact-success" className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-slate-950">{t.contact_form.success}</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs leading-normal">
                    {t.contact_form.success_desc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-right">
          <div className="space-y-4">
            <div className={`flex items-center gap-3 text-white ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="bg-amber-500 p-2 rounded-xl">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">{lang === 'ar' ? 'منيو كليك' : 'Menu Click'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t.footer_desc}
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">{t.footer_col_1.title}</h5>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-amber-500 transition">{lang === 'ar' ? 'الميزات والخواص' : 'Core Features'}</a></li>
              <li><a href="#demo" className="hover:text-amber-500 transition">{lang === 'ar' ? 'أمثلة مطاعم' : 'Live Demo Menus'}</a></li>
              <li><a href="#pricing" className="hover:text-amber-500 transition">{lang === 'ar' ? 'الخطة المجانية للأبد' : 'Free Forever Plan'}</a></li>
              <li><a href="#contact" className="hover:text-amber-500 transition">{lang === 'ar' ? 'تواصل معنا' : 'Contact Support'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">{t.footer_col_2.title}</h5>
            <ul className="space-y-2.5">
              <li><span onClick={onLogin} className="hover:text-amber-500 cursor-pointer">{lang === 'ar' ? 'دخول الشركاء والمشرفين' : 'Partner Portal Login'}</span></li>
              <li><span onClick={onLogin} className="hover:text-amber-500 cursor-pointer">{lang === 'ar' ? 'توليد منيو ذكي ✨' : 'Launch Smart Menu ✨'}</span></li>
              <li><span className="hover:text-amber-500 cursor-pointer">{t.privacy}</span></li>
              <li><span className="hover:text-amber-500 cursor-pointer">{t.terms}</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">{lang === 'ar' ? 'الدعم ووسائل التواصل' : 'Support & Contact'}</h5>
            <p className="text-[11px] text-slate-400 mb-3">
              {lang === 'ar' ? 'يسعدنا تقديم كامل الدعم والرد السريع للنهوض بنشاطك التجاري.' : 'We are delighted to provide round-the-clock support to scale your food brand.'}
            </p>
            <p className="font-bold text-amber-500 text-sm" dir="ltr">+20 121 065 1168</p>
            <p className="text-slate-500 text-[10px] mt-1">support@menuclick.saas</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px]">
          <span>{t.copyright}</span>
          <div className="flex gap-4 mt-4 sm:mt-0 text-slate-400 font-bold">
            <span className="hover:text-white cursor-pointer">{t.privacy}</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">{t.terms}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
