import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Heart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Дней до свадьбы",
      value: "—",
      icon: Calendar,
      description: "Создайте план свадьбы",
    },
    {
      title: "Бюджет",
      value: "—",
      icon: DollarSign,
      description: "Настройте бюджет",
    },
    {
      title: "Гостей",
      value: "—",
      icon: Users,
      description: "Добавьте гостей",
    },
    {
      title: "Поставщиков",
      value: "0",
      icon: Heart,
      description: "Забронировано",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Добро пожаловать, {profile?.full_name || "Гость"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.role === "vendor" 
                ? "Управляйте вашими услугами" 
                : "Начните планирование вашей мечты"}
            </p>
          </div>
          
          {profile?.role === "couple" && (
            <Button size="lg" onClick={() => navigate("/planner")}>
              <Plus className="mr-2 h-5 w-5" />
              Создать план свадьбы
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        {profile?.role === "couple" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-elegant transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Начните с этих шагов для организации вашей свадьбы
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => navigate("/marketplace")}
            >
              <Heart className="h-6 w-6 mb-2 text-primary" />
              <div className="font-semibold">Найти поставщиков</div>
              <div className="text-sm text-muted-foreground mt-1">
                1500+ профессионалов
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => navigate("/planner")}
            >
              <Calendar className="h-6 w-6 mb-2 text-primary" />
              <div className="font-semibold">Планировщик</div>
              <div className="text-sm text-muted-foreground mt-1">
                Управляйте вашим планом
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => navigate("/profile")}
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <div className="font-semibold">Профиль</div>
              <div className="text-sm text-muted-foreground mt-1">
                Управление аккаунтом
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-accent/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              Совет дня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Начните с создания бюджета и списка гостей. Это поможет вам лучше планировать все остальные аспекты свадьбы!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
