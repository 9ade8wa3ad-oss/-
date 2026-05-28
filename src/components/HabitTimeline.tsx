import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Info, ShieldAlert, Award, Flame, Check, HelpCircle, ArrowRight, Play, RefreshCw, Volume2, Sparkles, AlertTriangle, BellRing } from 'lucide-react';
import { Habit, WeaningSpeed, AppLang } from '../types';

interface HabitTimelineProps {
  habit: Habit;
  userPoints: number;
  onUpdatePoints: (points: number) => void;
  onResetHabit: () => void;
  lang: AppLang;
}

export default function HabitTimeline({ habit, userPoints, onUpdatePoints, onResetHabit, lang }: HabitTimelineProps) {
  const actualDay = habit.dayCount || 1;
  const [simulatedDay, setSimulatedDay] = useState<number>(actualDay);
  const [timeFastForwardSeconds, setTimeFastForwardSeconds] = useState<number>(0);
  const [internalCountdown, setInternalCountdown] = useState<number>(0);
  const [notificationTriggered, setNotificationTriggered] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Auto-return simulation states & refs
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [returnTimer, setReturnTimer] = useState<number>(0);
  const autoReturnTimeoutRef = React.useRef<any>(null);
  const autoReturnIntervalRef = React.useRef<any>(null);

  const startAutoReturnTimer = () => {
    // Clear any existing timers
    if (autoReturnTimeoutRef.current) clearTimeout(autoReturnTimeoutRef.current);
    if (autoReturnIntervalRef.current) clearInterval(autoReturnIntervalRef.current);

    const destDay = habit.dayCount || 1;
    if (simulatedDay === destDay) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setReturnTimer(3); // Start 3-second countdown

    // Countdown tick
    autoReturnIntervalRef.current = setInterval(() => {
      setReturnTimer((prev) => {
        if (prev <= 1) {
          clearInterval(autoReturnIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Final reset trigger after 3s
    autoReturnTimeoutRef.current = setTimeout(() => {
      setSimulatedDay(destDay);
      setIsSimulating(false);
    }, 3000);
  };

  // Sync simulated day when habit/actualDay changes (e.g. from reset)
  useEffect(() => {
    setSimulatedDay(habit.dayCount || 1);
  }, [habit]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoReturnTimeoutRef.current) clearTimeout(autoReturnTimeoutRef.current);
      if (autoReturnIntervalRef.current) clearInterval(autoReturnIntervalRef.current);
    };
  }, []);

  // Sound effects simulator toggle
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // States to track logged events of the CURRENT day, persisted in localStorage
  const [loggedStates, setLoggedStates] = useState<Record<number, 'pending' | 'completed' | 'resisted'>>(() => {
    try {
      const parentName = habit?.name || 'default';
      const key = `iql_logged_states_${parentName}_day_${simulatedDay}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [relativeUserSecondsState, setRelativeUserSecondsState] = useState<number>(0);

  // Calculations for waking hour span
  const wakingStartHour = habit.wakingHourStart;
  const wakingEndHour = habit.wakingHourEnd;
  const wakingHoursTotal = wakingEndHour <= wakingStartHour 
    ? (wakingEndHour + 24) - wakingStartHour 
    : wakingEndHour - wakingStartHour;
  const wakingSecondsTotal = wakingHoursTotal * 3600;

  // Compute intervals & limits for the selected day dynamically
  const durationDays = habit.durationDays || 30;
  const startingDailyCount = habit.currentDailyCount;
  const targetDailyCount = habit.targetDailyCount;
  
  const dayIndex = Math.min(simulatedDay, durationDays);
  const dayDiff = Math.max(1, durationDays - 1);

  // Compute allowed count linearly to provide a smooth, gradual reduction with no sudden drop (especially on days 1 & 2)
  const exactDailyCount = startingDailyCount - ((dayIndex - 1) * (startingDailyCount - targetDailyCount)) / dayDiff;
  const allowedCountToday = Math.max(targetDailyCount, Math.round(exactDailyCount));

  // Compute spacing interval which smoothly adapts to the daily count
  const dayIntervalSeconds = exactDailyCount > 0 
    ? Math.floor(wakingSecondsTotal / exactDailyCount) 
    : wakingSecondsTotal * 1.2;

  const isCompletelyWeaned = targetDailyCount === 0 
    ? (allowedCountToday === 0 || dayIndex >= durationDays)
    : (allowedCountToday <= targetDailyCount);

  // Generate scheduled times list for the timeline
  const getScheduledTimes = () => {
    const list = [];
    for (let i = 0; i < allowedCountToday; i++) {
      const secondsOffset = i * dayIntervalSeconds;
      const hoursOffset = secondsOffset / 3600;
      
      const totalHours = wakingStartHour + hoursOffset;
      const finalHour = Math.floor(totalHours) % 24;
      const finalMinute = Math.floor((totalHours % 1) * 60);
      
      // Formatting
      const displayHour = finalHour === 0 ? 12 : finalHour > 12 ? finalHour - 12 : finalHour;
      const ampm = finalHour >= 12 ? 'مساءً' : 'صباحاً';
      const timeString = `${String(displayHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')} ${ampm}`;
      
      list.push({
        index: i,
        timeLabel: timeString,
        secondsFromStart: secondsOffset,
        absoluteHour: totalHours
      });
    }
    return list;
  };

  const scheduleList = getScheduledTimes();

  // Sync and load logged status with localStorage when simulated day changes
  useEffect(() => {
    try {
      const parentName = habit?.name || 'default';
      const key = `iql_logged_states_${parentName}_day_${simulatedDay}`;
      const saved = localStorage.getItem(key);
      setLoggedStates(saved ? JSON.parse(saved) : {});
    } catch {
      setLoggedStates({});
    }
    setNotificationTriggered(false);
  }, [simulatedDay, habit?.name]);

  // Real-time ticking system to simulate countdown to the NEXT scheduled session
  useEffect(() => {
    let intervalId: any;
    
    // Find current time of day in seconds from the waking start
    // In our simulator, we run a fast system, but we can anchor to actual local hours or simulate active timer progression
    const timerTick = () => {
      const now = new Date();
      const currentSeconds = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + timeFastForwardSeconds) % (24 * 3600);
      const wokeUpSeconds = wakingStartHour * 3600;
      
      let relativeUserSeconds = currentSeconds - wokeUpSeconds;
      if (relativeUserSeconds < 0) {
        // Before waking hours, set to start
        relativeUserSeconds = 0;
      }

      setRelativeUserSecondsState(relativeUserSeconds);

      // Find next scheduled node
      const nextNode = scheduleList.find(node => node.secondsFromStart > relativeUserSeconds);
      
      if (nextNode) {
        const diffSeconds = Math.floor(nextNode.secondsFromStart - relativeUserSeconds);
        setInternalCountdown(diffSeconds);
        
        // If exact trigger hits (between 0 and 15 seconds window to prevent flickering)
        if (diffSeconds > 0 && diffSeconds <= 2 && !notificationTriggered) {
          triggerWeaningAlarm();
        }
      } else {
        // Day over or loop back
        setInternalCountdown(0);
      }
    };

    timerTick();
    intervalId = setInterval(timerTick, 1000);

    return () => clearInterval(intervalId);
  }, [scheduleList, timeFastForwardSeconds, notificationTriggered]);

  // Handle playing audio alerts fallback
  const playAlertSound = (type: 'success' | 'alarm' | 'click') => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } else if (type === 'alarm') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log('Audio Context muted or blocked by standard browser policy', e);
    }
  };

  const triggerWeaningAlarm = () => {
    setNotificationTriggered(true);
    playAlertSound('alarm');
    
    // Attempt standard web notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('تنبيه برنامج الإقلاع 🚭', {
        body: `حان وقت تكرار الـ (${habit.name}) المجدول الآن. قاوم للتوفير وبناء صحتك!`,
        dir: 'rtl'
      });
    }
  };

  const handleLoggedAction = (index: number, action: 'completed' | 'resisted') => {
    const updated = { ...loggedStates };
    updated[index] = action;
    setLoggedStates(updated);

    try {
      const parentName = habit?.name || 'default';
      const key = `iql_logged_states_${parentName}_day_${simulatedDay}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving logged states: ', e);
    }

    if (action === 'resisted') {
      // User resisted the craving! Award big points + message
      onUpdatePoints(userPoints + 50);
      setLastActionMessage(`رائع للغاية! قاومت الرغبة في ${habit.name} وحصلت على +50 نقطة عزيمة! 💪🌟`);
      playAlertSound('success');
    } else {
      // User performed the habit (reset points slightly, or small support)
      onUpdatePoints(Math.max(0, userPoints - 5));
      setLastActionMessage(`سجلنا الجلسة بصدق. تذكر أن المباعدة اليومية هي غايتك الأساسية. واصل السعي.`);
      playAlertSound('click');
    }

    // Auto dismiss status message
    setTimeout(() => {
      setLastActionMessage(null);
    }, 5000);
  };

  // Convert seconds to readable hour/min/sec format
  const formatSecondsToTime = (totalSecs: number) => {
    if (totalSecs <= 0) return '00:00:00';
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Request system notification authorization
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          playAlertSound('success');
          alert('تم تفعيل إشعارات سطح المكتب والنظام بنجاح! ستتلقى التنبيهات في وقتها المحدد.');
        }
      });
    } else {
      alert('المتصفح الحالي لا يدعم إشعارات النظام المباشرة، سنعتمد على التنبيهات المرئية داخل صفحة التطبيق.');
    }
  };

  // Calculate stats for today
  const repsResistedCount = Object.values(loggedStates).filter(v => v === 'resisted').length;
  const repsCompletedCount = Object.values(loggedStates).filter(v => v === 'completed').length;
  const repsRemainingCount = allowedCountToday - (repsResistedCount + repsCompletedCount);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Active Habit Title Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <span className="text-emerald-400 text-[10px] font-sans font-bold tracking-wider uppercase bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              العادة النشطة التي تعالجها الخوارزمية
            </span>
            <h4 className="text-2xl font-bold mt-3 font-sans leading-tight text-white mb-1">
              {habit.name}
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              المعدل الأولي لليقظة: <strong className="text-slate-200">{habit.currentDailyCount} مرات </strong> في اليوم.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">منهاج الإقلاع والانسحاب</span>
              <span className="text-xs font-bold text-slate-300">
                🎯 خطة ذكية مدتها {durationDays} يوماً
              </span>
            </div>
            
            <button
              onClick={onResetHabit}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تغيير الخطة
            </button>
          </div>
        </motion.div>

        {/* Dynamic Simulated Day Controls Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-700">تخطي ومحاكاة مراحل الخطة:</span>
              <span className="bg-teal-50 text-teal-700 font-sans font-black text-xs px-2.5 py-1 rounded-xl">
                اليوم {simulatedDay} من {durationDays}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3 leading-normal">
              اسحب المحاكي لمشاهدة كيف تقوم الخوارزمية تلقائياً بمباعدة المسافات وتقليل السلوك تدريجياً عبر الزمن.
            </p>
            
            <input
              type="range"
              min={1}
              max={durationDays}
              value={simulatedDay}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSimulatedDay(val);
                // Clear active return timers when dragging/sliding
                if (autoReturnTimeoutRef.current) clearTimeout(autoReturnTimeoutRef.current);
                if (autoReturnIntervalRef.current) clearInterval(autoReturnIntervalRef.current);
                
                const destDay = habit.dayCount || 1;
                if (val !== destDay) {
                  setIsSimulating(true);
                  setReturnTimer(3);
                } else {
                  setIsSimulating(false);
                }
              }}
              onMouseUp={startAutoReturnTimer}
              onTouchEnd={startAutoReturnTimer}
              className="w-full accent-teal-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />

            {/* Auto-return banner notice */}
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 text-center text-[10px] font-semibold text-amber-700 bg-amber-50/70 rounded-xl py-1.5 px-2.5 border border-amber-100 animate-pulse leading-relaxed"
              >
                {lang === 'ar' ? (
                  `⚠️ أنت تشاهد محاكاة الآن. سيعود المؤشر تلقائياً لليوم الفعلي (${habit.dayCount || 1}) في غضون ${returnTimer} ثوانٍ...`
                ) : (
                  `⚠️ Previewing simulation. Slider will return to the actual day (${habit.dayCount || 1}) in ${returnTimer}s...`
                )}
              </motion.div>
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-right font-sans">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">مباعدة الفواصل اليوم:</span>
              <span className="font-bold text-slate-800 font-mono">
                {Math.floor(dayIntervalSeconds / 60)} دقيقة و {dayIntervalSeconds % 60} ثانية
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">العدد المسموح به اليوم:</span>
              <span className="font-bold text-teal-600">
                {isCompletelyWeaned 
                  ? (habit.targetDailyCount === 0 ? 'توقف بالكامل (0) 🎉' : `الهدف المقلص (${habit.targetDailyCount}) 🎉`)
                  : `${allowedCountToday} جلسات`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Live Weaning Alarm / System Settings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-700">مؤقت الجلسة القادمة:</span>
              <span className="flex items-center gap-1">
                <Volume2
                  onClick={() => { setAudioEnabled(!audioEnabled); playAlertSound('click'); }}
                  className={`w-4 h-4 cursor-pointer transition-colors ${audioEnabled ? 'text-teal-600' : 'text-slate-400'}`}
                  title={audioEnabled ? 'كتم الصوت' : 'تفعيل نغمات التنبيه'}
                />
              </span>
            </div>
            
            <div className="text-center py-2">
              {internalCountdown > 0 ? (
                <div className="font-mono text-2xl font-black text-slate-800 tracking-wider">
                  {formatSecondsToTime(internalCountdown)}
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-100 animate-pulse">
                  انتهت جلسات اليوم بسلامة! 🎉
                </div>
              )}
              <span className="text-[9px] text-slate-400 block mt-1">الوقت المتبقي حتى يحين موعد الجرعة القادمة</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => {
                setTimeFastForwardSeconds(prev => prev + 600); // FF 10 minutes
                playAlertSound('click');
              }}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-sans font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              تسريع الوقت +10د
            </button>
            <button
              onClick={requestNotificationPermission}
              className="px-2.5 py-2 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:to-teal-600 text-white rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              تفعيل التنبيهات 🔔
            </button>
          </div>
        </motion.div>

      </div>

      {/* Intercom Alarm Alert Trigger Popup */}
      <AnimatePresence>
        {notificationTriggered && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="p-5 bg-gradient-to-tr from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 animate-bounce">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">تنبيه حازم! حان وقت السلوك المجدول للعادة 🛑</h5>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  تطالبك الخوارزمية الآن بقرار لخطوة الـ ({habit.name}) هذه لتسجيل المتابعة الصادقة:
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => {
                  setNotificationTriggered(false);
                  // Find first index that is pending to complete it
                  const firstPending = scheduleList.find(n => loggedStates[n.index] === undefined || loggedStates[n.index] === 'pending');
                  if (firstPending !== undefined) {
                    handleLoggedAction(firstPending.index, 'completed');
                  } else {
                    playAlertSound('click');
                  }
                }}
                className="px-4 py-2 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer text-center"
              >
                لقد تكرر السلوك (تسجيل جرعة)
              </button>
              
              <button
                onClick={() => {
                  setNotificationTriggered(false);
                  const firstPending = scheduleList.find(n => loggedStates[n.index] === undefined || loggedStates[n.index] === 'pending');
                  if (firstPending !== undefined) {
                    handleLoggedAction(firstPending.index, 'resisted');
                  } else {
                    onUpdatePoints(userPoints + 50);
                    setLastActionMessage('تم تسجيل المقاومة بنجاح والتغلب على الرغبة! +50 نقطة 🌟');
                    playAlertSound('success');
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                قاومت بنجاح اليوم! (كسب نقاط) 💪✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast system messages */}
      <AnimatePresence>
        {lastActionMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-sky-950 text-sky-100 rounded-2xl border border-sky-800 text-xs text-right leading-loose shadow-lg font-sans"
          >
            <span>✨ {lastActionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missed / Unanswered Notifications Queue Center */}
      <AnimatePresence>
        {(() => {
          const unansweredNodes = scheduleList.filter(node => {
            const isPast = simulatedDay < actualDay || (simulatedDay === actualDay && node.secondsFromStart <= relativeUserSecondsState);
            const answered = loggedStates[node.index] === 'completed' || loggedStates[node.index] === 'resisted';
            return isPast && !answered;
          });

          if (unansweredNodes.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-5 bg-gradient-to-tr from-amber-50 to-amber-100/40 border border-amber-200 rounded-3xl shadow-sm space-y-3 relative overflow-hidden text-right"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl animate-pulse"></div>
              
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 animate-bounce">
                  <BellRing className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                    {lang === 'ar' ? 'صندوق الإشعارات الفائتة غير المجاب عليها 🔔' : 'Pending Missed Notifications Hub 🔔'}
                  </h5>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed">
                    {lang === 'ar' 
                      ? 'لديك جلسات مجدولة فائتة بانتظار إجابتك الصادقة لتسجيل نقاط عزيمتك بشكل دقيق:' 
                      : 'You have scheduled slots that are overdue. Answer them honestly to log your points correctly:'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                {unansweredNodes.map(node => (
                  <motion.div 
                    key={node.index} 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-3.5 bg-white border border-amber-100 rounded-2xl shadow-sm gap-2"
                  >
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-slate-700 block">
                        {lang === 'ar' ? `جلسة رقم ${node.index + 1}` : `Session #${node.index + 1}`}
                      </span>
                      <span className="text-[9.5px] text-amber-600 block bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-100 font-mono">
                        {lang === 'ar' ? `مجدولة عند: ${node.timeLabel}` : `Scheduled: ${node.timeLabel}`}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleLoggedAction(node.index, 'completed')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-sans font-bold cursor-pointer transition-all"
                      >
                        {lang === 'ar' ? 'تكرر 🚭' : 'Repeated 🚭'}
                      </button>
                      <button
                        onClick={() => handleLoggedAction(node.index, 'resisted')}
                        className="px-3 py-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:to-teal-600 text-white rounded-xl text-[10px] font-sans font-black flex items-center gap-0.5 cursor-pointer transition-all shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        {lang === 'ar' ? 'قاومت! 💪' : 'Resisted! 💪'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Weaning Graph & Interactive Schedule of the day */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline representation list (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4">
          
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-base font-bold text-slate-800">
              خط زمني مجدول لليوم {simulatedDay} :
            </h4>
            <span className="text-[10px] text-slate-400">
              ساعات اليقظة: {habit.wakingHourStart}:00 حتى {habit.wakingHourEnd}:00
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {isCompletelyWeaned ? (
              <div className="p-8 text-center bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-4">
                <span className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">🏆</span>
                <h5 className="font-sans font-bold text-slate-800 text-base">
                  {habit.targetDailyCount === 0 ? 'مبروك! وصلت للتوقف النهائي والحرية! 🎉' : 'مبروك! وصلت للهدف المخفض المطلوب! 🎯'}
                </h5>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                  {habit.targetDailyCount === 0 
                    ? 'في هذا اليوم من الجدول، تباعدت خوارزميات برنامج الإقلاع تماماً لتصل للمسافة التي تخرج العادة من روتين استيقاظك بالكامل. أنت بطل مستقل ذاتياً الآن!'
                    : `في هذا اليوم من الجدول، نجحت الخوارزمية في مباعدة الجلسات والوصول إلى هدفك المخفض المخطط له وهو (${habit.targetDailyCount}) مرات يومياً بمعدل صحي وآمن لجسدك وعقلك.`}
                </p>
              </div>
            ) : (
              scheduleList.map((node, idx) => {
                const state = loggedStates[node.index] || 'pending';
                const isPast = simulatedDay < actualDay || (simulatedDay === actualDay && node.secondsFromStart <= relativeUserSecondsState);
                const isUnanswered = state === 'pending' && isPast;

                return (
                  <motion.div
                    key={node.index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      state === 'resisted'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 shadow-sm shadow-emerald-500/5'
                        : state === 'completed'
                        ? 'bg-slate-50 border-slate-200 text-slate-500 line-through'
                        : isUnanswered
                        ? 'bg-amber-50/80 border-amber-200 text-slate-800 shadow-sm shadow-amber-500/5'
                        : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Dynamic State bullet indicator */}
                      <span className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        state === 'resisted'
                          ? 'bg-emerald-500 text-white'
                          : state === 'completed'
                          ? 'bg-slate-200 text-slate-500'
                          : isUnanswered
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-teal-50 text-teal-600'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs font-sans tracking-wide block">الجلسة {idx + 1}</span>
                          {isUnanswered && (
                            <span className="text-[8.5px] font-bold text-amber-700 bg-amber-100/80 border border-amber-200 px-1 py-0.5 rounded-md animate-pulse">
                              {lang === 'ar' ? 'فائت بانتظار ردك ⚠️' : 'Missed Pending ⚠️'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>يرجى ترقب النشاط عند: <strong className="font-medium text-slate-600 font-mono">{node.timeLabel}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions block to confirm each interval */}
                    <div className="flex gap-1.5">
                      {state === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleLoggedAction(node.index, 'completed')}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[10px] font-sans text-slate-600 cursor-pointer transition-colors"
                          >
                            {lang === 'ar' ? 'تكرر' : 'Repeated'}
                          </button>
                          <button
                            onClick={() => handleLoggedAction(node.index, 'resisted')}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 hover:to-teal-600 text-white text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {lang === 'ar' ? 'قاومتها! 💪' : 'Resisted! 💪'}
                          </button>
                        </>
                      ) : state === 'resisted' ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          {lang === 'ar' ? 'تمت المقاومة بنجاح 🌟' : 'Successfully resisted 🌟'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {lang === 'ar' ? 'تم تكرار الجلسة' : 'Behavior logged'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Willpower Progress Metrics dashboard panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Progress Counters summary widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4 text-slate-800">
            <h4 className="text-sm font-bold text-slate-800">حصيلة جلسات اليوم {simulatedDay}:</h4>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="block text-xl font-sans font-black text-slate-800">{allowedCountToday}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">إجمالي المجدول</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800">
                <span className="block text-xl font-sans font-black text-emerald-700">{repsResistedCount}</span>
                <span className="text-[10px] text-emerald-500 block mt-0.5">مقاومة العزم</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="block text-xl font-sans font-black text-rose-500">{repsCompletedCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">جرعات وقعت</span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-100/50 text-teal-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold leading-normal">درجة العزم اليومية:</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{ width: `${allowedCountToday ? ((repsResistedCount + (allowedCountToday - repsCompletedCount - repsResistedCount) * 0.5) / allowedCountToday) * 100 : 100}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-teal-600 block text-left">مجموع نسب المقاومة والتفادي التلقائي</span>
            </div>
          </div>

          {/* Gamified Willpower rewards */}
          <div className="bg-gradient-to-tr from-teal-900 to-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-center mb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-teal-400 block font-bold">رصيد العزيمة والمكافآت</span>
                <p className="text-2xl font-black font-sans text-teal-300">
                  {userPoints} <span className="text-xs text-slate-400">نقطة عزيمة</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-300">
              يتيح لك تسجيل تفادي وجلسات العادة كسب نقاط لرفع رتبتك في "لوحة التخطي الشجاع" والمساهمة في شحن إرادتك الفولاذية. قاوم الجلسة القادمة لكسب <strong>+50 نقطة فورية!</strong>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
