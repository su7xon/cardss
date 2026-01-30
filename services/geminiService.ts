import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API
const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const getCrystalWisdom = async (crystalName: string, intent: string) => {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Provide a mystical and professional metaphysical description for the crystal: ${crystalName}. The user's intent is: ${intent}. Keep it under 100 words. Mention chakras and zodiac signs.` }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    const response = await result.response;
    return response.text() || "The crystal's energy remains a mystery for now. Focus your intention and try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the crystal grid. Please check back later.";
  }
};
