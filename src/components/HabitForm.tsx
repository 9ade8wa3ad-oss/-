import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToggleLeft, ToggleRight, Sparkles, Plus, Info, Clock, Check, BellRing, Music, Volume2, Upload, AlertCircle, Eye, ShieldCheck, Heart } from 'lucide-react';
import { Habit, WeaningSpeed, PredefinedTone, NotificationSettings } from '../types';
import { translations } from '../utils/translations';

interface HabitFormProps {
  onAddHabit: (habit: Habit) => void;
  lang: 'ar' | 'en';
}

export default function HabitForm({ onAddHabit, lang }: HabitFormProps) {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'smoking' | 'sweets' | 'coffee' | 'screens' | 'custom'>('smoking');
  const [currentDailyCount, setCurrentDailyCount] = useState<number>(10);
  const [targetDailyCount, setTargetDailyCount] = useState<number>(0);
  
  // Hours selection: start & end of waking day
  const [wakingStart, setWakingStart] = useState<number>(8); // 8:00 AM
  const [wakingEnd, setWakingEnd] = useState<number>(22); // 10:00 PM

  const [speed, setSpeed] = useState<WeaningSpeed>('slow');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('30');

  // Custom Notification Customization Block States & Sleep/Bypass preferences
  const [soundTone, setSoundTone] = useState<PredefinedTone>('gentle_bell');
  const [customSoundName, setCustomSoundName] = useState<string>('');
  const [dndEnabled, setDndEnabled] = useState<boolean>(false);
  const [dndStartHour, setDndStartHour] = useState<number>(13); // 1:00 PM
  const [dndEndHour, setDndEndHour] = useState<number>(15); // 3:00 PM
  const [dndEmergencyBypass, setDndEmergencyBypass] = useState<boolean>(true);
  const [showNotifCustomization, setShowNotifCustomization] = useState<boolean>(false);

  // High intensity sleepers notification overrides
  const [volumeBoost, setVolumeBoost] = useState<'normal' | 'high' | 'extreme'>('high');
  const [sleepBypassEnabled, setSleepBypassEnabled] = useState<boolean>(true);
  const [drawOverAppsEnabled, setDrawOverAppsEnabled] = useState<boolean>(true);
  const [vibrationPattern, setVibrationPattern] = useState<'none' | 'pulse' | 'continuous'>('continuous');
  const [overlayGranted, setOverlayGranted] = useState<boolean>(false);

  // File Upload states (with drag and drop target)
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { key: 'smoking', label: `🚭 ${t.smokingCategoryName}`, defaultName: lang === 'ar' ? 'التدخين (سجائر/فيب)' : 'Smoking (cigarettes/vape)' },
    { key: 'sweets', label: `🍩 ${t.sweetsCategoryName}`, defaultName: lang === 'ar' ? 'تناول السكريات المضافة' : 'Consuming Added Sugars' },
    { key: 'coffee', label: `☕ ${t.coffeeCategoryName}`, defaultName: lang === 'ar' ? 'شرب القهوة الزائدة' : 'Drinking Excess Coffee' },
    { key: 'screens', label: `📱 ${t.screensCategoryName}`, defaultName: lang === 'ar' ? 'تصفح الجوال بلا هدف' : 'Mindless Phone Browsing' },
    { key: 'custom', label: `✨ ${t.customCategoryName}`, defaultName: lang === 'ar' ? 'العادة المخصصة' : 'Custom Habit Behavioral Loop' }
  ];

  const tonesList = [
    { key: 'gentle_bell', label: t.gentle_bell, desc: t.gentle_bell_desc },
    { key: 'digital_beep', label: t.digital_beep, desc: t.digital_beep_desc },
    { key: 'zen_bowl', label: t.zen_bowl, desc: t.zen_bowl_desc },
    { key: 'chirp_melody', label: t.chirp_melody, desc: t.chirp_melody_desc },
    { key: 'extreme_loud_siren', label: t.extreme_loud_siren, desc: t.extreme_loud_siren_desc },
    { key: 'thunderbolt_pulse', label: t.thunderbolt_pulse, desc: t.thunderbolt_pulse_desc },
  ];

  const handleCategorySelect = (catKey: typeof category, defaultName: string) => {
    setCategory(catKey);
    setName(defaultName);
  };

  const playPreviewSound = (tone: PredefinedTone, overrideVolume?: typeof volumeBoost) => {
    try {
      const activeVolume = overrideVolume || volumeBoost;
      // Gain multiplier based on chosen volume boost preference
      let volMultiplier = 1.0;
      if (activeVolume === 'high') {
        volMultiplier = 1.6;
      } else if (activeVolume === 'extreme') {
        volMultiplier = 2.6; // High gain boost for heavy sleepers overriding quiet modes of phone!
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tone === 'gentle_bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (tone === 'digital_beep') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (tone === 'zen_bowl') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(144, audioCtx.currentTime); // Deep hum
        gain.gain.setValueAtTime(0.4 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } else if (tone === 'chirp_melody') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1300, audioCtx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.15 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (tone === 'extreme_loud_siren') {
        // rapid, piercing oscillating siren sound to guarantee waking up sleep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.4);
        osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);
      } else if (tone === 'thunderbolt_pulse') {
        // High-pitch harsh square wave pulse
        osc.type = 'square';
        osc.frequency.setValueAtTime(1600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(1600, audioCtx.currentTime + 0.3);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.25 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else {
        // Mock custom file audio tone (triangle wave)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2 * volMultiplier, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio preview block', e);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setCustomSoundName(file.name);
      setSoundTone('custom_uploaded');
      playPreviewSound('custom_uploaded');
    } else {
      alert(t.invalidAudioFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const currentNotificationSettings: NotificationSettings = {
      soundTone,
      customSoundName: soundTone === 'custom_uploaded' ? (customSoundName || (lang === 'ar' ? 'صوت مخصص مرفوع' : 'Custom Uploaded Sound')) : undefined,
      dndEnabled,
      dndStartHour: dndEnabled ? dndStartHour : 0,
      dndEndHour: dndEnabled ? dndEndHour : 0,
      dndEmergencyBypass,
      volumeBoost,
      sleepBypassEnabled,
      drawOverAppsEnabled,
      vibrationPattern
    };

    const newHabit: Habit = {
      id: 'habit_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      category,
      currentDailyCount,
      targetDailyCount: Math.min(targetDailyCount, currentDailyCount - 1), // target must be less than current
      wakingHourStart: wakingStart,
      wakingHourEnd: wakingEnd,
      speed,
      durationDays,
      createdAt: new Date().toISOString(),
      dayCount: 1, // begins on Day 1
      resistedCount: 0,
      completedIntervalCount: 0,
      totalAlarmsTriggered: 0,
      adheredAlarmsCount: 0,
      notificationSettings: currentNotificationSettings,
      logs: [] // starts empty
    };

    onAddHabit(newHabit);
  };

  const getWakingHoursText = () => {
    const hours = wakingEnd <= wakingStart ? (wakingEnd + 24) - wakingStart : wakingEnd - wakingStart;
    if (lang === 'ar') {
      return `ساعات اليقظة المحددة: ${hours} ساعة يومياً (من الساعة ${wakingStart}:00 حتى ${wakingEnd}:00).`;
    } else {
      return `Selected waking hours: ${hours} hours daily (from ${wakingStart}:00 to ${wakingEnd}:00).`;
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/80 shadow-xl shadow-slate-200/50 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Upper header Info */}
      <div className={`flex items-center gap-3 mb-6 ${lang === 'ar' ? 'flex-row' : 'flex-row'}`}>
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">{t.formTitle}</h3>
          <p className="text-slate-500 text-xs">{t.formDesc}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Category presets */}
        <div>
          <label className="block text-slate-700 font-bold text-xs mb-2">{t.habitCategory}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key as any, cat.defaultName)}
                className={`py-3 px-4 rounded-2xl text-xs font-semibold cursor-pointer border transition-all flex items-center justify-between ${lang === 'ar' ? 'text-right' : 'text-left'} ${
                  category === cat.key
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {category === cat.key && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-slate-700 font-bold text-xs mb-1.5">{t.habitNameLabel}</label>
          <input
            type="text"
            required
            placeholder={t.habitNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-sans text-sm text-slate-800 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
          />
        </div>

        {/* Quantities slider or numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">{t.currentDailyLabel}</label>
            <p className="text-[10px] text-slate-400 mb-2">{t.currentDailyDesc}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={50}
                value={currentDailyCount}
                onChange={(e) => setCurrentDailyCount(Number(e.target.value))}
                className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="w-16 shrink-0 text-center bg-teal-50 border border-teal-100 text-teal-700 font-bold font-sans text-xs px-2.5 py-1.5 rounded-xl">
                {currentDailyCount} {t.times}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">{t.targetDailyLabel}</label>
            <p className="text-[10px] text-slate-400 mb-2">{t.targetDailyDesc}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Math.max(0, currentDailyCount - 1)}
                value={targetDailyCount}
                onChange={(e) => setTargetDailyCount(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="w-16 shrink-0 text-center bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold font-sans text-xs px-2.5 py-1.5 rounded-xl">
                {targetDailyCount === 0 ? t.quitText : `${targetDailyCount} ${t.times}`}
              </span>
            </div>
          </div>
        </div>

        {/* Active waking hours */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{t.wakingHoursLabel}</span>
          </div>
          <p className="text-[10px] text-slate-400">{t.wakingHoursDesc}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">{t.wakingStartHour}</label>
              <select
                value={wakingStart}
                onChange={(e) => setWakingStart(Number(e.target.value))}
                className={`w-full py-2 px-3 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 outline-none ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <option key={h} value={h}>{t.hour} {h}:00 {t.wakingAm}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">{t.wakingEndHour}</label>
              <select
                value={wakingEnd}
                onChange={(e) => setWakingEnd(Number(e.target.value))}
                className={`w-full py-2 px-3 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 outline-none ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {[19, 20, 21, 22, 23, 0, 1].map((h) => {
                  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  const ampmLabel = h >= 12 || h === 0 ? t.wakingPm : t.wakingPmFajr;
                  return (
                    <option key={h} value={h}>{t.hour} {displayH}:00 {ampmLabel}</option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="text-[10px] bg-sky-50 text-sky-800 p-2.5 rounded-xl border border-sky-100 flex items-start gap-1.5 leading-relaxed font-sans mt-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-pulse" />
            <span>{getWakingHoursText()} {t.wakingAlertText}</span>
          </div>
        </div>

        {/* Weaning Speeds / Plan Duration (THE DYNAMIC NEW SELECTION) */}
        <div>
          <label className="block text-slate-700 font-bold text-xs mb-1">{t.durationLabel}</label>
          <p className="text-[10px] text-slate-400 mb-3">{t.durationDesc}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            {[
              { days: 15, title: t.durationOpt1, desc: t.durationOpt1Desc },
              { days: 30, title: t.durationOpt2, desc: t.durationOpt2Desc },
              { days: 45, title: t.durationOpt3, desc: t.durationOpt3Desc },
              { days: 60, title: t.durationOpt4, desc: t.durationOpt4Desc },
              { days: 90, title: t.durationOpt5, desc: t.durationOpt5Desc },
              { days: 120, title: t.durationOpt6, desc: t.durationOpt6Desc }
            ].map((p) => (
              <button
                type="button"
                key={p.days}
                onClick={() => {
                  setDurationDays(p.days);
                  setCustomDuration(String(p.days));
                }}
                className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  durationDays === p.days
                    ? 'border-teal-500 bg-teal-50/30 shadow-sm shadow-teal-500/5 text-teal-900 font-bold'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold">{p.title}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-normal">{p.desc}</span>
              </button>
            ))}
          </div>

          {/* Custom Duration Slider */}
          <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700">{t.customDurationLabel}</span>
              <span className="text-xs font-bold text-teal-600 font-sans bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100">
                {durationDays} {t.daysText}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={7}
                max={180}
                value={durationDays}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDurationDays(val);
                  setCustomDuration(String(val));
                }}
                className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 w-16 text-left shrink-0">{t.maxDaysText}</span>
            </div>

            {/* Micro-math explanation to make it feel extremely advanced and tailored */}
            <div className="mt-3 pt-3 border-t border-slate-200/50 flex flex-col gap-1 text-[10px] text-slate-500 leading-relaxed font-sans">
              <div className="flex justify-between">
                <span>{t.initialGapText}</span>
                <span className="font-bold text-slate-700 font-sans">
                  {(() => {
                    const wakingHours = wakingEnd <= wakingStart ? (wakingEnd + 24) - wakingStart : wakingEnd - wakingStart;
                    return Math.round((wakingHours * 3600 / currentDailyCount) / 60);
                  })()} {t.minutesBetween}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.targetGapText.replace('{day}', String(durationDays))}</span>
                <span className="font-bold text-emerald-600 font-sans text-xs">
                  {(() => {
                    const wakingHours = wakingEnd <= wakingStart ? (wakingEnd + 24) - wakingStart : wakingEnd - wakingStart;
                    return targetDailyCount === 0 
                      ? t.completeQuitText.replace('{hours}', String(wakingHours))
                      : `${Math.round((wakingHours * 3600 / targetDailyCount) / 60)} ${t.minutesBetween}`;
                  })()}
                </span>
              </div>
              <div className="text-[9.5px] text-teal-700 mt-1.5 font-sans">
                {(() => {
                  const wakingSec = (wakingEnd <= wakingStart ? (wakingEnd + 24) - wakingStart : wakingEnd - wakingStart) * 3600;
                  const sInt = wakingSec / currentDailyCount;
                  const tInt = targetDailyCount === 0 ? wakingSec * 1.25 : wakingSec / targetDailyCount;
                  const dailyInc = (tInt - sInt) / Math.max(1, durationDays - 1);
                  const incStr = dailyInc < 60 
                    ? `${Math.round(dailyInc)} ${t.secondsDaily}` 
                    : `${Math.round(dailyInc / 6) / 10} ${t.minutesDaily}`;
                  return t.algorithmIncText.replace('{inc}', incStr);
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* --- CUSTOMIZATIONS FOR NOTIFICATIONS SECTION (NEW FEATURE!) --- */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/20">
          <button
            type="button"
            onClick={() => setShowNotifCustomization(!showNotifCustomization)}
            className="w-full text-right py-4 px-5 bg-slate-50 hover:bg-slate-100/50 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <BellRing className="w-4.5 h-4.5 animate-bounce" />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">{t.notifCustomizationHeader}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t.notifCustomizationSub}</span>
              </div>
            </div>
            <span className="text-xl text-slate-400 font-sans leading-none">{showNotifCustomization ? '−' : '+'}</span>
          </button>

          <AnimatePresence>
            {showNotifCustomization && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 p-5 space-y-5"
              >
                {/* Predefined Alert Tones Selector */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-3 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.soundToneLabel}</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tonesList.map((tone) => (
                      <button
                        type="button"
                        key={tone.key}
                        onClick={() => {
                          setSoundTone(tone.key as PredefinedTone);
                          playPreviewSound(tone.key as PredefinedTone);
                        }}
                        className={`p-3 rounded-xl block border transition-all relative ${lang === 'ar' ? 'text-right' : 'text-left'} ${
                          soundTone === tone.key
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className="text-xs font-bold leading-none">{tone.label}</span>
                          <Volume2 className={`w-4 h-4 ${soundTone === tone.key ? 'text-teal-400' : 'text-slate-400'}`} />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1 pointer-events-none leading-normal">
                          {tone.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ADVANCED PHONE NOTIFICATIONS INTENSITY OVERRIDES (Requested by user) */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-teal-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t.volumeBoostLabel}</span>
                  </h4>

                  {/* Volume amplification level */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'normal', label: t.volumeNormal, boost: 'normal' },
                      { key: 'high', label: t.volumeHigh, boost: 'high' },
                      { key: 'extreme', label: t.volumeExtreme, boost: 'extreme' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => {
                          setVolumeBoost(item.boost as any);
                          playPreviewSound(soundTone, item.boost as any);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          volumeBoost === item.key
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black scale-102'
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Vibration selection */}
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5">{t.vibrationPatternLabel}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'none', label: t.vibNone },
                        { key: 'pulse', label: t.vibPulse },
                        { key: 'continuous', label: t.vibContinuous }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => {
                            setVibrationPattern(item.key as any);
                            if (item.key !== 'none' && navigator.vibrate) {
                              navigator.vibrate(item.key === 'pulse' ? [120, 80, 120] : 400);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            vibrationPattern === item.key
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sleep bypass toggle checkbox (Emergency override) */}
                  <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-2 mt-2 text-right">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="sleep_bypass_toggle"
                          type="checkbox"
                          checked={sleepBypassEnabled}
                          onChange={(e) => setSleepBypassEnabled(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-amber-500"
                        />
                        <label htmlFor="sleep_bypass_toggle" className={`text-[11px] text-slate-700 select-none cursor-pointer leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <strong>{t.sleepBypassLabel}</strong>
                          <span className="block text-[10px] text-slate-500 mt-1">{t.sleepBypassDesc}</span>
                        </label>
                      </div>
                    </div>
                    {sleepBypassEnabled && (
                      <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-sans leading-relaxed">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{t.sleepOverrideActive}</span>
                      </div>
                    )}
                  </div>

                  {/* Screen overlay draw-over toggle checkbox */}
                  <div className="bg-teal-50/30 border border-teal-100 p-4 rounded-2xl space-y-2.5 mt-2 text-right">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="draw_over_apps_toggle"
                          type="checkbox"
                          checked={drawOverAppsEnabled}
                          onChange={(e) => setDrawOverAppsEnabled(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-teal-600"
                        />
                        <label htmlFor="draw_over_apps_toggle" className={`text-[11px] text-slate-700 select-none cursor-pointer leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <strong>{t.drawOverAppsLabel}</strong>
                          <span className="block text-[10px] text-slate-500 mt-1">{t.drawOverAppsDesc}</span>
                        </label>
                      </div>
                    </div>

                    {drawOverAppsEnabled && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setOverlayGranted(true);
                            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                          }}
                          className={`w-full text-center py-2 px-3 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all border ${
                            overlayGranted
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white hover:bg-teal-50 border-teal-200 text-teal-800'
                          }`}
                        >
                          {overlayGranted ? t.overlayPermissionGranted : t.setupOverlayBtn}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Custom Audio File (Drag & Drop or Manual selection) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-bold text-xs">{t.customFileInputLabel}</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px] ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : soundTone === 'custom_uploaded'
                        ? 'border-teal-500 bg-teal-50/20'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="audio/*"
                      className="hidden"
                    />
                    <Upload className={`w-7 h-7 mb-2 ${soundTone === 'custom_uploaded' ? 'text-teal-600' : 'text-slate-400'}`} />
                    
                    <span className="text-xs font-bold text-slate-700 mb-1 block">
                      {soundTone === 'custom_uploaded' && customSoundName
                        ? `${t.customFileActive} ${customSoundName}`
                        : t.customFilePlaceholder}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.customFileRules}</span>
                  </div>
                </div>

                {/* Do Not Disturb (DND) Hours System */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">{t.dndLabel}</span>
                    </div>
                    
                    {/* Switch Toggle (with 44px+ touch target area size) */}
                    <button
                      type="button"
                      onClick={() => setDndEnabled(!dndEnabled)}
                      className="w-12 h-10 flex items-center justify-center p-1 bg-transparent hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${dndEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${dndEnabled ? 'left-5' : 'left-1'}`} />
                      </div>
                    </button>
                  </div>

                  {dndEnabled && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-2 border-t border-slate-200/50"
                    >
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        {t.dndDesc}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">{t.dndStartLabel}</label>
                          <select
                            value={dndStartHour}
                            onChange={(e) => setDndStartHour(Number(e.target.value))}
                            className={`w-full py-2 px-3 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 outline-none ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                          >
                            {Array.from({ length: 24 }).map((_, h) => {
                              const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                              const ampm = h >= 12 ? t.wakingPm : t.wakingAm;
                              return (
                                <option key={h} value={h}>{t.hour} {displayH}:00 {ampm}</option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">{t.dndEndLabel}</label>
                          <select
                            value={dndEndHour}
                            onChange={(e) => setDndEndHour(Number(e.target.value))}
                            className={`w-full py-2 px-3 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 outline-none ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                          >
                            {Array.from({ length: 24 }).map((_, h) => {
                              const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                              const ampm = h >= 12 ? t.wakingPm : t.wakingAm;
                              return (
                                <option key={h} value={h}>{t.hour} {displayH}:00 {ampm}</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Emergency bypass toggle checkbox (Emergency override) */}
                      <div className="flex items-start gap-2.5 pt-2">
                        <input
                          id="emergency_toggle"
                          type="checkbox"
                          checked={dndEmergencyBypass}
                          onChange={(e) => setDndEmergencyBypass(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-teal-600"
                        />
                        <label htmlFor="emergency_toggle" className={`text-[11px] text-slate-600 select-none cursor-pointer leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <strong>{t.dndBypassLabel}</strong>
                          <span className="block text-[10px] text-slate-400 mt-1">{t.dndBypassDesc}</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          {t.formSubmitBtn}
        </button>

      </form>
    </div>
  );
}
