import { GoogleGenAI } from "@google/genai";
import { GenerationSettings, AspectRatio, ImageSize } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateImages = async (
  settings: GenerationSettings,
  sourceImage: File | null
): Promise<string[]> => {
  // Ensure API key is selected via window.aistudio before calling this, or assume env is ready
  // However, for gemini-3-pro-image-preview, we rely on process.env.API_KEY being injected after selection.
  
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please select an API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const results: string[] = [];
  
  // Construct the final prompt including negative prompt simulation
  let fullPrompt = settings.prompt;
  if (settings.negativePrompt.trim()) {
    fullPrompt += `\n\n(Note: strictly exclude the following elements: ${settings.negativePrompt})`;
  }

  // Gemini's generateContent typically returns 1 candidate. 
  // For batch processing, we run requests in parallel or sequence. 
  // To avoid rate limits, we'll do sequence for this demo, or limited parallel.
  
  const generateSingleImage = async (): Promise<string | null> => {
    try {
      const parts: any[] = [];
      
      // Add source image if exists (Img2Img)
      if (sourceImage) {
        const imagePart = await fileToGenerativePart(sourceImage);
        parts.push(imagePart);
      }
      
      // Add text prompt
      parts.push({ text: fullPrompt });

      const modelId = 'gemini-3-pro-image-preview';
      
      const config: any = {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.imageSize,
        },
        temperature: settings.creativity,
      };

      // Handle random seed manually if -1, otherwise pass specific seed
      if (settings.seed !== -1) {
        config.seed = settings.seed;
      } else {
        // If random, we don't send a seed, let the model decide, or generate a random one here.
        // Generating here ensures we can track it if we wanted to (not implemented in this simplified return).
        config.seed = Math.floor(Math.random() * 2147483647);
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: { parts },
        config: config
      });

      // Extract image
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  };

  // Run batch
  const promises = Array(settings.batchSize).fill(null).map(() => generateSingleImage());
  const batchResults = await Promise.all(promises);
  
  batchResults.forEach(res => {
    if (res) results.push(res);
  });

  return results;
};