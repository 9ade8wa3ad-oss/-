import React from 'react';
import { motion } from 'motion/react';
import { Award, Clock, ShieldAlert, Sparkles, TrendingDown, Target, Activity, Flame, BellRing, Heart } from 'lucide-react';
import { Habit, AppLang } from '../types';

interface UserDashboardProps {
  habit: Habit;
  userPoints: number;
  lang: AppLang;
}

export default function UserDashboard({ habit, userPoints, lang }: UserDashboardProps) {
  // Days remaining in the custom program
  const durationDays = habit.durationDays || 30;
  const currentDay = habit.dayCount || 1;
  const daysRemaining = Math.max(0, durationDays - currentDay);
  
  // Total alerts commit rate
  const totalAlerts = habit.totalAlarmsTriggered || 0;
  const adheredAlerts = habit.adheredAlarmsCount || 0;
  const successRate = totalAlerts > 0 ? Math.round((adheredAlerts / totalAlerts) * 100) : 100;

  // Compute stats of decreasing frequency day-by-day
  const wakingStartHour = habit.wakingHourStart;
  const wakingEndHour = habit.wakingHourEnd;
  const wakingHoursTotal = wakingEndHour <= wakingStartHour 
    ? (wakingEndHour + 24) - wakingStartHour 
    : wakingEndHour - wakingStartHour;
  const wakingSecondsTotal = wakingHoursTotal * 3600;
  
  const startingDailyCount = habit.currentDailyCount;
  const targetDailyCount = habit.targetDailyCount;
  const dayDiff = Math.max(1, durationDays - 1);

  // Generate 7 progressive day indices for visual tracking spanning Day 1 to durationDays
  const step = Math.max(1, Math.round((durationDays - 1) / 6));
  const keyDays = Array.from({ length: 7 }, (_, i) => {
    if (i === 0) return 1;
    if (i === 6) return durationDays;
    return Math.min(durationDays - 1, 1 + i * step);
  });
  const uniqueKeyDays = Array.from(new Set(keyDays)).sort((a,b)=>a-b);

  const frequencyCurve = uniqueKeyDays.map((d) => {
    const dayIndex = Math.min(d, durationDays);
    const exactDailyCount = startingDailyCount - ((dayIndex - 1) * (startingDailyCount - targetDailyCount)) / dayDiff;
    const allowed = Math.max(targetDailyCount, Math.round(exactDailyCount));
    return {
      day: d,
      count: allowed,
      isCurrent: d === currentDay || (d < currentDay && currentDay < d + step && d !== durationDays)
    };
  });

  // Calculate start date of the plan and target end date
  const startDate = habit.createdAt ? new Date(habit.createdAt) : new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-xl shadow-slate-200/50 space-y-6 text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {lang === 'ar' ? 'لوحة تحكم الملخص والتقدم العام 📊' : 'Overall Progress & Summary Dashboard 📊'}
          </h3>
          <p className="text-slate-500 text-xs">
            {lang === 'ar' ? 'تحليلات الأداء الشاملة ومؤشرات تراجع العادة بذكاء.' : 'Comprehensive performance analytics and smart habit reduction index.'}
          </p>
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Guard Willpower Success Gauge */}
        <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-100 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-teal-800">
              {lang === 'ar' ? 'معدل نجاح مقاومة التنبيهات:' : 'Alert Resistance Success Rate:'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-teal-950 font-sans">{successRate}%</span>
            <span className="text-xs text-teal-600">
              {lang === 'ar' ? 'من الالتزام التام' : 'adhered'}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            {lang === 'ar' ? (
              <>مبني على نسبة تفاعل وإقرار المنبهات التي واجهتها بقوة الإرادة. حاصل القسمة: <strong>{adheredAlerts}</strong> التزام من أصل <strong>{totalAlerts}</strong> إشعار مُرسل.</>
            ) : (
              <>Based on interaction & confirmation rate of alarms logged key-wise. Ratio: <strong>{adheredAlerts}</strong> successfully loaded out of <strong>{totalAlerts}</strong> sent alerts.</>
            )}
          </p>
        </div>

        {/* Remaining Days in program card */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">
              {lang === 'ar' ? 'الأيام المتبقية في خطتك:' : 'Days remaining in your plan:'}
            </span>
            <div className="my-3 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-sans">{daysRemaining}</span>
              <span className="text-xs text-slate-400">
                {lang === 'ar' ? 'أيـام متبقية' : 'days left'}
              </span>
            </div>

            {/* Added Plan Dates showing Start and End clearly in chronological order */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-[10.5px] space-y-1.5 text-slate-500">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400 text-[10px]">
                  {lang === 'ar' ? '🏁 تاريخ بدء الخطة:' : '🏁 Plan Start Date:'}
                </span>
                <span className="font-semibold text-slate-700 font-sans">{formatDate(startDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400 text-[10px]">
                  {lang === 'ar' ? '🏆 تاريخ انتهاء الخطة:' : '🏆 Plan End Date:'}
                </span>
                <span className="font-semibold text-emerald-600 font-sans">{formatDate(endDate)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentDay / durationDays) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>{lang === 'ar' ? `اليوم ${currentDay}` : `Day ${currentDay}`}</span>
              <span>{lang === 'ar' ? `اليوم ${durationDays}` : `Day ${durationDays}`}</span>
            </div>
          </div>
        </div>

        {/* Alert Adherence Statistics */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-bold text-slate-500">
              {lang === 'ar' ? 'العادات النشطة حالياً:' : 'Active Target Behaviors:'}
            </span>
            <div className="mt-2.5 mb-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 bg-emerald-50/50 border border-emerald-100 px-3 py-1 rounded-full">
                {habit.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {lang === 'ar' ? `تدريج انسحابي مصمم ذاتياً بدقة على مدار ${durationDays} يوماً.` : `Strict cognitive linear reduction strategy for ${durationDays} days.`}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10.5px]">
            <span className="text-slate-500">
              {lang === 'ar' ? 'رصيد عزيمتك الكلي:' : 'Overall willpower balance:'}
            </span>
            <span className="font-bold text-slate-900 font-sans bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
              {userPoints} {lang === 'ar' ? 'نقطة' : 'points'} 🔥
            </span>
          </div>
        </div>

      </div>

      {/* Habits Decline Curve Visual Component */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          {lang === 'ar' 
            ? `تتبع منحنى التناقص التلقائي للتكرارات اليومية (الهدف: ${habit.targetDailyCount} مرات):` 
            : `Track linear reduction curve of daily target repeats (Goal: ${habit.targetDailyCount} times):`}
        </label>
        
        <div className="space-y-2">
          {frequencyCurve.map((fc) => {
            const percentage = (fc.count / startingDailyCount) * 100;
            return (
              <div key={fc.day} className="flex items-center gap-2 text-xs">
                
                {/* day label */}
                <span className="w-14 text-slate-500 text-[10.5px]">
                  {lang === 'ar' ? `يوم ${fc.day}:` : `Day ${fc.day}:`}
                </span>
                
                {/* bar content */}
                <div className="flex-1 bg-slate-200/70 h-4 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${
                      fc.isCurrent
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        : fc.day < currentDay
                        ? 'bg-slate-400/80'
                        : 'bg-teal-600/60'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* count label overlayed */}
                  <span className="absolute left-2.5 top-0.5 text-[9px] font-sans font-bold text-slate-600">
                    {fc.count} {lang === 'ar' ? 'تكرار' : 'reps'}
                  </span>
                </div>

                {/* current indicator badge */}
                {fc.isCurrent && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                    {lang === 'ar' ? 'مستواك الحالي' : 'Active Level'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[9.5px] leading-relaxed text-slate-400 text-right">
          {lang === 'ar' ? (
            <>⚠️ <strong>ملاحظة فسيولوجية:</strong> تقوم خوارزمية برنامج الإقلاع بزيادة المسافة بين كل جرعة بمعدل يومي لتتيح لجهازك العصبي التكيف مع تقليل الجرعة بسلاسة تامة وبدون أعراض انسحاب فجائية.</>
          ) : (
            <>⚠️ <strong>Neural Adaptation Note:</strong> The scheduling formula increments daily intervals to facilitate standard dopamine system recalibration safely and naturally with minimal trigger responses.</>
          )}
        </p>
      </div>

    </div>
  );
}
