import { BodyMetrics, RecommendedIntake, HealthSummary } from "./types";

export function calculateHealthStatus(metrics: BodyMetrics): { summary: HealthSummary; recommended: RecommendedIntake } {
  const { height, weight, muscleMass, bodyFat } = metrics;
  const gender = metrics.gender || "male";
  const ageGroup = metrics.ageGroup || "20s";
  
  // BMI: weight / (height/100)^2
  const heightM = height / 100;
  const bmi = heightM > 0 ? weight / (heightM * heightM) : 0;
  
  let bmiCategory: '저체중' | '정상' | '과체중' | '비만' = '정상';
  let bmiColor = '#2ECC71'; // Toss green
  
  if (bmi < 18.5) {
    bmiCategory = '저체중';
    bmiColor = '#F1C40F'; // Yellow
  } else if (bmi < 23) {
    bmiCategory = '정상';
    bmiColor = '#2ECC71'; // Green
  } else if (bmi < 25) {
    bmiCategory = '과체중';
    bmiColor = '#E67E22'; // Orange
  } else {
    bmiCategory = '비만';
    bmiColor = '#E74C3C'; // Red
  }

  // 1. 2025 KDRI 필요추정량 (에너지 권장 섭취량)
  // - 남성 20대 (19~29세): 2,600 kcal | 30대 (30~49세): 2,500 kcal
  // - 여성 20대 (19~29세): 2,000 kcal | 30대 (30~49세): 1,900 kcal
  let targetCalories = 2000;
  if (gender === 'male') {
    targetCalories = ageGroup === '20s' ? 2600 : 2500;
  } else {
    targetCalories = ageGroup === '20s' ? 2000 : 1900;
  }

  // BMR calculation for informative display (Mifflin-St Jeor)
  const age = ageGroup === '20s' ? 24 : 35;
  let bmr = 0;
  if (weight > 0 && height > 0) {
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }
  
  // 2. 탄수화물 권장섭취량 및 에너지적정비율 (50~65%) 반영
  // - 탄수화물 최저 권장섭취량은 남녀 모두 130g/일 이지만, 에너지적정비율 중간값(55%)을 최적 연료 기준으로 환산하여 제안합니다.
  const targetCarbs = Math.round((targetCalories * 0.55) / 4);
  
  // 3. 단백질 2025 KDRI 권장섭취량 (RNI) 반영
  // - 남성 20대/30대: 65g
  // - 여성 20대(19~29세): 55g | 여성 30대(30~49세): 50g
  let targetProtein = 65;
  if (gender === 'female') {
    targetProtein = ageGroup === '20s' ? 55 : 50;
  }
  
  // 4. 지방 에너지적정비율 (15~30%) 반영
  // - 지질 에너지적정비율 중간값(22%)을 기준으로 그램 환산 제시
  const targetFat = Math.round((targetCalories * 0.22) / 9);

  // 5. 2025 KDRI 미량 영양소 권장섭취량 (RNI) 반영
  // - 비타민 B1 (티아민) 권장: 남성 1.2mg, 여성 1.1mg
  // - 철분 권장: 남성 8mg, 여성 12mg (여성 가임기 반사)
  // - 칼슘 권장: 남성 800mg, 여성 650mg
  const targetVitaminB = gender === 'male' ? 1.2 : 1.1;
  const targetIron = gender === 'male' ? 8.0 : 12.0;
  const targetCalcium = gender === 'male' ? 800.0 : 650.0;

  // Personalized health feedback message
  let statusMessage = '';
  const genderKo = gender === 'male' ? '남성' : '여성';
  const ageKo = ageGroup === '20s' ? '20대' : '30대';
  
  statusMessage = `2025 한국인 영양소 섭취기준에 따른 ${ageKo} ${genderKo} 권장 규격입니다 (필요에너지: ${targetCalories.toLocaleString()}kcal, 탄소화물 기준비율: 50~65%, 단백질 권장: ${targetProtein}g). `;
  
  if (bodyFat > 25 && bmiCategory === '정상') {
    statusMessage += '체중은 정상이지만 체지방률이 높은 편입니다. 권장 규격 내에서 단백질 식단을 잘 보강하며 골격근량 향상 운동을 추천합니다.';
  } else if (bmiCategory === '비만') {
    statusMessage += '현재 BMI상 과중 체중에 속합니다. 식사 일지 칼로리를 소폭(약 10~15%) 축소 조절하면서 채소 비중을 높이시는 것을 지원합니다.';
  } else if (bmiCategory === '저체중') {
    statusMessage += '신체 활성 비중이 다소 낮은 편입니다. 균형 잡힌 탄수화물 공급과 양질의 칼슘 및 단백질을 적극 보강해 기초 골격을 키워주세요.';
  } else {
    statusMessage += '현재 신체 밸런스와 영양 기준이 아주 이상적입니다! 권장 영양 비율에 맞춰 건강한 식단을 꾸준히 업로드하며 일상을 유지해보세요.';
  }

  const summary: HealthSummary = {
    bmi: Number(bmi.toFixed(1)),
    bmiCategory,
    bmiColor,
    bmr: Math.round(bmr),
    statusMessage
  };

  const recommended: RecommendedIntake = {
    calories: targetCalories,
    carbs: targetCarbs,
    protein: targetProtein,
    fat: targetFat,
    vitaminB: targetVitaminB,
    iron: targetIron,
    calcium: targetCalcium
  };

  return { summary, recommended };
}

export const PRESET_MEALS = [
  {
    name: "제육볶음 & 쌀밥 정식",
    calories: 680,
    carbs: 85,
    protein: 32,
    fat: 19,
    vitaminB: 0.45,
    iron: 3.2,
    calcium: 45,
    analysis: "단백질과 비타민 B군 보완에 뛰어난 돼지고기 식단이지만, 나트륨 비율이 높아 쌈 채소와 함께 국물 없이 드시는 배려가 필요합니다.",
    tag: "한식"
  },
  {
    name: "닭가슴살 샐러드 & 아보카도",
    calories: 380,
    carbs: 22,
    protein: 26,
    fat: 22,
    vitaminB: 0.95,
    iron: 2.8,
    calcium: 180,
    analysis: "복합 식이섬유와 최상위 비방산(불포화), 닭가슴살 아미노산이 훌륭하여 체지방 감소와 장 건강에 매우 추천하는 식단입니다.",
    tag: "다이어트"
  },
  {
    name: "돼지국밥 & 소면",
    calories: 780,
    carbs: 95,
    protein: 38,
    fat: 25,
    vitaminB: 0.75,
    iron: 4.1,
    calcium: 82,
    analysis: "엄청난 동식물적 에너지와 철분을 즉각 공급해주지만, 나트륨 및 지방 초과 위험이 크므로 건더기 위주 식습관을 추천합니다.",
    tag: "든든한국물"
  },
  {
    name: "치킨 카레 덮밥",
    calories: 620,
    carbs: 90,
    protein: 24,
    fat: 15,
    vitaminB: 0.52,
    iron: 2.0,
    calcium: 38,
    analysis: "강황의 항산화 성분이 유익하며 탄수화물 흡수가 활발합니다. 칼슘이 부족하므로 점심 후 유제품 간식을 곁들여보세요.",
    tag: "덮밥"
  }
];
