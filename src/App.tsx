/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logoutUser } from './firebase';

// Subcomponents
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import MenuViewer from './components/MenuViewer';

export default function App() {
  const [page, setPage] = useState<string>('landing');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // 1. Detect dynamic URL queries on first render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const menuQuery = params.get('menu') || params.get('restaurant');
    const pageQuery = params.get('page');

    if (menuQuery) {
      setPage('menu');
      setSelectedSlug(menuQuery);
    } else if (pageQuery) {
      setPage(pageQuery);
    } else {
      setPage('landing');
    }
  }, []);

  // 2. Synchronize Firebase Google Auth login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemo(false);
        // If logged in and page was login, advance to dashboard
        setPage(prev => prev === 'login' ? 'dashboard' : prev);
      } else {
        if (!isDemo) {
          setCurrentUser(null);
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  // 3. Coordinate navigation updates with responsive browser history state sync
  const handleNavigate = (targetPage: string, slug?: string) => {
    setPage(targetPage);
    if (slug) {
      setSelectedSlug(slug);
    }

    const url = new URL(window.location.href);
    if (targetPage === 'menu' && slug) {
      url.searchParams.set('menu', slug);
      url.searchParams.delete('page');
    } else if (targetPage !== 'landing') {
      url.searchParams.set('page', targetPage);
      url.searchParams.delete('menu');
    } else {
      url.searchParams.delete('page');
      url.searchParams.delete('menu');
    }
    window.history.pushState({}, '', url.toString());
  };

  // 4. Custom Login Action Router
  const handleLoginSuccess = (user: any, isVirtualDemo: boolean = false) => {
    setCurrentUser(user);
    setIsDemo(isVirtualDemo);
    handleNavigate('dashboard');
  };

  // 5. Signout Trigger and memory wash
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase signout failed, washing local state cache", e);
    }
    setCurrentUser(null);
    setIsDemo(false);
    handleNavigate('landing');
  };

  if (authChecking) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-amber-500 font-sans flex flex-col justify-center items-center gap-4" dir="rtl">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold leading-normal">جاري إطلاق منيو كليك وتأمين الاتصال السحابي...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 transition-all">
      {page === 'landing' && (
        <LandingPage 
          user={currentUser} 
          onNavigate={handleNavigate} 
          onLogin={() => handleNavigate('login')} 
        />
      )}

      {page === 'login' && (
        <LoginPage 
          onBack={() => handleNavigate('landing')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {page === 'dashboard' && (
        <Dashboard 
          user={currentUser}
          isDemo={isDemo}
          onLogout={handleLogout}
          onNavigateToMenu={(slug) => handleNavigate('menu', slug)}
        />
      )}

      {page === 'menu' && (
        <MenuViewer 
          restaurantSlug={selectedSlug} 
          onBackToLanding={() => handleNavigate('landing')}
        />
      )}
    </div>
  );
}
