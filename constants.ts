import { UserProfile } from "./types";
import { Camera, Utensils, Globe, ShieldCheck, User } from "lucide-react";

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Guest',
  allergies: [],
  diets: [],
  spicyTolerance: 'Medium',
};

export const COMMON_ALLERGENS = [
  "Peanuts", "Tree Nuts", "Milk", "Egg", "Wheat", "Soy", "Fish", "Shellfish", "Sesame"
];

export const DIET_TYPES = [
  "Vegan", "Vegetarian", "Halal", "Kosher", "Gluten-Free", "Keto", "Paleo"
];

export const NAV_ITEMS = [
  { id: 'DASHBOARD', icon: Utensils, label: 'Home' },
  { id: 'SCAN_FOOD', icon: Camera, label: 'Scan' },
  { id: 'TRAVEL_MODE', icon: Globe, label: 'Travel' },
  { id: 'PROFILE', icon: User, label: 'Profile' },
];
