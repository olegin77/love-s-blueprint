/**
 * Smart Matching Engine для подбора вендоров
 * Реализует алгоритм Bridebook-style мэтчинга на основе атрибутов
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  VendorAttributes,
  VendorMatchResult,
  MatchReason,
  PhotographerAttributes,
  MusicianAttributes,
  DecoratorAttributes,
} from "@/types/vendor-attributes";

type VendorCategory = Database['public']['Enums']['vendor_category'];

/**
 * Параметры свадьбы для мэтчинга
 */
export interface WeddingMatchParams {
  weddingDate?: Date;
  budget: number; // Общий бюджет
  categoryBudget?: number; // Бюджет для конкретной категории
  guestCount: number;
  style?: string; // "rustic", "modern", "traditional", "elegant"
  location?: string; // Город
  languages?: string[]; // Предпочитаемые языки
  priorities?: {
    photography?: 'high' | 'medium' | 'low';
    catering?: 'high' | 'medium' | 'low';
    entertainment?: 'high' | 'medium' | 'low';
    decoration?: 'high' | 'medium' | 'low';
  };
}

/**
 * Фильтры для поиска вендоров
 */
interface VendorFilters {
  category: VendorCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  availableOnDate?: Date;
  styles?: string[];
  languages?: string[];
}

/**
 * Класс для работы с Matching Engine
 */
export class VendorMatchingEngine {
  /**
   * Основной метод поиска подходящих вендоров
   */
  static async findMatches(
    params: WeddingMatchParams,
    filters: VendorFilters
  ): Promise<VendorMatchResult[]> {
    try {
      // Шаг 1: Hard Filter (жесткий отсев)
      let query = supabase
        .from('vendor_profiles')
        .select('*')
        .eq('category', filters.category);

      // Фильтр по цене
      if (filters.minPrice !== undefined) {
        query = query.gte('starting_price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('starting_price', filters.maxPrice);
      }

      // Фильтр по локации
      if (filters.location) {
        query = query.contains('service_area', [filters.location]);
      }

      const { data: vendors, error } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        return [];
      }

      if (!vendors || vendors.length === 0) {
        return [];
      }

      // Шаг 2: Проверка доступности
      let availableVendors = vendors;
      if (filters.availableOnDate) {
        availableVendors = await this.filterByAvailability(
          vendors,
          filters.availableOnDate
        );
      }

      // Шаг 3: Soft Filter (расчет совместимости)
      const matchResults: VendorMatchResult[] = [];

      for (const vendor of availableVendors) {
        const matchScore = await this.calculateMatchScore(vendor, params, filters);
        
        matchResults.push({
          vendorId: vendor.id,
          matchScore: matchScore.score,
          reasons: matchScore.reasons,
          estimatedPrice: vendor.starting_price || undefined,
          availableOnDate: true,
        });
      }

      // Сортировка по score
      matchResults.sort((a, b) => b.matchScore - a.matchScore);

      // Сохранить результаты в кэш (если есть wedding_plan_id)
      // await this.cacheRecommendations(matchResults, weddingPlanId);

      return matchResults;
    } catch (error) {
      console.error('Matching engine error:', error);
      return [];
    }
  }

  /**
   * Фильтрация по доступности на дату
   */
  private static async filterByAvailability(
    vendors: any[],
    date: Date
  ): Promise<any[]> {
    const vendorIds = vendors.map(v => v.id);
    
    const { data: availability } = await supabase
      .from('vendor_availability')
      .select('vendor_id, is_available')
      .in('vendor_id', vendorIds)
      .eq('date', date.toISOString().split('T')[0])
      .eq('is_available', true);

    const availableIds = new Set(availability?.map(a => a.vendor_id) || []);

    // Если нет записей о недоступности, считаем вендора доступным
    return vendors.filter(
      v => availableIds.has(v.id) || !availability?.some(a => a.vendor_id === v.id)
    );
  }

  /**
   * Расчет score совместимости
   */
  private static async calculateMatchScore(
    vendor: any,
    params: WeddingMatchParams,
    filters: VendorFilters
  ): Promise<{ score: number; reasons: MatchReason[] }> {
    let totalScore = 0;
    const reasons: MatchReason[] = [];

    // Базовый score за наличие профиля
    totalScore += 10;

    // 1. Совпадение стиля (+10-20 баллов)
    if (params.style && vendor.styles?.includes(params.style)) {
      const styleScore = 20;
      totalScore += styleScore;
      reasons.push({
        type: 'style',
        score: styleScore,
        description: `Стиль "${params.style}" соответствует вашим предпочтениям`,
      });
    }

    // 2. Рейтинг вендора (+0-15 баллов)
    if (vendor.rating) {
      const ratingScore = Math.round((vendor.rating / 5) * 15);
      totalScore += ratingScore;
      reasons.push({
        type: 'rating',
        score: ratingScore,
        description: `Высокий рейтинг: ${vendor.rating}/5 (${vendor.total_reviews} отзывов)`,
      });
    }

    // 3. Бюджетное соответствие (+10-15 баллов)
    if (filters.maxPrice && vendor.starting_price) {
      const budgetFit = (filters.maxPrice - vendor.starting_price) / filters.maxPrice;
      if (budgetFit >= 0 && budgetFit <= 0.3) {
        // Оптимальная цена (70-100% бюджета)
        const budgetScore = 15;
        totalScore += budgetScore;
        reasons.push({
          type: 'budget',
          score: budgetScore,
          description: 'Цена идеально вписывается в бюджет',
        });
      } else if (budgetFit > 0.3 && budgetFit <= 0.5) {
        // Дешевле бюджета (50-70%)
        const budgetScore = 10;
        totalScore += budgetScore;
        reasons.push({
          type: 'budget',
          score: budgetScore,
          description: 'Хорошее соотношение цены и качества',
        });
      }
    }

    // 4. Специфичные атрибуты категории
    const categoryScore = this.calculateCategorySpecificScore(
      vendor,
      params,
      filters
    );
    totalScore += categoryScore.score;
    reasons.push(...categoryScore.reasons);

    // 5. Локация (+5 баллов за точное совпадение)
    if (params.location && vendor.service_area?.includes(params.location)) {
      const locationScore = 5;
      totalScore += locationScore;
      reasons.push({
        type: 'location',
        score: locationScore,
        description: `Работает в городе ${params.location}`,
      });
    }

    // 6. Языки (+10 баллов)
    if (params.languages && vendor.languages) {
      const hasCommonLanguage = params.languages.some(lang =>
        vendor.languages.includes(lang)
      );
      if (hasCommonLanguage) {
        const languageScore = 10;
        totalScore += languageScore;
        reasons.push({
          type: 'language',
          score: languageScore,
          description: 'Поддерживает ваши языки общения',
        });
      }
    }

    return {
      score: Math.min(totalScore, 100), // Максимум 100 баллов
      reasons,
    };
  }

  /**
   * Специфичный score для каждой категории
   */
  private static calculateCategorySpecificScore(
    vendor: any,
    params: WeddingMatchParams,
    filters: VendorFilters
  ): { score: number; reasons: MatchReason[] } {
    let score = 0;
    const reasons: MatchReason[] = [];

    const attributes = vendor.attributes as VendorAttributes | null;
    if (!attributes) return { score, reasons };

    switch (filters.category) {
      case 'photographer':
      case 'videographer':
        const photoAttrs = attributes as PhotographerAttributes;
        
        // Большая свадьба требует second shooter
        if (params.guestCount > 200 && photoAttrs.hasSecondShooter) {
          score += 15;
          reasons.push({
            type: 'feature',
            score: 15,
            description: 'Второй фотограф для большой свадьбы',
          });
        }

        // Наличие дрона - бонус
        if (photoAttrs.hasDrone) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: 'Аэросъемка с дрона',
          });
        }

        // SDE - если важно показать видео на банкете
        if (photoAttrs.providesSDE) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: 'Монтаж в день свадьбы (SDE)',
          });
        }
        break;

      case 'music':
        const musicAttrs = attributes as MusicianAttributes;
        
        // Совпадение жанров
        if (musicAttrs.genres && musicAttrs.genres.length > 5) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: 'Широкий репертуар',
          });
        }

        // Включенное оборудование
        if (musicAttrs.soundEquipmentIncluded) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: 'Звуковое оборудование включено',
          });
        }
        break;

      case 'decorator':
      case 'florist':
        const decorAttrs = attributes as DecoratorAttributes;
        
        // Reuse декора - экономия бюджета
        if (decorAttrs.reuseItems) {
          score += 10;
          reasons.push({
            type: 'budget',
            score: 10,
            description: 'Повторное использование декора (экономия)',
          });
        }

        // 3D визуализация - профессионализм
        if (decorAttrs.provides3DVisualization) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: '3D визуализация проекта',
          });
        }
        break;
    }

    return { score, reasons };
  }

  /**
   * Кэширование рекомендаций в базе данных
   */
  private static async cacheRecommendations(
    matches: VendorMatchResult[],
    weddingPlanId: string,
    category: VendorCategory
  ): Promise<void> {
    try {
      const recommendations = matches.map(match => ({
        wedding_plan_id: weddingPlanId,
        vendor_id: match.vendorId,
        category,
        match_score: match.matchScore,
        match_reasons: match.reasons as any, // JSONB type
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      }));

      await supabase.from('vendor_recommendations').upsert(recommendations, {
        onConflict: 'wedding_plan_id,vendor_id',
      });
    } catch (error) {
      console.error('Error caching recommendations:', error);
    }
  }

  /**
   * Получить кэшированные рекомендации
   */
  static async getCachedRecommendations(
    weddingPlanId: string,
    category: VendorCategory
  ): Promise<VendorMatchResult[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_recommendations')
        .select('*')
        .eq('wedding_plan_id', weddingPlanId)
        .eq('category', category)
        .gt('expires_at', new Date().toISOString())
        .order('match_score', { ascending: false });

      if (error || !data) return [];

      return data.map(rec => ({
        vendorId: rec.vendor_id,
        matchScore: rec.match_score,
        reasons: (rec.match_reasons as unknown) as MatchReason[],
        availableOnDate: true,
      }));
    } catch (error) {
      console.error('Error fetching cached recommendations:', error);
      return [];
    }
  }
}
