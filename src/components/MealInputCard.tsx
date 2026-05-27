import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, Sparkles, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { MealLog } from "../types";
import { PRESET_MEALS } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface MealInputCardProps {
  onMealAdded: (meal: MealLog) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function MealInputCard({ onMealAdded, isLoading, setIsLoading }: MealInputCardProps) {
  const [inputText, setInputText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse file and generate Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("이미지 형식의 파일만 업로드할 수 있습니다.");
      return;
    }
    setErrorMsg("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Dynamic API Trigger
  const handleAnalyze = async () => {
    if (!inputText && !imagePreview) {
      setErrorMsg("분석할 음식 사진을 올리거나, 텍스트 설명을 작성해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      let imageBase64 = "";
      let imageMime = "";

      if (imagePreview) {
        const parts = imagePreview.split(",");
        if (parts.length === 2) {
          const match = parts[0].match(/:(.*?);/);
          imageMime = match ? match[1] : "image/png";
          imageBase64 = parts[1];
        }
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          image: imageBase64,
          imageMime: imageMime
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        const mealResult: MealLog = {
          id: Math.random().toString(36).substring(2, 9),
          foodName: data.data.foodName || "분석 완료 식사",
          calories: parseInt(data.data.calories) || 0,
          carbs: parseInt(data.data.carbs) || 0,
          protein: parseInt(data.data.protein) || 0,
          fat: parseInt(data.data.fat) || 0,
          vitaminB: parseFloat(data.data.vitaminB) || 0,
          iron: parseFloat(data.data.iron) || 0,
          calcium: parseFloat(data.data.calcium) || 0,
          analysis: data.data.analysis || "분석 완료되었습니다.",
          imageUrl: imagePreview || undefined,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
        };

        onMealAdded(mealResult);
        setInputText("");
        clearImage();
      } else {
        throw new Error(data.error || "분석 실패");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "식단을 분석하는 중 문제가 발생했습니다. 잠시 후 재시도하세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Preset quick insert
  const handlePresetClick = (preset: typeof PRESET_MEALS[0]) => {
    const mealResult: MealLog = {
      id: Math.random().toString(36).substring(2, 9),
      foodName: preset.name,
      calories: preset.calories,
      carbs: preset.carbs,
      protein: preset.protein,
      fat: preset.fat,
      vitaminB: preset.vitaminB,
      iron: preset.iron,
      calcium: preset.calcium,
      analysis: preset.analysis,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
    };
    onMealAdded(mealResult);
  };

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all flex flex-col" id="meal-input-card">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-[#E8F8F0] rounded-xl text-[#2ECC71]">
          <Upload size={20} className="stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold text-[#191F28] tracking-tight">오늘의 식단 등록</h2>
      </div>

      {/* Drag & Drop Area */}
      <div
        id="drag-and-drop-area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] relative bg-[#F9FAFB] ${
          dragActive ? "border-[#2ECC71] bg-emerald-50/20" : "border-[#E5E8EB] hover:border-[#2ECC71] hover:bg-[#F2F4F6]/50"
        } ${imagePreview ? "border-transparent cursor-default" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative w-full aspect-video md:aspect-[2.2/1] rounded-xl overflow-hidden shadow-sm group">
            <img
              src={imagePreview}
              alt="식단 사진 미리보기"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                id="btn-clear-image"
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                className="p-2.5 bg-red-500 rounded-lg text-white shadow-md hover:bg-red-600 hover:scale-105 transition-all text-sm flex items-center gap-1.5 font-bold"
              >
                <X size={15} /> 지우기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-full mb-3 shadow-sm border border-[#E5E8EB] group-hover:scale-105 transition-transform text-[#8B95A1]">
              <Upload size={22} className="stroke-[2]" />
            </div>
            <p className="text-sm font-semibold text-[#4E5968]">식단 사진 올리기</p>
            <p className="text-xs text-[#8B95A1] mt-1">파일을 드래그해서 놓거나 클릭하여 선택</p>
          </div>
        )}
      </div>

      {/* Text input description */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-[#8B95A1] mb-1.5 uppercase tracking-wider">식단 내용(텍스트 입력)</label>
        <textarea
          id="textarea-diet"
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="예: 오늘 점심 제육덮밥 한 그릇에 계란프라이 추가해서 완식했습니다."
          className="w-full bg-[#F2F4F6] border-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2ECC71] outline-none font-semibold text-[#191F28] transition-all resize-none leading-relaxed placeholder-[#ADB5BD]"
        />
      </div>

      {/* Error Output */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            id="diet-error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-800 text-xs font-semibold"
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action triggers */}
      <div className="mt-5 flex gap-3">
        <button
          id="btn-analyze-diet"
          disabled={isLoading}
          onClick={handleAnalyze}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 px-4 font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#2ECC7133] outline-none cursor-pointer ${
            isLoading
              ? "bg-[#2ECC71]/80 text-white cursor-wait"
              : "bg-[#2ECC71] text-white hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>AI 분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="fill-white" />
              <span>영양 성분 분석 시작</span>
            </>
          )}
        </button>
      </div>

      {/* Preset simulation triggers */}
      <div className="mt-6 pt-5 border-t border-[#E5E8EB]">
        <h3 className="text-xs font-bold text-[#8B95A1] mb-3 uppercase tracking-wider">원클릭 시뮬레이션 샘플 식단</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_MEALS.map((preset, idx) => (
            <button
              id={`preset-meal-${idx}`}
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="bg-[#F2F4F6] hover:bg-[#E5E8EB] transition-all text-xs font-bold px-3 py-2.5 rounded-xl text-[#4E5968] flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} className="stroke-[2.5]" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
