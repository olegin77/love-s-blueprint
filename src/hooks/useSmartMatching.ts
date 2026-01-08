/**
 * Hook для использования Smart Matching Engine
 * Обеспечивает реактивный доступ к рекомендациям вендоров
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VendorMatchingEngine, type WeddingMatchParams } from "@/lib/matching-engine";
import type { VendorMatchResult, MatchReason } from "@/types/vendor-attributes";
import type { Database } from "@/integrations/supabase/types";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];
type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];

interface VendorWithMatch extends VendorProfile {
  matchResult?: VendorMatchResult;
}

interface UseSmartMatchingOptions {
  category?: VendorCategory;
  includeExcluded?: boolean;
  limit?: number;
  autoRefresh?: boolean;
}

interface UseSmartMatchingReturn {
  vendors: VendorWithMatch[];
  loading: boolean;
  error: string | null;
  weddingParams: WeddingMatchParams | null;
  refresh: () => Promise<void>;
  getMatchForVendor: (vendorId: string) => VendorMatchResult | undefined;
  topRecommendations: VendorWithMatch[];
  excludedVendors: VendorWithMatch[];
}

export function useSmartMatching(
  weddingPlanId: string | null,
  options: UseSmartMatchingOptions = {}
): UseSmartMatchingReturn {
  const { category, includeExcluded = false, limit = 20, autoRefresh = true } = options;

  const [vendors, setVendors] = useState<VendorWithMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weddingParams, setWeddingParams] = useState<WeddingMatchParams | null>(null);
  const [matchResults, setMatchResults] = useState<Map<string, VendorMatchResult>>(new Map());

  // Загрузка параметров свадьбы
  const loadWeddingParams = useCallback(async () => {
    if (!weddingPlanId) return null;

    const params = await VendorMatchingEngine.getWeddingParams(weddingPlanId);
    setWeddingParams(params);
    return params;
  }, [weddingPlanId]);

  // Основной метод загрузки рекомендаций
  const loadRecommendations = useCallback(async () => {
    if (!weddingPlanId) {
      setVendors([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Получаем параметры свадьбы
      const params = await loadWeddingParams();
      if (!params) {
        setError("Не удалось загрузить параметры свадьбы");
        return;
      }

      // Если категория указана, загружаем только для неё
      if (category) {
        const matches = await VendorMatchingEngine.findMatches(
          params,
          {
            category,
            location: params.location,
            availableOnDate: params.weddingDate,
          },
          { includeExcluded, limit }
        );

        // Загружаем данные вендоров
        const vendorIds = matches.map((m) => m.vendorId);
        if (vendorIds.length === 0) {
          setVendors([]);
          return;
        }

        const { data: vendorData, error: vendorError } = await supabase
          .from("vendor_profiles")
          .select("*")
          .in("id", vendorIds);

        if (vendorError) throw vendorError;

        // Объединяем с результатами мэтчинга
        const vendorsWithMatch: VendorWithMatch[] = matches
          .map((match) => {
            const vendor = vendorData?.find((v) => v.id === match.vendorId);
            if (!vendor) return null;
            return {
              ...vendor,
              matchResult: match,
            };
          })
          .filter(Boolean) as VendorWithMatch[];

        // Сохраняем в Map для быстрого доступа
        const resultsMap = new Map<string, VendorMatchResult>();
        matches.forEach((m) => resultsMap.set(m.vendorId, m));
        setMatchResults(resultsMap);

        setVendors(vendorsWithMatch);
      } else {
        // Загружаем для всех категорий
        const allMatches = await VendorMatchingEngine.findAllCategoryMatches(weddingPlanId);

        // Собираем все vendorId
        const allVendorIds = new Set<string>();
        const allResults: VendorMatchResult[] = [];
        
        Object.values(allMatches).forEach((matches) => {
          matches.forEach((m) => {
            allVendorIds.add(m.vendorId);
            allResults.push(m);
          });
        });

        if (allVendorIds.size === 0) {
          setVendors([]);
          return;
        }

        const { data: vendorData, error: vendorError } = await supabase
          .from("vendor_profiles")
          .select("*")
          .in("id", Array.from(allVendorIds));

        if (vendorError) throw vendorError;

        // Объединяем
        const vendorsWithMatch: VendorWithMatch[] = [];
        const resultsMap = new Map<string, VendorMatchResult>();

        allResults.forEach((match) => {
          const vendor = vendorData?.find((v) => v.id === match.vendorId);
          if (vendor && !vendorsWithMatch.find((v) => v.id === vendor.id)) {
            vendorsWithMatch.push({
              ...vendor,
              matchResult: match,
            });
            resultsMap.set(match.vendorId, match);
          }
        });

        // Сортируем по match score
        vendorsWithMatch.sort((a, b) => 
          (b.matchResult?.matchScore || 0) - (a.matchResult?.matchScore || 0)
        );

        setMatchResults(resultsMap);
        setVendors(vendorsWithMatch.slice(0, limit));
      }
    } catch (err) {
      console.error("Smart matching error:", err);
      setError(err instanceof Error ? err.message : "Ошибка загрузки рекомендаций");
    } finally {
      setLoading(false);
    }
  }, [weddingPlanId, category, includeExcluded, limit, loadWeddingParams]);

  // Автозагрузка при изменении параметров
  useEffect(() => {
    if (autoRefresh) {
      loadRecommendations();
    }
  }, [loadRecommendations, autoRefresh]);

  // Получить результат мэтчинга для конкретного вендора
  const getMatchForVendor = useCallback(
    (vendorId: string): VendorMatchResult | undefined => {
      return matchResults.get(vendorId);
    },
    [matchResults]
  );

  // Топ рекомендации (не исключённые, score > 50)
  const topRecommendations = vendors.filter(
    (v) => !v.matchResult?.excluded && (v.matchResult?.matchScore || 0) >= 50
  );

  // Исключённые вендоры
  const excludedVendors = vendors.filter((v) => v.matchResult?.excluded);

  return {
    vendors,
    loading,
    error,
    weddingParams,
    refresh: loadRecommendations,
    getMatchForVendor,
    topRecommendations,
    excludedVendors,
  };
}

/**
 * Hook для отображения причин мэтчинга
 */
export function useMatchReasons(matchResult?: VendorMatchResult) {
  const positiveReasons = matchResult?.reasons.filter(
    (r) => r.score > 0 && r.isPositive !== false
  ) || [];
  
  const negativeReasons = matchResult?.reasons.filter(
    (r) => r.isPositive === false
  ) || [];

  const topReasons = positiveReasons.slice(0, 3);
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Идеальный выбор";
    if (score >= 80) return "Отличный выбор";
    if (score >= 70) return "Хороший выбор";
    if (score >= 60) return "Подходит";
    if (score >= 40) return "Можно рассмотреть";
    return "Не рекомендуется";
  };

  return {
    positiveReasons,
    negativeReasons,
    topReasons,
    getScoreColor,
    getScoreLabel,
    hasExclusion: !!matchResult?.excluded,
    exclusionReason: matchResult?.exclusionReason,
    categoryScores: matchResult?.categoryScores,
  };
}
