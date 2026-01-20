import { GoogleGenAI } from "@google/genai";
import { CharacterRef } from "../types";

export const generateCharacterImage = async (
  prompt: string,
  character: CharacterRef,
  isHighQuality: boolean = false
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: character.data,
              mimeType: character.mimeType
            }
          },
          {
            text: `Reimagine this character in the following scene or style: ${prompt}. Maintain the core identifying features of the character while adapting them to the new context.`
          }
        ]
      },
      config: isHighQuality ? {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      } : undefined
    });

    let generatedImageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("The API did not return an image part in the response.");
    }

    return generatedImageUrl;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const improvePrompt = async (currentPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = currentPrompt 
    ? "You are a prompt engineer. Improve the user's image generation prompt to be more descriptive, creative, and detailed for a high-quality AI meme. Return ONLY the improved prompt text."
    : "You are a creative meme generator. Create a random, funny, and highly descriptive prompt for a character-based meme. Return ONLY the prompt text.";

  const message = currentPrompt 
    ? `Improve this prompt: ${currentPrompt}`
    : "Generate a random funny meme prompt.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || (currentPrompt || "A funny space cat on a surfboard");
  } catch (error) {
    console.error("Improve Prompt Error:", error);
    return currentPrompt;
  }
};
