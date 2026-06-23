import { GoogleGenAI, Schema, Type } from "@google/genai";
import { FoodAnalysis, UserProfile, Recipe, SafetyLevel } from "../types";

// Schema for Food Analysis
const foodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING },
    localName: { type: Type.STRING },
    countryOfOrigin: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          isAllergen: { type: Type.BOOLEAN },
        },
      },
    },
    allergensDetected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    suitability: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tasteProfile: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING },
      },
    },
    culturalNotes: { type: Type.STRING },
    eatingEtiquette: { type: Type.STRING },
    similarDishes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    safetyAssessment: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: ['SAFE', 'CAUTION', 'DANGER', 'UNKNOWN'] },
        reason: { type: Type.STRING },
      },
    },
  },
  required: [
    "dishName", "countryOfOrigin", "ingredients", "allergensDetected",
    "nutrition", "culturalNotes", "safetyAssessment"
  ],
};

// Schema for Recipe
const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

export const analyzeFoodImage = async (
  base64Image: string,
  userProfile: UserProfile
): Promise<FoodAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a world-class Food Intelligence AI. Analyze this image.
    
    User Profile Context (CRITICAL for safety assessment):
    - Allergies: ${userProfile.allergies.join(', ') || 'None'}
    - Diet: ${userProfile.diets.join(', ') || 'None'}
    - Spicy Tolerance: ${userProfile.spicyTolerance}

    Tasks:
    1. Identify the dish, its origin, and local name.
    2. Estimate ingredients and confidence levels.
    3. Detect ANY potential allergens based on common knowledge and the user's specific allergies.
    4. Determine suitability (Vegan, Halal, etc.).
    5. Estimate nutritional content (per typical serving).
    6. Provide cultural context and etiquette.
    7. ASSESS SAFETY: Compare the dish contents against the User Profile. 
       - SAFE: No conflicts.
       - CAUTION: Possible cross-contamination or spicy level mismatch.
       - DANGER: Contains specific user allergen or violates diet restrictions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: foodAnalysisSchema,
        systemInstruction: "You are FOODLENS AI. You provide accurate, culturally aware food analysis.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysis;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateRecipe = async (dishName: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a detailed recipe for ${dishName}. Include ingredients, step-by-step instructions, cooking time, and difficulty level.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: recipeSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Recipe;
    }
    throw new Error("No recipe returned");
  } catch (error) {
    console.error("Recipe generation failed:", error);
    throw error;
  }
};

export const getTravelTips = async (location: string): Promise<string> => {
    // Returns markdown string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give me a 3-item list of 'Must Try Foods' and 3 'Dining Etiquette Tips' for a traveler in ${location || 'Japan'}. Format as clean Markdown.`
        });
        return response.text || "Could not retrieve travel tips.";
    } catch (e) {
        return "Travel tips unavailable.";
    }
}
