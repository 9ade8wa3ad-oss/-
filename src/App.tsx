/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, CheckCircle2, Award, Sparkles, Heart, HelpCircle, Flame, Moon, Compass, BellRing, Languages } from 'lucide-react';

import AuthScreen from './components/AuthScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import HabitForm from './components/HabitForm';
import HabitTimeline from './components/HabitTimeline';
import UserDashboard from './components/UserDashboard';
import ProgressionChart from './components/ProgressionChart';
import MotivationalQuotes from './components/MotivationalQuotes';
import { UserProfile, Habit } from './types';
import { AppLang, translations } from './utils/translations';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<AppLang>(() => {
    const stored = localStorage.getItem('iql_app_lang');
    return (stored as AppLang) || 'ar';
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('iql_user_profile');
      const storedHabit = localStorage.getItem('iql_active_habit');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedHabit) {
        setActiveHabit(JSON.parse(storedHabit));
      }
    } catch (e) {
      console.error('Error recovering storage: ', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save changes helper
  const saveUserToLocalStorage = (profile: UserProfile | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem('iql_user_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('iql_user_profile');
    }
  };

  const saveHabitToLocalStorage = (habit: Habit | null) => {
    setActiveHabit(habit);
    if (habit) {
      localStorage.setItem('iql_active_habit', JSON.stringify(habit));
    } else {
      localStorage.removeItem('iql_active_habit');
    }
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    localStorage.setItem('iql_app_lang', nextLang);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    saveUserToLocalStorage(profile);
  };

  const handleSubscriptionSuccess = (updatedProfile: UserProfile) => {
    saveUserToLocalStorage(updatedProfile);
  };

  const handleCreateHabitSubmit = (newHabit: Habit) => {
    saveHabitToLocalStorage(newHabit);
  };

  const handleUpdatePoints = (newPoints: number) => {
    if (user) {
      const updated = { ...user, points: newPoints };
      saveUserToLocalStorage(updated);
    }
  };

  const handleLogout = () => {
    saveUserToLocalStorage(null);
    saveHabitToLocalStorage(null);
  };

  const handleResetHabit = () => {
    if (window.confirm(translations[lang].confirmReset)) {
      saveHabitToLocalStorage(null);
    }
  };

  const t = translations[lang];

  if (loading) {
    return (
      <div className={`min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <span className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mr-2"></span>
        {t.loading}
      </div>
    );
  }

  // Phase 1: Authentication Gateway
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} lang={lang} setLang={handleToggleLang} />;
  }

  // Phase 2: Gold Annual Subscription Checker ($20)
  if (!user.isSubscribed) {
    return (
      <SubscriptionScreen
        user={user}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        onLogout={handleLogout}
        lang={lang}
        setLang={handleToggleLang}
      />
    );
  }

  // Phase 3: Premium Application Logged dashboard
  return (
    <div className={`min-h-screen bg-slate-50/50 text-slate-800 pb-12 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Premium Header Nav Area */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight font-sans leading-none">{t.appName}</h1>
              <span className="text-[10px] text-teal-600 font-bold block mt-1">{t.appSubName}</span>
            </div>
          </div>

          {/* User Details widgets */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            
            {/* Language Toggle */}
            <button
              onClick={handleToggleLang}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-150 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors text-xs font-semibold text-slate-700"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{lang === 'ar' ? 'English 🇺🇸' : 'العربية 🇸🇦'}</span>
            </button>

            {/* points gamified widget */}
            <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-serif font-black text-slate-700">{user.points}</span>
              <span className="text-[10px] text-slate-400">{t.willpowerPoints}</span>
            </div>

            {/* gold subscription status label */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-100">
              <Award className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{t.goldActive}</span>
            </div>

            {/* welcome greeting & logout */}
            <div className={`flex items-center gap-2 ${lang === 'ar' ? 'sm:border-r sm:pr-4' : 'sm:border-l sm:pl-4'} sm:border-slate-200`}>
              <div className="hidden sm:block">
                <p className="text-[11px] text-slate-400">{t.welcomeHero}</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Primary Dashboard Grid Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {!activeHabit ? (
            
            // Step 3.1: Let client select or build a weaning scheme if no activeHabit is setup yet
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-6 space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t.authTitle}</h2>
                <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                  {t.authDesc}
                </p>
              </div>

              <HabitForm onAddHabit={handleCreateHabitSubmit} lang={lang} />
            </motion.div>

          ) : (
            
            // Step 3.2: Render the complete dashboard
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Mobile notification simulator & Timeline (7 columns ratio) */}
              <div className="lg:col-span-8 space-y-6">
                <HabitTimeline
                  habit={activeHabit}
                  userPoints={user.points}
                  onUpdatePoints={handleUpdatePoints}
                  onResetHabit={handleResetHabit}
                  lang={lang}
                />

                <UserDashboard
                  habit={activeHabit}
                  userPoints={user.points}
                  lang={lang}
                />
              </div>

              {/* Right Column: Descent Charts and custom motivational articles (4 columns ratio) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 30-Day Prognosis Descent Chart */}
                <ProgressionChart habit={activeHabit} lang={lang} />

                {/* Cognitive tips customized for selected state */}
                <MotivationalQuotes category={activeHabit.category} lang={lang} />

                {/* Trust badge information block */}
                <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{t.safetyBadge}</span>
                  </div>
                  <p className={`text-[10px] text-slate-400 leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t.safetyDesc}
                  </p>
                </div>

              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </main>

      {/* Footer support block */}
      <footer className="mt-16 text-center text-[11px] text-slate-400 font-sans space-y-1 px-4">
        <p>{t.footerLine1}</p>
        <p className="text-[10px] text-slate-500">{t.footerLine2}</p>
      </footer>

    </div>
  );
}
