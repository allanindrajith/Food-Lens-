export enum SafetyLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
  UNKNOWN = 'UNKNOWN'
}

export interface UserProfile {
  name: string;
  allergies: string[];
  diets: string[]; // e.g., 'Vegan', 'Halal', 'Keto'
  spicyTolerance: 'Low' | 'Medium' | 'High';
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Ingredient {
  name: string;
  confidence: number;
  isAllergen: boolean;
}

export interface FoodAnalysis {
  dishName: string;
  localName: string;
  countryOfOrigin: string;
  description: string;
  ingredients: Ingredient[];
  allergensDetected: string[];
  suitability: string[]; // e.g., 'Vegan', 'Gluten-Free'
  tasteProfile: string[]; // e.g., 'Spicy', 'Umami'
  nutrition: NutritionInfo;
  culturalNotes: string;
  eatingEtiquette: string;
  similarDishes: string[];
  safetyAssessment: {
    level: SafetyLevel;
    reason: string;
  };
}

export interface Recipe {
  title: string;
  cookTime: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
}

export type AppView = 'ONBOARDING' | 'DASHBOARD' | 'SCAN_FOOD' | 'SCAN_MENU' | 'RESULTS' | 'TRAVEL_MODE' | 'PROFILE';
