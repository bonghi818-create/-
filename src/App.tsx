import { useState, useEffect } from "react";
import { BodyMetrics, MealLog } from "./types";
import { calculateHealthStatus } from "./utils";

import BodyMetricsCard from "./components/BodyMetricsCard";
import MealInputCard from "./components/MealInputCard";
import AnalysisReport from "./components/AnalysisReport";
import MealLogList from "./components/MealLogList";

import { Leaf, RefreshCcw, Smile } from "lucide-react";

export default function App() {
  // Initialize user physical metrics from localStorage, or reasonable university student defaults
  const [metrics, setMetrics] = useState<BodyMetrics>(() => {
    const saved = localStorage.getItem("greenplate_metrics");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved metrics:", e);
      }
    }
    return {
      height: 174,
      weight: 68,
      muscleMass: 31,
      bodyFat: 18,
      gender: "male",
      ageGroup: "20s"
    };
  });

  // Initialize meals list from localStorage
  const [meals, setMeals] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem("greenplate_meals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved meals:", e);
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize metrics to localStorage on change
  useEffect(() => {
    localStorage.setItem("greenplate_metrics", JSON.stringify(metrics));
  }, [metrics]);

  // Synchronize meals list to localStorage on change
  useEffect(() => {
    localStorage.setItem("greenplate_meals", JSON.stringify(meals));
  }, [meals]);

  // Dynamically calculate BMI, BMR, and recommended macros based on metrics
  const { summary: healthSummary, recommended: recommendedIntake } = calculateHealthStatus(metrics);

  const handleMealAdded = (newMeal: MealLog) => {
    setMeals((prev) => [newMeal, ...prev]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm("오늘 먹은 모든 식사 기록과 등록된 신체 정보를 최기화하시겠습니까?")) {
      setMeals([]);
      setMetrics({
        height: 174,
        weight: 68,
        muscleMass: 31,
        bodyFat: 18,
        gender: "male",
        ageGroup: "20s"
      });
      localStorage.removeItem("greenplate_metrics");
      localStorage.removeItem("greenplate_meals");
    }
  };

  return (
    <div className="bg-[#F2F4F6] min-h-screen text-[#191F28] font-sans selection:bg-[#2ECC71]/20 selection:text-[#2ECC71]">
      {/* Toss Style Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#E5E8EB] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2ECC71] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#2eac5c]/10">
              <Leaf size={18} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#191F28] font-sans">GreenPlate</span>
                <span className="text-[10px] font-bold bg-[#E8F8F0] text-[#2ECC71] px-1.5 py-0.5 rounded-md">PROTOTYPE</span>
              </div>
              <p className="text-[10px] font-bold text-[#8B95A1]">대학생 스마트 맞춤 식단 진단기</p>
            </div>
          </div>

          <button
            id="btn-reset-all"
            onClick={handleResetData}
            className="flex items-center gap-1.5 bg-[#F2F4F6] hover:bg-[#E5E8EB] rounded-xl px-4 py-2 text-xs font-bold text-[#4E5968] transition-all cursor-pointer"
          >
            <RefreshCcw size={12} className="stroke-[2.5]" />
            초기화
          </button>
        </div>
      </header>

      {/* Main Dashboard Panel */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Intro coaching panel */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-[#E5E8EB] p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-[#191F28] tracking-tight flex items-center gap-2 justify-center md:justify-start">
              내 식탁 위의 건강 대시보드 <Smile size={24} className="text-[#2ECC71] stroke-[2.5]" />
            </h1>
            <p className="text-sm font-semibold text-[#8B95A1] leading-relaxed max-w-2xl">
              인공지능 분석기로 식사의 탄수화물, 단백질, 지방부터 비타민 B, 철분, 칼슘까지의 미량 조화를 평가합니다. 신체 비율을 입력해 최적의 권장 비율을 진단해 보세요.
            </p>
          </div>
          <div className="shrink-0 flex justify-center">
            <div className="bg-[#F9FAFB] text-[#2ECC71] rounded-2xl px-6 py-4 border border-[#E5E8EB] text-center">
              <span className="text-[10px] font-bold text-[#8B95A1] tracking-wider uppercase block">AI 분석 건강 지표</span>
              <span className="text-2xl font-black font-mono tracking-tight mt-0.5 block text-[#191F28]">
                {meals.length > 0 ? meals.length : "0"} <span className="text-sm font-bold text-[#4E5968]">끼 분석 완료</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard grid mapping Left and Right panes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Physical metrics, upload cards */}
          <div className="lg:col-span-5 space-y-8">
            <BodyMetricsCard
              metrics={metrics}
              onMetricsChange={setMetrics}
              healthSummary={healthSummary}
            />

            <MealInputCard
              onMealAdded={handleMealAdded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* RIGHT COLUMN: Visual analytics, diet list */}
          <div className="lg:col-span-7 space-y-8">
            <AnalysisReport
              meals={meals}
              recommended={recommendedIntake}
              onMealAdded={handleMealAdded}
            />

            <MealLogList
              meals={meals}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
