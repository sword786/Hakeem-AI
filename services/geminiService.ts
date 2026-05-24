import { GoogleGenAI, Type } from "@google/genai";
import { GeminiVerseSuggestion } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const SYSTEM_INSTRUCTION = `
You are Hakeem AI, a spiritual guide using the Quran.
Your task is to map a user's feeling or life situation to 3 specific, relevant Quranic verses.
You must strictly return valid JSON.
Do not invent verses.
Select verses that offer comfort, guidance, or wisdom related to the input.
Provide a short "reasoning" (max 2 sentences) explaining why this verse fits the situation contextually.
`;

const DAILY_AYAH_INSTRUCTION = `
Select a single, impactful verse from the Quran suitable for a "Daily Wisdom" or "Verse of the Day".
It should be general advice, comforting, or motivating for a modern believer.
Return valid JSON only.
`;

export const getContextualVerses = async (userQuery: string): Promise<GeminiVerseSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              surahNumber: { type: Type.INTEGER, description: "The number of the Surah (1-114)" },
              ayahNumber: { type: Type.INTEGER, description: "The number of the Ayah" },
              reasoning: { type: Type.STRING, description: "Brief explanation of relevance" },
            },
            required: ["surahNumber", "ayahNumber", "reasoning"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const suggestions: GeminiVerseSuggestion[] = JSON.parse(jsonText);
    return suggestions;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to retrieve spiritual guidance at this moment.");
  }
};

export const getDailyAyahSuggestion = async (): Promise<GeminiVerseSuggestion | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me one verse for today's reflection.",
      config: {
        systemInstruction: DAILY_AYAH_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            surahNumber: { type: Type.INTEGER },
            ayahNumber: { type: Type.INTEGER },
            reasoning: { type: Type.STRING, description: "A short reflection on this verse" },
          },
          required: ["surahNumber", "ayahNumber", "reasoning"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Daily Ayah Error:", error);
    return null;
  }
};
