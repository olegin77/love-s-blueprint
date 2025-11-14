import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, CreditCard, Trash2 } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте настройками вашего аккаунта
          </p>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Уведомления</CardTitle>
            </div>
            <CardDescription>
              Настройте, какие уведомления вы хотите получать
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Новые сообщения</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления о новых сообщениях от поставщиков
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Напоминания</Label>
                <p className="text-sm text-muted-foreground">
                  Напоминания о важных датах и задачах
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Приватность и безопасность</CardTitle>
            </div>
            <CardDescription>
              Управляйте вашей конфиденциальностью
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Публичный профиль</Label>
                <p className="text-sm text-muted-foreground">
                  Разрешить другим видеть ваш профиль
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">
                  Добавьте дополнительный уровень защиты
                </p>
              </div>
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle>Язык и регион</CardTitle>
            </div>
            <CardDescription>
              Настройте язык и региональные параметры
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Язык</Label>
                <p className="text-sm text-muted-foreground">
                  Русский
                </p>
              </div>
              <Button variant="outline" size="sm">
                Изменить
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Валюта</Label>
                <p className="text-sm text-muted-foreground">
                  UZS (Узбекский сум)
                </p>
              </div>
              <Button variant="outline" size="sm">
                Изменить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <CardTitle>Подписка и платежи</CardTitle>
            </div>
            <CardDescription>
              Управляйте вашей подпиской
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">Бесплатный план</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Базовые функции планирования свадьбы
                </p>
              </div>

              <Button className="w-full">
                Улучшить до Premium
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Опасная зона</CardTitle>
            </div>
            <CardDescription>
              Необратимые действия с аккаунтом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full">
              Удалить аккаунт
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Это действие нельзя отменить. Все ваши данные будут удалены.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
