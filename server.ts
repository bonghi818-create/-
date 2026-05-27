import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for image uploads (e.g. food photos)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, image, imageMime } = req.body;

    if (!ai) {
      console.warn("GEMINI_API_KEY is missing, using simulated mock dataset.");
      const keyword = (text || "식사").trim();
      let matchedMock = {
        foodName: "제육볶음과 공기밥 (시뮬레이션)",
        calories: 680,
        carbs: 85,
        protein: 32,
        fat: 19,
        vitaminB: 0.45,
        iron: 3.2,
        calcium: 45,
        analysis: "매콤한 돼지고기와 흰 보리밥 조합입니다. 비타민 B군과 단백질 보충에 제격이지만, 나트륨 함량이 높으니 칼륨이 풍부한 채소류를 먼저 베이스로 다지는 복합 섭취를 추천드려요."
      };

      if (keyword.includes("샐러드") || keyword.includes("salad")) {
        matchedMock = {
          foodName: "리코타 아보카도 웰빙 샐러드",
          calories: 380,
          carbs: 22,
          protein: 15,
          fat: 25,
          vitaminB: 0.95,
          iron: 2.8,
          calcium: 180,
          analysis: "치즈의 양질 복합 단백질과 유기농 채소, 아보카도의 건강 지방산이 결합한 완벽한 아침 메뉴입니다. 철분과 유기질, 칼슘 보존에 무척 탁월합니다."
        };
      } else if (keyword.includes("삼겹살") || keyword.includes("고기")) {
        matchedMock = {
          foodName: "삼겹살 구이와 버섯 무침",
          calories: 890,
          carbs: 8,
          protein: 44,
          fat: 76,
          vitaminB: 1.25,
          iron: 1.9,
          calcium: 30,
          analysis: "근육 함성 및 비타민 B 복합 보충에 좋은 육류 위주 식단입니다. 다만 포화지방 수치가 크게 초과할 수 있어 구운 버섯과 마늘을 충분히 함께 권해드립니다."
        };
      } else if (keyword.includes("국밥") || keyword.includes("김치찌개") || keyword.includes("찌개")) {
        matchedMock = {
          foodName: "돼지 고기 김치찌개 정식",
          calories: 610,
          carbs: 82,
          protein: 26,
          fat: 18,
          vitaminB: 0.55,
          iron: 2.4,
          calcium: 60,
          analysis: "보편적인 쌀밥 정식으로 따뜻한 육수가 소화력을 도우나 김치 가열로 철분은 부족하고 나트륨은 과합니다. 국물을 남기는 습관을 들이시면 좋습니다."
        };
      } else if (keyword.includes("샌드위치") || keyword.includes("토스트") || keyword.includes("빵")) {
        matchedMock = {
          foodName: "통밀 로스트 치킨 샌드위치",
          calories: 450,
          carbs: 48,
          protein: 26,
          fat: 14,
          vitaminB: 0.72,
          iron: 2.1,
          calcium: 110,
          analysis: "가벼운 한 끼로 손색이 없으며, 식이섬유와 가금류 단백질이 우수합니다. 부족한 칼슘을 메우기 위해 저지방 요구르트나 두유 한 컵을 동반해 보정해보세요."
        };
      } else if (keyword.length > 1) {
        matchedMock = {
          foodName: keyword,
          calories: Math.floor(Math.random() * 400) + 300,
          carbs: Math.floor(Math.random() * 60) + 30,
          protein: Math.floor(Math.random() * 25) + 12,
          fat: Math.floor(Math.random() * 20) + 7,
          vitaminB: Number((Math.random() * 0.7 + 0.15).toFixed(2)),
          iron: Number((Math.random() * 3 + 0.8).toFixed(1)),
          calcium: Math.floor(Math.random() * 120) + 30,
          analysis: `${keyword}은(는) 활력 공급에 무난한 조합을 보입니다. 체내 흡수를 높이기 위해 껍질 채 섭취하는 견과류 또는 녹황색 채소를 보충하시길 추천합니다.`
        };
      }

      return res.json({ success: true, isMock: true, data: matchedMock });
    }

    // Process using GoogleGenAI SDK (model: gemini-3.5-flash)
    const contents: any[] = [];

    if (image && imageMime) {
      contents.push({
        inlineData: {
          mimeType: imageMime,
          data: image
        }
      });
    }

    contents.push({
      text: `Analyze the following meal described in text or shown in image: "${text || "Describe details of the meal"}"
      Please provide a precise, realistic estimation of macronutrients and micronutrients in JSON format.
      Response should be in Korean language and adhere strictly to the JSON schema.
      Estimate numbers realistically if specific portions are unknown.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: "의미 있는 한글 설명 혹은 메뉴 이름 (예: 한식 소불고기 덮밥)" },
            calories: { type: Type.INTEGER, description: "식단의 총 칼로리 (kcal 단위, 정수)" },
            carbs: { type: Type.INTEGER, description: "탄수화물 함량 (g 단위, 정수)" },
            protein: { type: Type.INTEGER, description: "단백질 함량 (g 단위, 정수)" },
            fat: { type: Type.INTEGER, description: "지방 함량 (g 단위, 정수)" },
            vitaminB: { type: Type.NUMBER, description: "비타민 B 복합 함량 합계 (mg 단위, 실수)" },
            iron: { type: Type.NUMBER, description: "철분 함량 (mg 단위, 실수)" },
            calcium: { type: Type.NUMBER, description: "칼슘 함량 (mg 단위, 실수)" },
            analysis: { type: Type.STRING, description: "식단의 영양 밸런스 총평 및 조언 (한글 2문장 이내)" }
          },
          required: ["foodName", "calories", "carbs", "protein", "fat", "vitaminB", "iron", "calcium", "analysis"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText.trim());
    return res.json({ success: true, isMock: false, data: parsedData });

  } catch (error: any) {
    console.error("Gemini meal analysis API failed:", error);
    return res.status(500).json({ success: false, error: "식단 분석에 실패했습니다. 한글로 입력해보시거나, 잠시 후 다시 시도해주십시오." });
  }
});

// Start developer server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
