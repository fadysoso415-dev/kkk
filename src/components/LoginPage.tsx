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
  UserCheck
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (user: any, isDemo?: boolean) => void;
}

export default function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg("حدث خطأ أثناء الاتصال بجوجل: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Generate a beautiful simulated owner user
    const simulatedOwner = {
      uid: 'demo-owner-uid-123456',
      displayName: 'مطعم القصر الملكي',
      email: 'fady-royal-palace@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100'
    };
    onLoginSuccess(simulatedOwner, true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden" dir="rtl">
      {/* Visual background glows */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Box container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-950/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center"
      >
        {/* Custom back key */}
        <button 
          onClick={onBack} 
          className="absolute top-6 right-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-slate-900 border border-slate-800 rounded-full py-1.5 px-3 transition"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          رجوع للرئيسية
        </button>

        {/* Brand visual header */}
        <div className="mt-8 flex flex-col items-center gap-2 mb-8">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 p-3.5 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <ChefHat className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent mt-2">
            منيو كليك - تسجيل الدخول
          </h2>
          <span className="text-[11px] text-slate-400 tracking-wide font-mono">OWNER SaaS PORTAL</span>
        </div>

        <div className="w-full text-center space-y-4 mb-6">
          <p className="text-xs text-slate-400 leading-normal">
            برجاء تفعيل وإقران حسابك لفتح وتصميم المنيو وإعداد رمز الاستجابة السريع QR والتحرير الكامل للمنتجات والأسعار.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full bg-rose-950/50 border border-rose-800/80 p-3.5 rounded-xl text-[11px] text-rose-200 leading-normal mb-5 text-right space-y-1">
            <p className="font-bold">ملاحظة تقنية:</p>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Buttons Stack */}
        <div className="w-full space-y-3">
          <button
            id="google-login-btn"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            تسجيل الدخول السريع باستخدام Google
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-950 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">أو جرب الإدارة فورا</span>
          </div>

          <button
            id="demo-login-btn"
            onClick={handleDemoLogin}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-98 shadow-md shadow-amber-500/5 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <UserCheck className="w-5 h-5" />
            دخول تجريبي للوحة التحكم (تجربة فورية)
          </button>
        </div>

        {/* Security badges */}
        <div className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-400 text-[10px] transition cursor-default">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>اتصال مشفر وآمن بالكامل عبر بروتوكولات Google OAuth 2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
