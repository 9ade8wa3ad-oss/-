import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Star, Sparkles, BookOpen, Quote, Shield, Info } from 'lucide-react';

import { AppLang } from '../types';

interface MotivationalQuotesProps {
  category: 'smoking' | 'sweets' | 'coffee' | 'screens' | 'custom';
  lang: AppLang;
}

export default function MotivationalQuotes({ category, lang }: MotivationalQuotesProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'affirmations'>('tips');

  const customTips = {
    smoking: {
      title: 'مركز دعم الإقلاع عن التدخين والتبغ 🚭',
      items: [
        'قاعدة الـ ٤ تاءات (4Ds): تأجيل الاستجابة (Delay)، تنفس بعمق (Deep breathe)، تناول الماء (Drink water)، تشتيت التفكير (Do something else).',
        'الارتباط الفسيولوجي: الرغبة الملحة في النيكوتين تدوم من ٣ إلى ٥ دقائق فقط ثم تذوب تلقائياً، جدول الفواصل يساعد مستقبلات الدماغ على تخفيف التشبث بالنيكوتين.',
        'رياضة الجسد: عند الإلحاح، تحرك من جلستك لمدة دقيقتين وقم بتمارين إطالة، ستشرد الفكرة بعيداً عن تفكيرك.'
      ],
      affs: [
        'أنا أستعيد اليوم حريتي وصحة رئتي، ولم يعد النيكوتين يسيطر على خطوات تفكيري.',
        'قوة إرادتي تفوق رغبة الـ ٥ دقائق العابرة.'
      ]
    },
    sweets: {
      title: 'مركز كبح سمنة السكريات والحلويات 🍩',
      items: [
        'الماء أولاً: في كثير من الأحيان، يخلط الدماغ بين الشعور بالظمأ الشديد والشغف للسكريات. اشرب كأساً من الماء البارد فوراً قبل تكرار العادة.',
        'الموزع الذكي: تباعد الفاصل يمنع حدوث انخفاض حاد في سكر الدم (Sugar crash)، مما ينظم هرمون الإنسولين ويقلل الرغبة في التهام الحلويات.',
        'الألياف والمقدار: عند حلول موعد الجلسة المجدولة، استبدل الحلويات المصنعة بقطعة صغيرة من الفاكهة الطازجة أو القبضة البسيطة من اللوز.'
      ],
      affs: [
        'جسدي بيت محترم لا ألقي فيه إلا كل مغذٍ وطيب، وسيطرتي على سكري تمنحني طاقة ممتدة طول يومي.',
        'لذة المقاومة وبناء الرشاقة تدوم أطول من لذة قضمة السكر العابرة.'
      ]
    },
    coffee: {
      title: 'مركز الاتزان العقلي للكافيين والمنبهات ☕',
      items: [
        'البديل النشط: استبدل فنجان القهوة الزائد بشاي الأعشاب المهدئ والدافئ مثل البابونج أو النعناع البري.',
        'مباعدة الكافيين: تناول الكافيين على فترات متباعدة زمنيًا يمنع حدوث اضطرابات في مستويات الأدرينالين واليقظة المصطنعة.',
        'منع السهر: التزامك بإغلاق فترات الجدولة قبل النوم بـ ٦ ساعات يحميك من الأرق ويعزز جودة نومك الطبيعي.'
      ],
      affs: [
        'صفاء ذهني وقدرتي على التركيز نابعان من داخلي، وراحة جسدي الطبيعية هي غايتي.',
        'الالتزام بجدولي يضمن لي نوماً عميقاً وصحواً بالكامل.'
      ]
    },
    screens: {
      title: 'مركز التخفف الرقمي وإغلاق الشاشات 📱',
      items: [
        'قائمتك البديلة: جهز مسبقاً قائمة ٣ أنشطة فيزيائية تحبها (قراءة كتاب، المشي حول الغرفة، ترتيب مكتبك)، لتباشرها فور محاولتك تجنب الإمساك بالشاشة.',
        'مبدأ المباعدة: كسر الرابط التلقائي بين الملل وفتح الهاتف يعيد تهيئة الدوبامين الطبيعي بنظام إثابة حسي أكثر نقاءً.',
        'وضع الطيران الرمادي: حول إضاءة شاشتك للون الرمادي أحادي اللون لإفقاده الطابع المغري لعينيك عند وقت المباعدة.'
      ],
      affs: [
        'أنا أصنع حياتي في الواقع وليس عبر شاشات الأخرين الافتراضية، وقيمة وقتي ثمينة للغاية.',
        'الملل ليس عدواً، بل هو الفرصة لينشط عقلي ويبتكر.'
      ]
    },
    custom: {
      title: 'مركز فك الارتباط بالسلوكات غير المرغوبة ✨',
      items: [
        'التفكير المسبق: دون الأوقات التي تلح عليك فيها هذه العادة؛ ستكتشف أنها مرتبطة بمشاعر معينة (ملل، قلق، تعب). واجه هذه المشاعر مباشرة.',
        'المعادلة الذهبية: تذكر دائماً أن التباعد التدريجي الذكي يزيد فارق الدوبامين بحدود آمنة، حتى يسقط الإلحاح إلى العدم.',
        'نظام تشجيع ذاتي: تتبع تقدمك وكافئ نفسك في نهاية كل أسبوع بشيء تحبه تقديراً لالتزامك الفولاذي.'
      ],
      affs: [
        'قراراتي أصنعها بوعي تام وصبر متين، وأغادر العادة السيئة خطوة بخطوة حتى أتلاشى منها بسلام.',
        'اليوم أحسن من الأمس، ومستقبلي نقي ومشرق.'
      ]
    }
  };

  const activeContent = customTips[category] || customTips.custom;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-xl shadow-slate-200/50 space-y-4 text-slate-800" dir="rtl">
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{activeContent.title}</h4>
          <span className="text-[10px] text-slate-400">إرشادات الدعم السلوكي والمعرفي المخصصة لك</span>
        </div>
      </div>

      {/* Tabs list Toggle */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('tips')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all ${
            activeTab === 'tips'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          نصائح سلوجية 🧠
        </button>
        <button
          onClick={() => setActiveTab('affirmations')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all ${
            activeTab === 'affirmations'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          توكيدات العقل الباطن 💬
        </button>
      </div>

      <div className="min-h-[140px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'tips' ? (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {activeContent.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed text-right">
                  <span className="w-5 h-5 rounded-full bg-teal-100/70 text-teal-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-sans">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="affirmations"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {activeContent.affs.map((aff, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-tr from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/30 text-right text-xs text-teal-900 font-medium italic relative">
                  <Quote className="w-8 h-8 text-teal-600/10 absolute left-3 top-3" />
                  <p className="leading-relaxed relative z-10 font-sans">
                    " {aff} "
                  </p>
                </div>
              ))}
              
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800 flex items-start gap-1.5 leading-normal">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>قم بترديد هذه الجمل الهادئة بصوت مسموع عند شعورك بإلحاح الرغبة في تكرار العادة ليتبرمج عقلك الباطن.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
