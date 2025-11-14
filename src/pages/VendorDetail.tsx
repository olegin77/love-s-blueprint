import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from "@/components/BookingForm";
import { useToast } from "@/hooks/use-toast";

interface VendorProfile {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  price_range_min: number;
  price_range_max: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

const VendorDetail = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", vendorId)
        .single();

      if (vendorError) throw vendorError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewsWithUsers = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", review.user_id)
            .single();

          return {
            ...review,
            user: userData || { full_name: "Anonymous" },
          };
        })
      );

      setVendor(vendorData);
      setReviews(reviewsWithUsers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные поставщика",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground">Поставщик не найден</p>
          <Button onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к маркетплейсу
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl">{vendor.business_name}</CardTitle>
                  {vendor.verified && (
                    <Badge variant="default">Проверен</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  <Badge variant="outline">{vendor.category}</Badge>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vendor.location}
                  </span>
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Забронировать
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать бронирование</DialogTitle>
                  </DialogHeader>
                  <BookingForm
                    vendorId={vendor.id}
                    onSuccess={() => {
                      setDialogOpen(false);
                      toast({
                        title: "Успешно!",
                        description: "Запрос на бронирование отправлен",
                      });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold">{vendor.rating}</span>
                <span className="text-muted-foreground">({vendor.total_reviews} отзывов)</span>
              </div>
              <div className="text-lg font-semibold">
                ${vendor.price_range_min} - ${vendor.price_range_max}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">О нас</h3>
              <p className="text-muted-foreground">{vendor.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отзывы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">Пока нет отзывов</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.user.full_name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorDetail;