import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck, CreditCard, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { UserProfile, AppLang } from '../types';

interface SubscriptionScreenProps {
  user: UserProfile;
  onSubscriptionSuccess: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  lang: AppLang;
  setLang: (lang: AppLang) => void;
}

export default function SubscriptionScreen({ user, onSubscriptionSuccess, onLogout, lang, setLang }: SubscriptionScreenProps) {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validations
    if (!formData.cardName.trim()) {
      setErrorMessage('يرجى كتابة اسم حامل البطاقة');
      return;
    }
    if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('رقم البطاقة المكتوب غير مكتمل');
      return;
    }
    if (formData.expiry.length < 5) {
      setErrorMessage('تاريخ انتهاء البطاقة غير صحيح');
      return;
    }
    if (formData.cvv.length < 3) {
      setErrorMessage('رمز التحقق (CVV) غير مكتمل');
      return;
    }

    setLoading(true);

    // Simulate Payment Gateway call (Charge 20 USD)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Update subscription state
      setTimeout(() => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        onSubscriptionSuccess({
          ...user,
          isSubscribed: true,
          subscriptionExpiry: nextYear.toISOString(),
          points: user.points + 500 // Subscribe reward points!
        });
      }, 1500);
    }, 2500);
  };

  const benefits = [
    'الموزع الذكي للفترات اليومية وفق ساعات يقظتك الخاصة.',
    'خيار الإقلاع البطيء المخصص للإدمان القوي (إضافة ١٥ ثانية يومياً).',
    'خيار الإقلاع السريع للمحفزات والسلوكيات (إضافة ٥ دقائق يومياً).',
    'نظام تنبيهات ذكي ومجرب بالبريد أو من خلال المتصفح.',
    'تقارير ورسوم بيانية متكاملة تتنبأ بمسار توقفك النهائي.',
    'محتوى إرشادي نفسي متخصص مخصص لنوع عادتك مجاناً.'
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col justify-center" dir="rtl">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Summary and benefits */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-6 bg-slate-900 text-slate-100 p-6 sm:p-10 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden"
        >
          {/* Ambient glow decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              الاشتراك الذهبي المميز
            </span>
            
            <h2 className="text-3xl font-bold tracking-tight mb-2">امتلك زمام عاداتك اليوم</h2>
            <p className="text-slate-400 text-sm mb-8">اشترك الآن في برنامج الإقلاع لفك القيود والتخلص التدريجي العلمي والنهائي والاستفادة من كافة خصائص الخوارزمية.</p>
            
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-normal">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[10px] text-slate-500">القيمة السنوية المستحقة</p>
              <p className="text-2xl font-bold text-white font-sans">
                20 <span className="text-xs text-slate-400">دولار أمريكي / سنوياً</span>
              </p>
            </div>
            
            <button
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              تسجيل الخروج
            </button>
          </div>
        </motion.div>

        {/* Right Side: Credit card secure entry */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between"
        >
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-auto text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">تم الدفع بنجاح! 🎉</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                أهلاً بك يا <strong>{user.name}</strong> في العضوية الذهبية للبرنامج. نقوم حالياً بتحضير ملفك وبدء لوحة التحكم الذكية...
              </p>
              <div className="flex justify-center items-center gap-2 text-slate-400 text-xs pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                جاري توجيهك الآن
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">بوابة الدفع الإلكتروني الأمنة</h3>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-6 h-4 bg-slate-100 rounded text-[8px] font-sans font-black flex items-center justify-center text-slate-400">VISA</span>
                  <span className="w-6 h-4 bg-slate-100 rounded text-[8px] font-sans font-black flex items-center justify-center text-slate-400">MADA</span>
                  <span className="w-6 h-4 bg-slate-100 rounded text-[8px] font-sans font-black flex items-center justify-center text-slate-400">MC</span>
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">الاسم المكتوب على البطاقة</label>
                <input
                  type="text"
                  required
                  placeholder="ABDULRAHMAN AL-MUTAIRI"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-sans text-sm tracking-wide"
                />
              </div>

              {/* Number */}
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">رقم بطاقة الائتمان</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full text-left pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-mono text-sm tracking-widest text-slate-800"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Exp date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium text-xs mb-1.5">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                    className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-mono text-sm tracking-widest text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium text-xs mb-1.5">رمز الأمان (CVV)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none font-mono text-sm tracking-widest text-slate-800"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 rotate-180" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Secure statement */}
              <div className="bg-slate-50 p-3 rounded-2xl flex items-start gap-2.5 border border-slate-100 text-[11px] text-slate-500 leading-normal">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>الدفع آمن ومحمي ومحاكي للتجربة بنسبة 100%. لن يتم سحب أي أموال حقيقية من بطاقتك الائتمانية الفعلية.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 active:scale-[0.99] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري معالجة الدفع الآمن...
                  </>
                ) : (
                  <>
                    تأكيد دفع 20 دولار والاشتراك السنوي 💳
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <div className="text-center mt-8 text-[11px] text-slate-400">
        تطبيق الإقلاع ومزود الدفع الآمن المحاكي • تشفير طبقة المنافذ الآمنة SSL 256-bit
      </div>
    </div>
  );
}
