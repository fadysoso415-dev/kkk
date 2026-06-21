/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  motion 
} from 'motion/react';
import { 
  ChefHat, 
  LogIn, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  User,
  Heart
} from 'lucide-react';
import { signInWithGoogle, signUpWithCredentials, signInWithCredentials } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (user: any, isDemo?: boolean) => void;
}

export default function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<React.ReactNode | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  
  // Custom auth states
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLoginSuccess(user, false);
      } else {
        setErrorMsg("تعذر تسجيل الدخول باستخدام جوجل. هل تقف خلف جدار أو محاكي؟ يمكنك استخدام 'تسجيل الدخول التجريبي السريع' لتصفح لوحة التحكم فوراً.");
      }
    } catch (err: any) {
      console.error(err);
      const firebaseCode = err?.code || "";
      if (firebaseCode === 'auth/popup-closed-by-user') {
        setErrorMsg(
          <div className="space-y-3 text-right">
            <p className="font-bold flex items-center gap-1.5 text-rose-300">
              <span>تم إلغاء أو حظر نافذة الدخول بجوجل (Popup Blocked) 🔒</span>
            </p>
            <p className="text-[10px] leading-relaxed text-slate-400">
              يرجى فتح التطبيق في علامة تبويب كاملة مستقلة أو السماح بالنوافذ المنبثقة للرابط.
            </p>
            <p className="text-[10px] text-amber-400 font-bold">
              كخيار بديل سريع وفي الحال: يمكنك الضغط على زر <strong>"الدخول المباشر للوحة الاختبار (تجربة حية)"</strong> بالأسفل لتجربة اللوحة مباشرة وبسهولة تامة ودون الحاجة لتسجيل!
            </p>
          </div>
        );
      } else if (firebaseCode === 'auth/operation-not-allowed') {
        const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
        setErrorMsg(
          <div className="space-y-3 text-right">
            <p className="font-bold text-rose-300">لم يتم تمكين الدخول بجوجل في الفايربيز! ⚙️</p>
            <p className="text-[10px] leading-relaxed text-slate-300">
              يرجى تفعيل خيار تسجيل الدخول باستخدام "Google" في منصة Firebase Console الخاصة بمشروعك (ID: {firebaseConfig.projectId}) لبدء استخدامه.
            </p>
            <a 
              href={consoleUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer mt-1"
            >
              انقر لتفعيل Google Sign-In بمشروعك ⚙️
            </a>
          </div>
        );
      } else {
        setErrorMsg("حدث خطأ أثناء الاتصال بجوجل: " + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const simulatedOwner = {
      uid: 'demo-owner-uid-123456',
      displayName: 'مطعم القصر الملكي (حساب تجريبي)',
      email: 'fady-royal-palace@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100'
    };
    onLoginSuccess(simulatedOwner, true);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMsg("الرجاء تعبئة البيانات المطلوبة لإتمام العملية.");
      return;
    }
    if (isRegister && !name.trim()) {
      setErrorMsg("الرجاء كتابة الاسم الكامل أو اسم مطعمك لتتمكن من إنشاء الحساب.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("لحماية حسابك ومطعمك، كلمة المرور يجب ألا تقل عن 6 خانات.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      let loggedUser;
      if (isRegister) {
        loggedUser = await signUpWithCredentials(name.trim(), emailOrPhone.trim(), password);
      } else {
        loggedUser = await signInWithCredentials(emailOrPhone.trim(), password);
      }
      if (loggedUser) {
        onLoginSuccess(loggedUser, false);
      }
    } catch (err: any) {
      console.error(err);
      const firebaseCode = err?.code || "";
      let arabicMsg: React.ReactNode = "";
      if (firebaseCode === 'auth/email-already-in-use') {
        arabicMsg = "عذراً، هذا الحساب مسجل لدينا بالفعل مسبقاً! جرب خيار تسجيل الدخول بنفس البيانات.";
      } else if (firebaseCode === 'auth/invalid-email') {
        arabicMsg = "صيغة البريد الإلكتروني أو البيانات المدخلة غير صحيحة.";
      } else if (firebaseCode === 'auth/weak-password') {
        arabicMsg = "كلمة المرور ضعيفة جداً! يرجى استخدام 6 رموز أو أكثر.";
      } else if (
        firebaseCode === 'auth/user-not-found' || 
        firebaseCode === 'auth/wrong-password' || 
        firebaseCode === 'auth/invalid-credential'
      ) {
        arabicMsg = "تأكد من صحة رقم الهاتف/البريد الإلكتروني المدخل وكلمة المرور مجدداً.";
      } else if (firebaseCode === 'auth/operation-not-allowed') {
        const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
        arabicMsg = (
          <div className="space-y-3 text-right">
            <p className="font-bold text-rose-300">ميزة التسجيل والتسجيل البريدي معطلة في مشروعك! ⚙️</p>
            <p className="text-[10px] leading-relaxed text-slate-300">
              يرجى تفعيل خيار تسجيل الدخول بالبريد الإلكتروني والكلمة السريّة (Email/Password) في منصة Firebase Console الخاصة بك للبدء آمنًا:
            </p>
            <div className="text-[10px] leading-normal font-sans text-amber-200">
              طريقة التفعيل من لوحة التحكم:
              <ol className="list-decimal list-inside space-y-0.5 mt-1 text-slate-300">
                <li>افتح الرابط بالأسفل لتذهب لمشروعك مباشرة.</li>
                <li>اضغط على زر <strong>"إضافة مزود جديد" (Add provider)</strong>.</li>
                <li>اختر <strong>البريد الإلكتروني وكلمة المرور (Email/Password)</strong>.</li>
                <li>قم بتفعيل الخيار (Enable) ثم اضغط حفظ (Save).</li>
              </ol>
            </div>
            <a 
              href={consoleUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer mt-1"
            >
              انقر لتمكين البريد والرقم السري بالكونسول ⚙️
            </a>
          </div>
        );
      } else {
        arabicMsg = err.message || "عذراً، تعذر الاتصال بخوادم التوثيق حالياً. يرجى مراجعة شبكة الإنترنت الخاصة بك.";
      }
      setErrorMsg(arabicMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden" dir="rtl">
      {/* Visual background glows */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Screen Boundary Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-950/75 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col"
      >
        {/* Back navigation */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900/80 border border-slate-800 rounded-full py-1.5 px-3 transition duration-150 active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
            العودة للرئيسية
          </button>
          
          <span className="text-[9px] bg-slate-900 text-amber-500 border border-amber-500/20 font-black px-2 py-1 rounded-full select-none">
            إصدار v2.5
          </span>
        </div>

        {/* Brand visual header */}
        <div className="flex flex-col items-center gap-1.5 text-center mb-6">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <ChefHat className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent mt-1">
            منيو كليك 🍽️
          </h2>
          <span className="text-[10px] text-slate-400 font-extrabold tracking-wide uppercase">نظام السحاب المتكامل لعرض وطلبات الـ QR</span>
        </div>

        {/* Dynamic credential Login / Register tabs */}
        <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-5 relative">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(null); }}
            className={`py-2 text-xs font-black transition-all rounded-lg cursor-pointer ${!isRegister ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            تسجيل دخول
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(null); }}
            className={`py-2 text-xs font-black transition-all rounded-lg cursor-pointer ${isRegister ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {errorMsg && (
          <div className="w-full bg-rose-950/50 border border-rose-800/85 p-3 rounded-xl text-[11px] text-rose-300 leading-normal mb-5 text-right font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form elements code */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">الاسم بالكامل أو اسم مطعمك 🍽️</label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500 focus:bg-slate-950 outline-none rounded-xl py-3 pr-10 pl-4 text-xs font-semibold text-slate-100 placeholder:text-slate-500 transition-all"
                  placeholder="مثال: مطعم شاورما القصر"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">رقم الهاتف أو البريد الإلكتروني 📱📧</label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500 focus:bg-slate-950 outline-none rounded-xl py-3 pr-10 pl-4 text-xs font-semibold text-slate-100 placeholder:text-slate-500 transition-all text-left"
                style={{ direction: 'ltr' }}
                placeholder="05xxxxxxx or user@gmail.com"
                required
              />
            </div>
            <span className="block text-[9px] text-slate-500 mt-1">يمكنك إدخال رقم هاتفك أو بريدك الإلكتروني المفضل فوراً</span>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">رقمك السري الخاص (باسوورد) 🔒</label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500 focus:bg-slate-950 outline-none rounded-xl py-3 pr-10 pl-4 text-xs font-semibold text-slate-100 placeholder:text-slate-500 transition-all text-left"
                style={{ direction: 'ltr' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-3.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isRegister ? 'إنشاء الحساب والبدء السريع ✨' : 'تسجيل الدخول الآمن'}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/80" />
          </div>
          <span className="relative bg-slate-950 px-3 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest whitespace-nowrap">أو تسجيل الدخول السحابي</span>
        </div>

        {/* Third Party logins */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            id="google-login-btn"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-slate-900 text-white hover:bg-slate-850 border border-slate-800 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-97 disabled:opacity-50"
          >
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            تسجيل سريع باستخدام Google
          </button>

          <button
            id="demo-login-btn"
            onClick={handleDemoLogin}
            className="w-full bg-slate-900 text-amber-500 hover:text-amber-400 border border-slate-800 hover:border-slate-700/80 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-97 shadow-xl shadow-amber-500/[0.01]"
          >
            <UserCheck className="w-4 h-4" />
            الدخول المباشر للوحة الاختبار (تجربة حية)
          </button>
        </div>

        {/* Security / Quality seal */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-center gap-1.5 text-slate-500 text-[9px] cursor-default select-none text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>التشفير معتمد وآمن 100٪ لحماية جميع قوائم طعامك وملفاتك.</span>
        </div>
      </motion.div>
    </div>
  );
}
