
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/analyze-food", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

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
أنت خبير تغذية.

حلل الطعام الموجود في الصورة.

أجب بالعربية.

أرجع فقط JSON بهذا الشكل:

{
  "food":"اسم الطعام",
  "calories":0,
  "protein":0,
  "carbs":0,
  "fat":0
}
`
        }
      ]
    });

    let text = "";

    if (typeof response.text === "function") {
      text = response.text();
    } else {
      text = response.text || "";
    }

    text = String(text)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("Gemini:", text);

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        food: text,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      food: "خطأ في التحليل",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  }
});

app.listen(3000, () => {
  console.log("Nail-Calori Sportif running on port 3000");
});
