if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// طباعة المفتاح للتأكد
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ موجود" : "❌ مفقود");

// =====================
// Serve Frontend
// =====================
app.use(express.static(__dirname));

// =====================
// Gemini AI Setup
// =====================
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================
// HOME ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// ANALYZE FOOD API
// =====================
app.post("/analyze-food", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        food: "API Key missing",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
        {
          text: `
أنت خبير تغذية محترف جداً.

حلل الطعام في الصورة.

أرجع فقط JSON بدون أي شرح:

{
  "food": "string",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}
`
        }
      ]
    });

    // =====================
    // Safe response extraction
    // =====================
    let text = "";

    try {
      text = typeof response.text === "function"
        ? response.text()
        : response.text || "";
    } catch (e) {
      text = "";
    }

    text = String(text)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("RAW GEMINI RESPONSE:", text);

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("JSON PARSE FAILED");
      parsed = {};
    }

    const result = {
      food: parsed.food || "غير معروف",
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      carbs: Number(parsed.carbs) || 0,
      fat: Number(parsed.fat) || 0
    };

    res.json(result);

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      food: "خطأ في التحليل",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  }
});

// =====================
// SERVER (Render Ready)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("N-Calorie Sportif PRO running on port", PORT);
});