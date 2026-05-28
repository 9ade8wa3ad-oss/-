import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, ShieldAlert, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import { UserProfile, AppLang } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  lang: AppLang;
  setLang: (lang: AppLang) => void;
}

export default function AuthScreen({ onLoginSuccess, lang, setLang }: AuthScreenProps) {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneVal, setPhoneVal] = useState('');
  const [countryCode, setCountryCode] = useState('+966'); // Saudi Arabia as default
  const [emailVal, setEmailVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  // Verification states
  const [otpSent, setOtpSent] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [mockNotif, setMockNotif] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [errorText, setErrorText] = useState('');

  // Countdowns for resending OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const generateOTP = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpSent(code);
    return code;
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!nameVal.trim()) {
      setErrorText('يرجى إدخال اسمك أولاً');
      return;
    }

    if (loginMethod === 'phone') {
      if (phoneVal.length < 8) {
        setErrorText('يرجى إدخال رقم جوال صالح يتكون من 8 أرقام على الأقل');
        return;
      }
    } else {
      if (!emailVal.includes('@') || emailVal.length < 5) {
        setErrorText('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
    }

    const generated = generateOTP();
    setStep('verify');
    setCooldown(60);

    // Trigger mock notification popup
    setTimeout(() => {
      const message = loginMethod === 'phone'
        ? `💬 رسالة نصية قصيرة (SMS) إلى ${countryCode} ${phoneVal}: رمز التحقق لبرنامج الإقلاع هو: ${generated}`
        : `📧 بريد إلكتروني وارد إلى ${emailVal}: كود تفعيل حسابك في برنامج الإقلاع هو: ${generated}`;
      setMockNotif(message);
    }, 1200);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const fullInput = otpInput.join('');

    if (fullInput === otpSent || fullInput === '1234') { // Allow 1234 as developer bypass
      // Authentication success!
      const finalUser: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        phoneNumber: loginMethod === 'phone' ? `${countryCode} ${phoneVal}` : '',
        email: loginMethod === 'email' ? emailVal : '',
        name: nameVal,
        isSubscribed: false, // Default unpaid, needs to subscribe to unlock dashboard
        points: 150 // Welcome points!
      };
      
      onLoginSuccess(finalUser);
    } else {
      setErrorText('الكود الذي أدخلته غير صحيح. يرجى المحاولة مجدداً أو إعادة الإرسال.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.substring(value.length - 1); // Only keep last digit
    setOtpInput(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpInput[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const autofillOtp = () => {
    if (otpSent) {
      setOtpInput(otpSent.split(''));
      setErrorText('');
    }
  };

  const resendCode = () => {
    if (cooldown > 0) return;
    const generated = generateOTP();
    setCooldown(60);
    setOtpInput(['', '', '', '']);
    setErrorText('');
    
    const message = loginMethod === 'phone'
      ? `💬 رسالة SMS جديدة: رمز التحقق المحدث هو: ${generated}`
      : `📧 بريد إلكتروني جديد: رمز التحقق المحدث هو: ${generated}`;
    setMockNotif(message);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6" dir="rtl">
      {/* Top Banner mock push notification */}
      <AnimatePresence>
        {mockNotif && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-4 left-4 right-4 max-w-lg mx-auto bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-2 z-50 text-right backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {loginMethod === 'phone' ? 'تنبيه الرسائل القصيره المحاكي' : 'تنبيه البريد الإلكتروني المحاكي'}
            </div>
            <p className="text-sm font-sans tracking-wide leading-relaxed text-slate-100">{mockNotif}</p>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={autofillOtp}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                تعبئة تلقائية للكود ✨
              </button>
              <button
                onClick={() => setMockNotif(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1.5"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-teal-900/10 mb-4"
          >
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-slate-900 font-sans"
          >
            برنامج الإقلاع
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-2 text-sm leading-relaxed"
          >
            طريقك المنهجي المنظم للتخلص بالتدرج الذكي والمدروس من العادات والتوقف النهائي عنها.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/80 border border-slate-100/80 relative overflow-hidden"
        >
          {/* Decorative background gradients */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-60"></div>

          {step === 'input' && (
            <form onSubmit={handleSendCode} className="space-y-5 relative z-10">
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">الاسم الكريم</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الرحمن"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="w-full text-right px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-sans text-slate-800"
                />
              </div>

              {/* Toggle Login Method */}
              <div>
                <span className="block text-slate-700 font-medium text-xs mb-1.5">طريقة التحقق والمصادقة</span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('phone'); setErrorText(''); }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      loginMethod === 'phone'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    رقم الجوال
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email'); setErrorText(''); }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      loginMethod === 'email'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </button>
                </div>
              </div>

              {/* Input for selected method */}
              <AnimatePresence mode="wait">
                {loginMethod === 'phone' ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-slate-700 font-medium text-xs">رقم الجوال</label>
                    <div className="flex gap-2" dir="ltr">
                      {/* Country code selector */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 outline-none text-xs font-semibold focus:border-teal-500 focus:bg-white"
                      >
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+20">🇪🇬 +20</option>
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="501234567"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-left tracking-wider outline-none text-sm text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all font-mono"
                      />
                    </div>
                    <span className="block text-slate-400 text-[10px] text-right">أدخل رقم الجوال بدون الصفر في البداية</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-slate-700 font-medium text-xs">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)}
                        className="w-full text-left pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 outline-none text-sm focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all font-sans"
                      />
                      <Mail className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorText && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-teal-500/15 cursor-pointer text-sm font-sans"
              >
                إرسال رمز التفعيل 🚀
              </button>
            </form>
          )}

          {step === 'verify' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5 relative z-10"
            >
              <button
                onClick={() => { setStep('input'); setErrorText(''); }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mb-2"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                تعديل رقم الجوال أو البريد
              </button>

              <div className="text-center">
                <p className="text-slate-600 text-sm leading-relaxed">
                  تم إرسال كود التحقق بنجاح إلى:
                </p>
                <p className="text-slate-800 font-bold text-sm mt-1" dir="ltr">
                  {loginMethod === 'phone' ? `${countryCode} ${phoneVal}` : emailVal}
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <div className="flex gap-2 justify-center" dir="ltr">
                    {otpInput.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 bg-slate-50 border-2 border-slate-200 text-slate-800 text-center text-xl font-bold rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-sans"
                      />
                    ))}
                  </div>
                  <span className="block text-slate-400 text-xs text-center mt-3">أدخل الكود المكون من 4 أرقام</span>
                </div>

                {errorText && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs text-right"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorText}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg cursor-pointer text-sm font-sans"
                >
                  الدخول للمنصة 📱
                </button>
              </form>

              {/* Verification SMS/Email cooldown action */}
              <div className="text-center pt-2">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-400 leading-normal">
                    يمكنك طلب كود جديد بعد <span className="font-mono text-slate-600 font-bold">{cooldown}</span> ثانية
                  </p>
                ) : (
                  <button
                    onClick={resendCode}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline cursor-pointer"
                  >
                    أرسل لي كود تحقق جديد مرة أخرى
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Security Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-sans inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            تأكد من كتابة بياناتك بشكل صحيح لتلقي إشعارات الحساب بسلامة وأمان.
          </p>
        </div>
      </div>

      {/* Footer footer-credit labels hidden from terminal but high-contrast design */}
      <div className="text-center pb-2 text-[10px] text-slate-400 font-sans">
        تطبيق الإقلاع © 2026 • تخلص من عاداتك بهدوء وذكاء
      </div>
    </div>
  );
}
