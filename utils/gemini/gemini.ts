import { GoogleGenAI } from '@google/genai';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


export async function generateContentFromGemini(prompt: any) {
  console.log("promt", prompt);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });


    return response.text || 'No content generated';
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    return 'Error generating content';
  }
}