/**
 * Компонент умных рекомендаций вендоров на основе атрибутов
 * Интегрируется с Planner для автоматического подбора команды
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartMatching } from "@/hooks/useSmartMatching";
import { MatchScoreBadge } from "@/components/vendor/MatchScoreBadge";
import type { Database } from "@/integrations/supabase/types";
import { Star, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type VendorCategory = Database['public']['Enums']['vendor_category'];

interface SmartVendorRecommendationsProps {
  weddingPlanId: string;
  category: VendorCategory;
  categoryBudget?: number;
}

export const SmartVendorRecommendations = ({
  weddingPlanId,
  category,
  categoryBudget,
}: SmartVendorRecommendationsProps) => {
  const navigate = useNavigate();
  
  // Используем новый хук для Smart Matching
  const { 
    vendors, 
    loading, 
    error, 
    topRecommendations,
    excludedVendors 
  } = useSmartMatching(weddingPlanId, {
    category,
    includeExcluded: true,
    limit: 5,
  });

  // Берём топ-3 рекомендации
  const recommendations = topRecommendations.slice(0, 3);

  const getCategoryName = (cat: VendorCategory): string => {
    const names: Record<VendorCategory, string> = {
      photographer: 'Фотограф',
      videographer: 'Видеограф',
      decorator: 'Декоратор',
      florist: 'Флорист',
      music: 'Музыкант',
      venue: 'Площадка',
      caterer: 'Кейтеринг',
      transport: 'Транспорт',
      makeup: 'Визажист',
      clothing: 'Одежда',
      other: 'Другое',
    };
    return names[cat] || cat;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Рекомендации для "{getCategoryName(category)}"
          </CardTitle>
          <CardDescription>
            К сожалению, не нашли подходящих вендоров для ваших критериев.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/marketplace')} variant="outline">
            Смотреть весь каталог
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Умные рекомендации: {getCategoryName(category)}
        </CardTitle>
        <CardDescription>
          Подобрано на основе вашего стиля, бюджета и даты
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((vendor, index) => {
          const match = vendor.matchResult;
          
          // Тематические изображения для категорий
          const categoryImages: Record<VendorCategory, string> = {
            photographer: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            videographer: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            decorator: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            florist: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            music: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            venue: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            caterer: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            transport: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            makeup: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            clothing: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
            other: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
          };
          
          const vendorImage = vendor.portfolio_images?.[0] || categoryImages[category];

          return (
            <div
              key={vendor.id}
              className="border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer"
              onClick={() => navigate(`/marketplace/${vendor.id}`)}
            >
              {/* Изображение поставщика */}
              <div className="relative h-32 w-full">
                <img 
                  src={vendorImage} 
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <Badge variant="default" className="absolute top-2 left-2 bg-primary">
                    Лучший выбор
                  </Badge>
                )}
                {/* Match Score Badge */}
                {match && (
                  <div className="absolute top-2 right-2">
                    <MatchScoreBadge matchResult={match} size="sm" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {vendor.business_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{vendor.rating || 'Нет оценок'}</span>
                      {(vendor.total_reviews ?? 0) > 0 && (
                        <span>({vendor.total_reviews} отзывов)</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">от</div>
                    <div className="text-lg font-semibold text-primary">
                      {vendor.starting_price
                        ? `${vendor.starting_price.toLocaleString()} сум`
                        : 'По запросу'}
                    </div>
                  </div>
                </div>

              {/* Match Score Bar */}
              {match && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Совместимость
                    </span>
                    <span className="font-semibold text-primary">
                      {match.matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${match.matchScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Причины совпадения */}
              {match?.reasons && match.reasons.length > 0 && (
                <div className="space-y-1.5">
                  {match.reasons.slice(0, 3).map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {reason.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Стили */}
              {vendor.styles && vendor.styles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {vendor.styles.slice(0, 3).map((style: string) => (
                    <Badge key={style} variant="outline" className="text-xs">
                      {style}
                    </Badge>
                  ))}
                </div>
              )}

              <Button className="w-full mt-4" variant="outline">
                Подробнее и забронировать
              </Button>
              </div>
            </div>
          );
        })}

        <Button
          onClick={() => navigate('/marketplace')}
          variant="ghost"
          className="w-full"
        >
          Показать больше вариантов
        </Button>
      </CardContent>
    </Card>
  );
};
