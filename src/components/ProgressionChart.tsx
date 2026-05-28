import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, HelpCircle, Activity, Target } from 'lucide-react';
import { Habit, AppLang } from '../types';

interface ProgressionChartProps {
  habit: Habit;
  lang: AppLang;
}

export default function ProgressionChart({ habit, lang }: ProgressionChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; count: number; x: number; y: number } | null>(null);

  const wakingStartHour = habit.wakingHourStart;
  const wakingEndHour = habit.wakingHourEnd;
  const wakingHoursTotal = wakingEndHour <= wakingStartHour 
    ? (wakingEndHour + 24) - wakingStartHour 
    : wakingEndHour - wakingStartHour;
  const wakingSecondsTotal = wakingHoursTotal * 3600;
  
  const startingDailyCount = habit.currentDailyCount;
  const targetDailyCount = habit.targetDailyCount;
  const durationDays = habit.durationDays || 30;

  const dayDiff = Math.max(1, durationDays - 1);

  // Generate dynamic duration days projection array based on smooth linear decline
  const projectionData = Array.from({ length: durationDays }, (_, index) => {
    const d = index + 1;
    const dayIndex = Math.min(d, durationDays);
    const exactDailyCount = startingDailyCount - ((dayIndex - 1) * (startingDailyCount - targetDailyCount)) / dayDiff;
    const allowed = Math.max(targetDailyCount, Math.round(exactDailyCount));
    return {
      day: d,
      count: allowed,
    };
  });

  // Plot variables for SVG rendering (viewbox: 500 x 200)
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 500;
  const chartHeight = 200;

  const getCoordinates = (day: number, count: number) => {
    // x spans 1 to durationDays -> mapped to paddingX to (chartWidth - paddingX)
    const x = paddingX + ((day - 1) / Math.max(1, durationDays - 1)) * (chartWidth - 2 * paddingX);
    
    // y spans 0 to maxStartingReps -> mapped to (chartHeight - paddingY) to paddingY
    const maxReps = Math.max(10, startingDailyCount);
    const y = (chartHeight - paddingY) - (count / maxReps) * (chartHeight - 2 * paddingY);
    
    return { x, y };
  };

  // Generate SVG path string d
  let pathString = '';
  projectionData.forEach((pt, index) => {
    const { x, y } = getCoordinates(pt.day, pt.count);
    if (index === 0) {
      pathString += `M ${x} ${y}`;
    } else {
      pathString += ` L ${x} ${y}`;
    }
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-xl shadow-slate-200/50 space-y-5" dir="rtl">
      
      {/* Header and Title */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">التنبؤ التنازلي التلقائي لمرات تكرار العادة</h4>
            <span className="text-[10px] text-slate-400">منحنى تقليص التكرار تدريجياً على طول {durationDays} يوماً</span>
          </div>
        </div>
        
        <div className="text-left">
          <span className="text-[10px] bg-slate-100 text-slate-600 block px-2.5 py-1 rounded-lg font-sans font-bold">
            مؤشر ذكي ومباعدة بطيئة
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart container */}
      <div className="relative w-full overflow-x-auto bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[450px] overflow-visible"
        >
          {/* Grid lines inside chart */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const maxReps = Math.max(10, startingDailyCount);
            const val = Math.round(maxReps * ratio);
            const y = (chartHeight - paddingY) - ratio * (chartHeight - 2 * paddingY);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  className="fill-slate-400 font-sans"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradients fill */}
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* SVG path fill */}
          <path
            d={`${pathString} L ${getCoordinates(durationDays, 0).x} ${chartHeight - paddingY} L ${getCoordinates(1, 0).x} ${chartHeight - paddingY} Z`}
            fill="url(#chartGlow)"
          />

          {/* Core path stroke line */}
          <motion.path
            d={pathString}
            fill="none"
            stroke="#0d9488"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Circular pointer dots */}
          {projectionData.map((pt, index) => {
            const { x, y } = getCoordinates(pt.day, pt.count);
            // Highlight specific key days dynamically
            const step = Math.max(1, Math.round((durationDays - 1) / 6));
            const highlights = Array.from({ length: 7 }, (_, i) => {
              if (i === 0) return 1;
              if (i === 6) return durationDays;
              return Math.min(durationDays - 1, 1 + i * step);
            });
            const uniqueMilestones = Array.from(new Set(highlights));
            const isMilestone = uniqueMilestones.includes(pt.day);
            
            return (
              <g key={pt.day}>
                <circle
                  cx={x}
                  cy={y}
                  r={isMilestone ? 4.5 : 2.5}
                  className={`cursor-pointer transition-all ${
                    isMilestone 
                      ? 'fill-white stroke-teal-600 stroke-2' 
                      : 'fill-teal-500 hover:fill-teal-600'
                  }`}
                  onMouseEnter={() => setHoveredPoint({ day: pt.day, count: pt.count, x, y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {isMilestone && (
                  <text
                    x={x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="8"
                    className="fill-slate-500 font-mono"
                  >
                    يوم {pt.day}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip Overlay inside SVG */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.max(10, Math.min(chartWidth - 95, hoveredPoint.x - 47))}
                y={hoveredPoint.y - 32}
                width="95"
                height="22"
                rx="6"
                className="fill-slate-900 stroke-teal-500 stroke-1"
              />
              <text
                x={Math.max(57, Math.min(chartWidth - 47, hoveredPoint.x))}
                y={hoveredPoint.y - 18}
                textAnchor="middle"
                fontSize="8.5"
                className="fill-slate-100 font-sans font-bold"
              >
                اليوم {hoveredPoint.day}: {hoveredPoint.count} تكرارات
              </text>
              <line
                x1={hoveredPoint.x}
                y1={hoveredPoint.y - 10}
                x2={hoveredPoint.x}
                y2={hoveredPoint.y}
                stroke="#14b8a6"
                strokeWidth="1"
              />
            </g>
          )}

        </svg>
      </div>

      {/* Under chart captions info */}
      <div className="grid grid-cols-2 gap-3 text-right">
        <div className="p-3 bg-slate-50 rounded-2xl flex items-start gap-2 border border-slate-100">
          <Activity className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">نقطة انطلاقك (بداية الخطة)</span>
            <span className="text-xs font-bold text-slate-700 font-sans">{startingDailyCount} تكرارات متباعدة</span>
          </div>
        </div>
        
        <div className="p-3 bg-emerald-50 rounded-2xl flex items-start gap-2 border border-emerald-100">
          <Target className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] text-emerald-600 block">هدفك المستقبلي (نهاية الخطة)</span>
            <span className="text-xs font-bold text-emerald-800 font-sans">
              {habit.targetDailyCount === 0 ? 'توقف بالكامل (0)' : `${habit.targetDailyCount} تكرار فقط`}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[9px] text-slate-400 font-sans text-center">
        💡 اسحب شريط اليوم في المحاكي العلوي لموائمة الجدول الفعلي بالتوازي مع المباعدة التدريجية المتوقعة وتثبيت التغيرات الفسلجية.
      </p>

    </div>
  );
}
