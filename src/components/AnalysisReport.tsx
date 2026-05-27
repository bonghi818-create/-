import { MealLog, RecommendedIntake } from "../types";
import NutrientGaugeBar from "./NutrientGaugeBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Sparkles, TrendingUp, HelpCircle, Plus, ShoppingBag } from "lucide-react";

interface AnalysisReportProps {
  meals: MealLog[];
  recommended: RecommendedIntake;
  onMealAdded?: (meal: MealLog) => void;
}

const PROTEIN_RECOMMENDATIONS = [
  {
    name: "감동란 (2알)",
    price: "2,200원",
    protein: 12,
    calories: 130,
    carbs: 1,
    fat: 9,
    vitaminB: 0.1,
    iron: 1.5,
    calcium: 50,
    iconKo: "🥚",
    bgClass: "bg-[#FFF9D4]/40 border-[#FFD400]/30",
    desc: "짭조름하고 촉촉한 반숙란으로 대표적인 편의점 간편 단백질 보충원입니다."
  },
  {
    name: "빙그레 더단백 드링크 (초코)",
    price: "2,500원",
    protein: 20,
    calories: 105,
    carbs: 5,
    fat: 1,
    vitaminB: 0.2,
    iron: 0.5,
    calcium: 240,
    iconKo: "🧃",
    bgClass: "bg-[#E8F8F0]/40 border-[#2ECC71]/30",
    desc: "설탕 걱정 없는 저당 20g 초고함량 단백질 음료로 운동 후에 특히 유용합니다."
  },
  {
    name: "하림 즉석 닭가슴살 오리지널",
    price: "3,200원",
    protein: 23,
    calories: 110,
    carbs: 0,
    fat: 1.5,
    vitaminB: 0.15,
    iron: 0.8,
    calcium: 15,
    iconKo: "🍗",
    bgClass: "bg-blue-50/30 border-[#3182F6]/30",
    desc: "순수 고품질 닭가슴살로 전자레인지 40초 동작으로 신속히 단백질을 채울 수 있습니다."
  },
  {
    name: "매일 셀렉스 프로틴 오리지널",
    price: "2,000원",
    protein: 12,
    calories: 95,
    carbs: 4,
    fat: 0.8,
    vitaminB: 0.15,
    iron: 0.4,
    calcium: 180,
    iconKo: "🥛",
    bgClass: "bg-purple-50/30 border-purple-200",
    desc: "동물성 및 식물성 균형 프로틴 설계로 부드러운 목 넘김과 함께 칼슘까지 보강됩니다."
  }
];

export default function AnalysisReport({ meals, recommended, onMealAdded }: AnalysisReportProps) {
  // Aggregate meal nutrients
  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.carbs += meal.carbs;
      acc.protein += meal.protein;
      acc.fat += meal.fat;
      acc.vitaminB += meal.vitaminB;
      acc.iron += meal.iron;
      acc.calcium += meal.calcium;
      return acc;
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0, vitaminB: 0, iron: 0, calcium: 0 }
  );

  // Round aggregated totals to nice readable strings or floats
  totals.calories = Math.round(totals.calories);
  totals.carbs = Math.round(totals.carbs);
  totals.protein = Math.round(totals.protein);
  totals.fat = Math.round(totals.fat);
  totals.vitaminB = Number(totals.vitaminB.toFixed(2));
  totals.iron = Number(totals.iron.toFixed(2));
  totals.calcium = Math.round(totals.calcium);

  // Ratios for Recharts Pie Chart (by calorie weight)
  const carbKcal = totals.carbs * 4;
  const proteinKcal = totals.protein * 4;
  const fatKcal = totals.fat * 9;
  const totalKcalMacro = carbKcal + proteinKcal + fatKcal || 1;

  const chartData = [
    { name: "탄수화물", value: Math.round((carbKcal / totalKcalMacro) * 100), rawG: totals.carbs },
    { name: "단백질", value: Math.round((proteinKcal / totalKcalMacro) * 100), rawG: totals.protein },
    { name: "지방", value: Math.round((fatKcal / totalKcalMacro) * 100), rawG: totals.fat }
  ];

  // Specific Toss colors for macros: Carbohydrates are blue, Proteins are green, Fats are yellow
  const COLORS = ["#3182F6", "#2ECC71", "#FFD400"];

  // Health summary score simulation based on target proximity
  const calRatio = Math.min(totals.calories / (recommended.calories || 1), 1.25);
  const carbRatio = Math.min(totals.carbs / (recommended.carbs || 1), 1.25);
  const protRatio = Math.min(totals.protein / (recommended.protein || 1), 1.25);
  const fatRatio = Math.min(totals.fat / (recommended.fat || 1), 1.25);

  const avgMacroPerformance = (calRatio + carbRatio + protRatio + fatRatio) / 4;
  const healthScore = Math.round(Math.max(10, 100 - Math.abs(1 - avgMacroPerformance) * 80));

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all flex flex-col h-full" id="analysis-report">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[#2ECC71] font-bold text-xs uppercase tracking-widest block mb-0.5">Analysis Result</span>
          <h2 className="text-lg font-bold text-[#191F28] tracking-tight">오늘의 식단 분석 리포트</h2>
        </div>
        <div className="bg-[#E8F8F0] text-[#2ECC71] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
          <Sparkles size={12} className="fill-current" />
          <span>점수: {meals.length > 0 ? healthScore : 0}/100</span>
        </div>
      </div>

      {totals.calories === 0 ? (
        <div id="no-meals-state" className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[#E5E8EB] rounded-2xl bg-[#F9FAFB] my-auto min-h-[300px]">
          <div className="text-[#8B95A1] mb-3">
            <HelpCircle size={44} className="stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-[#191F28] text-sm">기록된 식단 없음</h3>
          <p className="text-xs text-[#8B95A1] max-w-[220px] text-center mt-1.5 leading-relaxed font-semibold">
            왼쪽에서 식단을 분석하거나 시뮬레이션 버튼을 눌러 첫 끼니 분석을 시작해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-6" id="report-active-state">
          {/* Pie Chart Zone */}
          <div className="bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl p-4 flex flex-col items-center">
            <h3 className="text-xs font-bold text-[#8B95A1] uppercase tracking-wider mb-2 self-start">3대 영양소 비율 (Macros 기여도)</h3>
            <div className="w-full h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    formatter={(value: any, name: string) => [`${value}% 의존도`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E8EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'Inter' }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={32} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-[#4E5968]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-[10px] font-bold text-[#8B95A1]">총 섭취</span>
                <p className="text-base font-extrabold text-[#191F28] font-mono">{totals.calories}kcal</p>
              </div>
            </div>
          </div>

          {/* Essential Nutrients (Macros) Group */}
          <div id="essential-nutrients-group" className="pt-2">
            <h3 className="text-xs font-bold text-[#8B95A1] uppercase tracking-wider mb-3">거대 영양소 섭취 밸런스</h3>
            <NutrientGaugeBar name="칼로리" value={totals.calories} target={recommended.calories} unit="kcal" />
            <NutrientGaugeBar name="탄수화물" value={totals.carbs} target={recommended.carbs} unit="g" />
            <NutrientGaugeBar name="단백질" value={totals.protein} target={recommended.protein} unit="g" />
            <NutrientGaugeBar name="지방" value={totals.fat} target={recommended.fat} unit="g" />
          </div>

          {/* Micro Nutrients Group */}
          <div id="micronutrients-group" className="pt-2 border-t border-[#E5E8EB]">
            <h3 className="text-xs font-bold text-[#8B95A1] uppercase tracking-wider mb-3">미세 영양소 분석 (Micronutrients)</h3>
            <NutrientGaugeBar name="비타민 B군" value={totals.vitaminB} target={recommended.vitaminB} unit="mg" />
            <NutrientGaugeBar name="철분 (Iron)" value={totals.iron} target={recommended.iron} unit="mg" />
            <NutrientGaugeBar name="칼슘 (Calcium)" value={totals.calcium} target={recommended.calcium} unit="mg" />
          </div>

          {/* Dynamic feedback on accumulated meals */}
          {meals.length > 0 && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mt-2 flex items-start gap-3">
              <div className="text-[#2ECC71] mt-0.5 shrink-0">
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">코칭 가이드</span>
                <p className="text-xs text-[#4E5968] font-semibold leading-relaxed mt-1">
                  {totals.calories < recommended.calories * 0.5 
                    ? "현재 섭취 칼로리가 다소 낮습니다. 정밀한 평가를 위해 건강한 대안 식안을 추가로 더 설계해 보세요."
                    : totals.protein < recommended.protein
                      ? "오늘 단백질 필수 권장량까지 다소 부족한 상황입니다. 아래 편의점 단백질 대안을 신속 보수해 보시는 것을 추천해 드립니다."
                      : "훌륭한 영양 조화를 달성하고 계십니다! 칼륨과 수분 대사를 돕기 위해 생수 섭취를 늘려보세요."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Protein supplement recommendation segment */}
          {meals.length > 0 && recommended.protein > totals.protein && (
            <div className="pt-4 border-t border-[#E5E8EB] mt-4" id="protein-boosters-section">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 px-2 bg-emerald-50 text-[#2ECC71] rounded-lg text-xs font-bold flex items-center gap-1">
                  <ShoppingBag size={12} />
                  <span>단백질 SOS</span>
                </div>
                <h4 className="text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  부족한 단백질 ({Math.round(recommended.protein - totals.protein)}g) 편의점 긴급 보충
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROTEIN_RECOMMENDATIONS.map((item) => (
                  <div 
                    key={item.name}
                    className={`border border-[#E5E8EB] rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#2ECC71]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] ${item.bgClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-lg">{item.iconKo}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold bg-[#E8F8F0] text-[#2ECC71] px-1.5 py-0.5 rounded-full">
                            단백질 +{item.protein}g
                          </span>
                          <span className="text-[10px] font-bold bg-[#F2F4F6] text-[#4E5968] px-1.5 py-0.5 rounded-full font-mono">
                            {item.price}
                          </span>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-[#191F28] mb-1">{item.name}</h5>
                      <p className="text-[11px] text-[#4E5968] leading-normal mb-3 font-semibold">
                        {item.desc}
                      </p>
                    </div>
                    
                    {onMealAdded && (
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
                          onMealAdded({
                            id: `supp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                            foodName: `[보충 추천] 편의점 ${item.name}`,
                            calories: item.calories,
                            carbs: item.carbs,
                            protein: item.protein,
                            fat: item.fat,
                            vitaminB: item.vitaminB,
                            iron: item.iron,
                            calcium: item.calcium,
                            timestamp: timeStr,
                            analysis: `부족한 단백질을 즉시 정량 공급하기 위해 권장 가이드에서 다이렉트로 선택해 보강한 편의점 식품(${item.name}, 단백질 ${item.protein}g)입니다.`
                          });
                        }}
                        className="w-full bg-[#191F28] hover:opacity-90 text-white text-[10px] font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Plus size={11} className="stroke-[2.5]" />
                        내 식단에 바로 추가
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
