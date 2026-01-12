
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../types";

export const initGemini = () => {
  // Sur Vercel, la clé doit être configurée dans les Environment Variables du projet
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Please set it in Vercel Environment Variables.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generateResponse = async (prompt: string) => {
  const ai = initGemini();
  if (!ai) return "Erreur de configuration API.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, j'ai rencontré une erreur technique.";
  }
};
