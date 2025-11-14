import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, CheckSquare, Users, Plus } from "lucide-react";

const Planner = () => {
  // Mock data - в реальности будет из базы данных
  const checklistItems = [
    { id: 1, title: "Выбрать дату свадьбы", completed: false, category: "Основное" },
    { id: 2, title: "Определить бюджет", completed: false, category: "Финансы" },
    { id: 3, title: "Составить список гостей", completed: false, category: "Гости" },
    { id: 4, title: "Забронировать площадку", completed: false, category: "Площадка" },
    { id: 5, title: "Нанять фотографа", completed: false, category: "Поставщики" },
    { id: 6, title: "Заказать приглашения", completed: false, category: "Приглашения" },
  ];

  const completedTasks = checklistItems.filter(item => item.completed).length;
  const progress = (completedTasks / checklistItems.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Планировщик свадьбы</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте всеми аспектами вашей свадьбы в одном месте
            </p>
          </div>
          
          <Button size="lg">
            <Plus className="mr-2 h-5 h-5" />
            Создать план
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-hero text-white">
          <CardHeader>
            <CardTitle>Общий прогресс</CardTitle>
            <CardDescription className="text-white/90">
              Вы выполнили {completedTasks} из {checklistItems.length} задач
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            <p className="text-sm mt-2 text-white/90">
              {progress.toFixed(0)}% готово
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Дата свадьбы
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Не выбрана</div>
              <Button variant="link" className="px-0 text-sm">
                Выбрать дату
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Бюджет
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 UZS</div>
              <Button variant="link" className="px-0 text-sm">
                Настроить бюджет
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Гости
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <Button variant="link" className="px-0 text-sm">
                Добавить гостей
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Задачи
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedTasks}/{checklistItems.length}
              </div>
              <p className="text-xs text-muted-foreground">
                завершено
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Чек-лист задач</CardTitle>
            <CardDescription>
              Отслеживайте прогресс подготовки к свадьбе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      className="w-5 h-5 rounded border-2 border-primary"
                      readOnly
                    />
                    <div>
                      <p className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline свадьбы</CardTitle>
            <CardDescription>
              Планируйте все события в хронологическом порядке
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Timeline будет доступен после создания плана свадьбы</p>
              <Button className="mt-4">
                Создать план
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Planner;
