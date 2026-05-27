import { motion } from "motion/react";

interface NutrientGaugeBarProps {
  name: string;
  value: number;
  target: number;
  unit: string;
}

export default function NutrientGaugeBar({ name, value, target, unit }: NutrientGaugeBarProps) {
  // Guard division by zero
  const safeTarget = target || 1;
  const percentage = Math.round((value / safeTarget) * 100);
  
  // Determine status and colors
  let status: '부족' | '적절' | '초과' = '적절';
  let colorClass = 'bg-[#2ECC71]'; // Optimum Toss Green
  let textColorClass = 'text-[#2ECC71]';
  let badgeBg = 'bg-[#E8F8F0]';
  
  if (percentage < 80) {
    status = '부족';
    colorClass = 'bg-[#FFD400]'; // Toss Yellow
    textColorClass = 'text-[#E6B800]';
    badgeBg = 'bg-[#FFF9D4]';
  } else if (percentage > 120) {
    status = '초과';
    colorClass = 'bg-[#F04452]'; // Toss Coral Red
    textColorClass = 'text-[#F04452]';
    badgeBg = 'bg-[#FEECEE]';
  }

  // Cap width at 100% for visual sanity, but still display actual excess text
  const barWidth = Math.min(percentage, 100);

  return (
    <div className="mb-4 group" id={`gauge-${name}`}>
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#191F28]">{name}</span>
          <span className="text-xs text-[#8B95A1] font-semibold">
            {value.toLocaleString()}/{target.toLocaleString()}{unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#4E5968] font-mono">{percentage}%</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeBg} ${textColorClass}`}>
            {status} ({percentage}%)
          </span>
        </div>
      </div>
      
      {/* Absolute Gauge Track */}
      <div className="w-full bg-[#F2F4F6] rounded-full h-3 overflow-hidden border border-transparent relative">
        <div className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none">
          {percentage > 100 && (
            <span className="text-[9px] font-bold text-[#F04452] animate-pulse bg-white/95 rounded px-1.5 shadow-sm">
              +{percentage - 100}% 초과
            </span>
          )}
        </div>
        
        <motion.div
          id={`gauge-progress-${name}`}
          className={`h-full rounded-full transition-colors duration-300 ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
