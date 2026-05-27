import { ChangeEvent } from "react";
import { BodyMetrics, HealthSummary } from "../types";
import { Activity, Dumbbell, Flame, Heart } from "lucide-react";

interface BodyMetricsCardProps {
  metrics: BodyMetrics;
  onMetricsChange: (metrics: BodyMetrics) => void;
  healthSummary: HealthSummary;
}

export default function BodyMetricsCard({ metrics, onMetricsChange, healthSummary }: BodyMetricsCardProps) {
  const gender = metrics.gender || "male";
  const ageGroup = metrics.ageGroup || "20s";

  const handleInputChange = (field: keyof BodyMetrics) => (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onMetricsChange({
      ...metrics,
      [field]: val
    });
  };

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all mb-6" id="body-metrics-card">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-[#E8F8F0] rounded-xl text-[#2ECC71]">
          <Activity size={20} className="stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold text-[#191F28] tracking-tight">신체 지표 설정</h2>
      </div>

      {/* 2025 KDRI Gender and Age selections */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-5 border-b border-[#E5E8EB]">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B95A1] font-bold uppercase tracking-wider">성별 기준</label>
          <div className="grid grid-cols-2 bg-[#F2F4F6] p-1 rounded-xl">
            <button
              type="button"
              id="btn-gender-male"
              onClick={() => onMetricsChange({ ...metrics, gender: "male" })}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                gender === "male"
                  ? "bg-[#2ECC71] text-white shadow-sm"
                  : "text-[#4E5968] hover:text-[#191F28]"
              }`}
            >
              남성
            </button>
            <button
              type="button"
              id="btn-gender-female"
              onClick={() => onMetricsChange({ ...metrics, gender: "female" })}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                gender === "female"
                  ? "bg-[#2ECC71] text-white shadow-sm"
                  : "text-[#4E5968] hover:text-[#191F28]"
              }`}
            >
              여성
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B95A1] font-bold uppercase tracking-wider">연령대 기준</label>
          <div className="grid grid-cols-2 bg-[#F2F4F6] p-1 rounded-xl">
            <button
              type="button"
              id="btn-age-20s"
              onClick={() => onMetricsChange({ ...metrics, ageGroup: "20s" })}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                ageGroup === "20s"
                  ? "bg-[#2ECC71] text-white shadow-sm"
                  : "text-[#4E5968] hover:text-[#191F28]"
              }`}
            >
              20대 (19-29세)
            </button>
            <button
              type="button"
              id="btn-age-30s"
              onClick={() => onMetricsChange({ ...metrics, ageGroup: "30s" })}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                ageGroup === "30s"
                  ? "bg-[#2ECC71] text-white shadow-sm"
                  : "text-[#4E5968] hover:text-[#191F28]"
              }`}
            >
              30대 (30-49세)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#8B95A1] font-semibold uppercase tracking-wider">키 (cm)</label>
          <input
            id="input-height"
            type="number"
            value={metrics.height || ""}
            onChange={handleInputChange("height")}
            placeholder="예: 175"
            className="w-full bg-[#F2F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#191F28] focus:ring-2 focus:ring-[#2ECC71] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#8B95A1] font-semibold uppercase tracking-wider">몸무게 (kg)</label>
          <input
            id="input-weight"
            type="number"
            value={metrics.weight || ""}
            onChange={handleInputChange("weight")}
            placeholder="예: 68"
            className="w-full bg-[#F2F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#191F28] focus:ring-2 focus:ring-[#2ECC71] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#8B95A1] font-semibold uppercase tracking-wider">골격근량 (kg)</label>
          <input
            id="input-muscle"
            type="number"
            value={metrics.muscleMass || ""}
            onChange={handleInputChange("muscleMass")}
            placeholder="예: 31"
            className="w-full bg-[#F2F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#191F28] focus:ring-2 focus:ring-[#2ECC71] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#8B95A1] font-semibold uppercase tracking-wider">체지방률 (%)</label>
          <input
            id="input-fat"
            type="number"
            value={metrics.bodyFat || ""}
            onChange={handleInputChange("bodyFat")}
            placeholder="예: 18"
            className="w-full bg-[#F2F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#191F28] focus:ring-2 focus:ring-[#2ECC71] focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Reactive Calculation Indicators */}
      <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          {/* BMI */}
          <div className="flex-1 bg-[#F9FAFB] rounded-2xl p-4 flex items-center justify-between border border-[#E5E8EB]" id="indicator-bmi">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-xl text-[#8B95A1] shadow-sm">
                <Heart size={16} />
              </div>
              <span className="text-sm text-[#4E5968] font-medium">나의 BMI 지수</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#191F28] font-mono">{healthSummary.bmi > 0 ? healthSummary.bmi : '--'}</span>
              {healthSummary.bmi > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${healthSummary.bmiColor}12`, color: healthSummary.bmiColor }}
                >
                  {healthSummary.bmiCategory}
                </span>
              )}
            </div>
          </div>

          {/* BMR */}
          <div className="flex-1 bg-[#F9FAFB] rounded-2xl p-4 flex items-center justify-between border border-[#E5E8EB]" id="indicator-bmr">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-xl text-[#8B95A1] shadow-sm">
                <Flame size={16} />
              </div>
              <span className="text-sm text-[#4E5968] font-medium">기초대사량 (BMR)</span>
            </div>
            <span className="text-base font-bold text-[#191F28] font-mono">
              {metrics.weight > 0 ? `${healthSummary.bmr.toLocaleString()} kcal` : '--'}
            </span>
          </div>
        </div>

        {/* Custom Personalized Status Bar */}
        {metrics.weight > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800" id="metrics-advice">
            <div className="shrink-0 mt-0.5 text-[#2ECC71]">
              <Dumbbell size={16} className="stroke-[2.5]" />
            </div>
            <p className="text-xs font-semibold leading-relaxed text-[#4E5968]">
              {healthSummary.statusMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
