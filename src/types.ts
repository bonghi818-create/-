export interface BodyMetrics {
  height: number; // cm
  weight: number; // kg
  muscleMass: number; // kg
  bodyFat: number; // %
  gender?: "male" | "female"; // 성별 (남성/여성)
  ageGroup?: "20s" | "30s"; // 연령대 (20대: 19~29세, 30대: 30~49세)
}

export interface RecommendedIntake {
  calories: number; // kcal
  carbs: number; // g
  protein: number; // g
  fat: number; // g
  vitaminB: number; // mg, eg. 1.2mg is default
  iron: number; // mg, eg. 12mg is default
  calcium: number; // mg, eg. 700mg is default
}

export interface MealLog {
  id: string;
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  vitaminB: number;
  iron: number;
  calcium: number;
  analysis: string;
  imageUrl?: string;
  timestamp: string;
}

export interface HealthSummary {
  bmi: number;
  bmiCategory: '저체중' | '정상' | '과체중' | '비만';
  bmiColor: string;
  bmr: number; // 기초대사량
  statusMessage: string;
}
