
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, API_KEY_ENV_VAR } from '../constants';

let ai: GoogleGenAI | null = null;

export const initializeGeminiService = (): string | null => {
  const apiKey = process.env[API_KEY_ENV_VAR];
  if (!apiKey) {
    console.error('API_KEY environment variable not found.');
    return 'API_KEY environment variable not found.';
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    return null; // Success
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI:', error);
    return `Failed to initialize GoogleGenAI: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const generateText = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI service not initialized. Call initializeGeminiService() first.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      // config: { thinkingConfig: { thinkingBudget: 0 } } // For faster, potentially lower quality responses
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const fetchNpcDialogue = async (basePrompt: string, gameStateSummary: string): Promise<string> => {
  const fullPrompt = `${basePrompt}\n${gameStateSummary}\n\nTraveler says: "Greetings."\n\nYour response:`;
  return generateText(fullPrompt);
};

export const fetchWorldDescription = async (worldName: string): Promise<string> => {
  const prompt = `Generate a short, evocative, and slightly mysterious description (2-3 sentences) for a game world named "${worldName}". Focus on its unique atmosphere and potential secrets.`;
  return generateText(prompt);
};

export const fetchItemFlavorText = async (itemName: string, itemType: string, itemDescription: string): Promise<string> => {
  const prompt = `Generate a short, intriguing piece of flavor text (1-2 sentences) for a game item.
Item Name: ${itemName}
Item Type: ${itemType}
Item Description: ${itemDescription}
Flavor Text:`;
  return generateText(prompt);
};

export const fetchPropertyFlavorText = async (propertyName: string, propertyDescription: string): Promise<string> => {
    const prompt = `Generate a short, intriguing piece of flavor text (1-2 sentences) for a game property (a building or installation).
Property Name: ${propertyName}
Property Description: ${propertyDescription}
Flavor Text:`;
    return generateText(prompt);
  };
