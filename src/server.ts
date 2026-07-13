import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// High limits to allow menu photo uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Server-side Gemini initialization
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to parse base64 strings (including Data URLs)
function parseBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return {
      mimeType: "image/jpeg",
      data: dataString,
    };
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

// AI Menu parsing endpoint
app.post("/api/gemini/analyze-menu", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "برجاء توفير صورة المنيو لرفعها وتحليلها" });
    }

    if (!geminiApiKey) {
      return res.status(500).json({ 
        error: "مفتاح Gemini API غير متاح في خادم الويب. يرجى إضافته في إعدادات المنصة." 
      });
    }

    const { mimeType, data } = parseBase64Image(imageBase64);
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: data,
      },
    };

    const textPart = {
      text: "Analyze this restaurant menu image carefully. Extract all menu divisions (categories) and every individual item (dish or product) belonging to them. Make sure prices, descriptions, and discount details are accurately transcribed. Return the results in Arabic.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "اسم القسم باللغة العربية، مثل: مقبلات، بيتزا، مشروبات باردة" },
                  order: { type: Type.INTEGER, description: "رقم ترتيب التصنيف يبدأ من 1" },
                },
                required: ["name", "order"],
              },
            },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "اسم الوجبة أو المشروب باللغة العربية" },
                  description: { type: Type.STRING, description: "وصف موجز للمكونات والتفاصيل باللغة العربية" },
                  price: { type: Type.NUMBER, description: "سعر السلعة رقم كـ float أو integer" },
                  originalPrice: { type: Type.NUMBER, description: "السعر الأصلي قبل الخصم، إن وجد" },
                  isDiscounted: { type: Type.BOOLEAN, description: "نعم إذا كان هناك خصم أو عرض خاص" },
                  discountPrice: { type: Type.NUMBER, description: "سعر العرض أو الخصم" },
                  categoryIdName: { type: Type.STRING, description: "اسم القسم المطابق تماماً للقسم الذي ينتمي إليه هذا المنتج" },
                  badge: { type: Type.STRING, description: "شارة مقترحة اختيارية مثل: HOT أو NEW أو مميز" },
                  order: { type: Type.INTEGER, description: "الترتيب الرقمي للمنتج داخل تصنيفه يبدأ من 1" },
                },
                required: ["name", "price", "categoryIdName", "order"],
              },
            },
          },
          required: ["categories", "products"],
        },
        systemInstruction: "You are a professional AI culinary and menu parsing assistant. Analyze the incoming menu image or flyer, extract all food categories and dishes. Keep items in Arabic and produce a valid and correct structured JSON according to the schema.",
      },
    });

    const parsedText = response.text?.trim() || "{}";
    const dataObj = JSON.parse(parsedText);
    return res.json(dataObj);

  } catch (error: any) {
    console.error("AI menu parsing error:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء معالجة الصورة عبر الذكاء الاصطناعي: " + (error?.message || error) 
    });
  }
});

// Vite Middleware & SPA serving
async function initServer() {
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

initServer();
