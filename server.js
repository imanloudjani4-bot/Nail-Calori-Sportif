require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// =====================
// Gemini AI Setup
// =====================
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================
// 🟢 HOME ROUTE
// =====================
app.get("/", (req, res) => {
  res.status(200).send("N-Calorie Sportif is running 🚀");
});

// =====================
// 🟢 ANALYZE FOOD API
// =====================
app.post("/analyze-food", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in environment variables"
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
أنت خبير تغذية محترف.

حلل الطعام الموجود في الصورة.

أرجع فقط JSON بدون أي شرح:

{
  "food": "اسم الطعام",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}
`
        }
      ]
    });

    let text = response.text;

    if (typeof text === "function") {
      text = text();
    }

    text = String(text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("Gemini Response:", text);

    let result;

    try {
      result = JSON.parse(text);
    } catch (err) {
      result = {
        food: "لم يتم التعرف بدقة",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }

    res.json(result);

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      error: "Server error",
      food: "خطأ في التحليل",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  }
});

// =====================
// SERVER (Render FIXED)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("N-Calorie Sportif running on port", PORT);
});