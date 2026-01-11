
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use the exact environment variable process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCrystalWisdom = async (crystalName: string, intent: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a mystical and professional metaphysical description for the crystal: ${crystalName}. The user's intent is: ${intent}. Keep it under 100 words. Mention chakras and zodiac signs.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    // Use .text property directly.
    return response.text || "The crystal's energy remains a mystery for now. Focus your intention and try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the crystal grid. Please check back later.";
  }
};
