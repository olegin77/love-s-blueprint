import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, DollarSign, Check, X, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Booking {
  id: string;
  booking_date: string;
  status: string;
  payment_status: string;
  price: number;
  notes: string;
  created_at: string;
  couple_profile: {
    full_name: string;
    email: string;
    phone: string;
  };
  wedding_plan: {
    wedding_date: string;
    theme: string;
    venue_location: string;
  };
}

export const BookingManagement = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendorProfile } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!vendorProfile) return;

      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(`
          *,
          wedding_plan:wedding_plans(wedding_date, theme, venue_location)
        `)
        .eq("vendor_id", vendorProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", booking.couple_user_id)
            .single();

          return {
            ...booking,
            couple_profile: profileData || { full_name: "Unknown", email: "", phone: "" },
            wedding_plan: Array.isArray(booking.wedding_plan) ? booking.wedding_plan[0] : booking.wedding_plan,
          };
        })
      );

      setBookings(enrichedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить бронирования",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Статус изменен на ${newStatus === "confirmed" ? "подтвержден" : "отклонен"}`,
      });

      fetchBookings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить статус",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Подтверждено</Badge>;
      case "pending":
        return <Badge variant="outline">Ожидание</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Отменено</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Завершено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filterBookings = (status: string) => {
    if (status === "all") return bookings;
    return bookings.filter((b) => b.status === status);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Всего</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Ожидают</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-sm text-muted-foreground">Подтверждено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Завершено</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Ожидают ({stats.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Подтверждено ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filterBookings(activeTab).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Нет бронирований
              </CardContent>
            </Card>
          ) : (
            filterBookings(activeTab).map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {booking.couple_profile.full_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Свадьба: {new Date(booking.wedding_plan.wedding_date).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Контакты</p>
                        <p className="text-muted-foreground">{booking.couple_profile.email}</p>
                        <p className="text-muted-foreground">{booking.couple_profile.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Дата бронирования</p>
                        <p className="text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Цена</p>
                        <p className="text-muted-foreground">${booking.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Создано</p>
                        <p className="text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.wedding_plan.theme && (
                    <div>
                      <p className="text-sm font-medium">Тема свадьбы</p>
                      <p className="text-sm text-muted-foreground">{booking.wedding_plan.theme}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div>
                      <p className="text-sm font-medium">Примечания</p>
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}

                  {booking.status === "pending" && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusChange(booking.id, "confirmed")}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Подтвердить
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleStatusChange(booking.id, "cancelled")}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};