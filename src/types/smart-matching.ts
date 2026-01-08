/**
 * Smart Matching Engine Types
 * Типы для интеллектуального подбора поставщиков
 */

import { Database } from "@/integrations/supabase/types";

// Типы из базы данных
export type VendorCategory = Database["public"]["Enums"]["vendor_category"];
export type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];
export type WeddingPlan = Database["public"]["Tables"]["wedding_plans"]["Row"];

// Параметры свадьбы для матчинга
export interface WeddingMatchParams {
  id: string;
  weddingDate: Date | null;
  estimatedGuests: number;
  budgetTotal: number;
  budgetBreakdown: Record<string, number>;
  venueLocation: string | null;
  stylePreferences: string[];
  cuisinePreferences: string[];
  dietaryRequirements: string[];
  musicPreferences: string[];
  outdoorPreference: boolean;
  parkingNeeded: boolean;
  categoryPriorities: Record<string, "high" | "medium" | "low">;
}

// Причина совпадения/несовпадения
export interface MatchReason {
  criteria: string;
  score: number;
  maxScore: number;
  description: string;
  type: "positive" | "negative" | "neutral";
}

// Причина исключения поставщика
export interface ExclusionReason {
  filter: HardFilterType;
  description: string;
  vendorValue?: string | number;
  requiredValue?: string | number;
}

// Типы жёстких фильтров
export type HardFilterType =
  | "capacity_max"
  | "capacity_min"
  | "location"
  | "availability"
  | "budget_exceeded";

// Результат матчинга поставщика
export interface VendorMatchResult {
  vendor: VendorProfile;
  matchScore: number; // 0-100
  matchReasons: MatchReason[];
  excluded: boolean;
  exclusionReason?: ExclusionReason;
  categoryScores: CategoryScores;
}

// Баллы по категориям
export interface CategoryScores {
  style: number;
  rating: number;
  budget: number;
  experience: number;
  categorySpecific: number;
  verification: number;
}

// Веса для расчёта общего балла
export const SCORE_WEIGHTS: Record<keyof CategoryScores, number> = {
  style: 0.20,         // 20%
  rating: 0.15,        // 15%
  budget: 0.25,        // 25%
  experience: 0.10,    // 10%
  categorySpecific: 0.25, // 25%
  verification: 0.05,  // 5%
};

// Фильтры для поиска поставщиков
export interface VendorFilters {
  category?: VendorCategory;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  styles?: string[];
  languages?: string[];
  minRating?: number;
  verifiedOnly?: boolean;
}

// Опции для matching engine
export interface MatchingOptions {
  includeExcluded?: boolean; // Включать исключённых с причинами
  budgetFlexibility?: number; // Насколько можно превысить бюджет (0.2 = 20%)
  minScore?: number; // Минимальный балл для включения
  limit?: number; // Лимит результатов
}

// Дефолтные опции
export const DEFAULT_MATCHING_OPTIONS: MatchingOptions = {
  includeExcluded: false,
  budgetFlexibility: 0.2,
  minScore: 30,
  limit: 20,
};

// Маппинг категории поставщика на категорию бюджета
export const VENDOR_TO_BUDGET_CATEGORY: Record<VendorCategory, string> = {
  venue: "venue",
  photographer: "photography",
  videographer: "videography",
  caterer: "catering",
  florist: "flowers",
  decorator: "decoration",
  music: "music",
  makeup: "makeup",
  clothing: "attire",
  transport: "transportation",
  other: "other",
};

// Проценты бюджета по умолчанию для категорий
export const DEFAULT_BUDGET_PERCENTAGES: Record<string, number> = {
  venue: 0.35,        // 35% на площадку
  catering: 0.25,     // 25% на кейтеринг
  photography: 0.10,  // 10% на фото
  videography: 0.08,  // 8% на видео
  flowers: 0.05,      // 5% на цветы
  decoration: 0.05,   // 5% на декор
  music: 0.04,        // 4% на музыку
  makeup: 0.03,       // 3% на макияж
  attire: 0.03,       // 3% на одежду
  transportation: 0.02, // 2% на транспорт
};

// Стили для разных категорий
export const CATEGORY_STYLES: Record<VendorCategory, string[]> = {
  venue: ["classic", "modern", "rustic", "garden", "beach", "industrial", "traditional"],
  photographer: ["documentary", "traditional", "artistic", "fine-art", "candid", "romantic"],
  videographer: ["cinematic", "documentary", "traditional", "modern", "story-driven"],
  caterer: ["european", "asian", "uzbek", "fusion", "vegetarian", "halal"],
  florist: ["romantic", "minimalist", "lush", "wildflower", "tropical", "classic"],
  decorator: ["elegant", "rustic", "boho", "glamorous", "minimalist", "vintage"],
  music: ["live-band", "dj", "classical", "pop", "traditional", "mixed"],
  makeup: ["natural", "glamorous", "vintage", "bold", "bridal", "editorial"],
  clothing: ["traditional", "modern", "western", "fusion", "designer"],
  transport: ["luxury", "vintage", "classic", "limousine", "sports-car"],
  other: [],
};
