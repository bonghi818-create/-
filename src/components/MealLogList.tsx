import { MealLog } from "../types";
import { Trash2, Clock, CalendarRange, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MealLogListProps {
  meals: MealLog[];
  onDeleteMeal: (id: string) => void;
}

export default function MealLogList({ meals, onDeleteMeal }: MealLogListProps) {
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all mb-6" id="meal-log-list">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#E8F8F0] rounded-xl text-[#2ECC71]">
            <CalendarRange size={20} className="stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-[#191F28] tracking-tight">오늘 식단 분석 리스트 ({meals.length}회)</h2>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-[#E5E8EB] rounded-2xl bg-[#F9FAFB] text-[#8B95A1] text-xs font-bold" id="no-logged-meals">
          아직 기록된 식단이 없습니다. 식사를 등록해 주세요.
        </div>
      ) : (
        <div className="space-y-4" id="logged-meals-container">
          <AnimatePresence initial={false}>
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 border border-[#E5E8EB] rounded-2xl bg-[#F9FAFB]/40 flex gap-4 hover:border-gray-300 transition-all group relative">
                  {/* Thumbnail if imageUrl exists */}
                  {meal.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-sm border border-[#E5E8EB]">
                      <img
                        src={meal.imageUrl}
                        alt={meal.foodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#191F28] text-sm truncate">{meal.foodName}</h3>
                      <button
                        id={`btn-delete-meal-${meal.id}`}
                        onClick={() => onDeleteMeal(meal.id)}
                        className="text-[#ADB5BD] hover:text-[#F04452] hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8B95A1] font-bold mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={11} /> {meal.timestamp}
                      </span>
                      <span className="flex items-center gap-0.5 text-[#F04452] font-mono font-bold">
                        <Flame size={12} /> {meal.calories} kcal
                      </span>
                    </div>

                    {/* Small macro badge tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3182F6]/10 text-[#3182F6]">
                        탄 {meal.carbs}g
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2ECC71]/10 text-[#2ECC71]">
                        단 {meal.protein}g
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFD400]/15 text-[#FFA114]">
                        지 {meal.fat}g
                      </span>
                      {meal.vitaminB > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600">
                          Vit B {meal.vitaminB}mg
                        </span>
                      )}
                    </div>

                    {/* AI explanation line if exists */}
                    {meal.analysis && (
                      <p className="text-[11px] font-semibold text-[#4E5968] mt-2.5 bg-white border border-[#E5E8EB] rounded-xl p-2.5 leading-relaxed">
                        {meal.analysis}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
