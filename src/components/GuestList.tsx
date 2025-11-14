import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserCheck, UserX, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Guest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  attendance_status: string;
  plus_one_allowed: boolean;
  plus_one_name: string;
  dietary_restrictions: string;
  notes: string;
}

interface GuestListProps {
  weddingPlanId: string;
}

export const GuestList = ({ weddingPlanId }: GuestListProps) => {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    plus_one_allowed: false,
    plus_one_name: "",
    dietary_restrictions: "",
    notes: "",
  });

  useEffect(() => {
    fetchGuests();
  }, [weddingPlanId]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список гостей",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("guests").insert({
        wedding_plan_id: weddingPlanId,
        ...formData,
        attendance_status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Гость добавлен",
      });

      setDialogOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        plus_one_allowed: false,
        plus_one_name: "",
        dietary_restrictions: "",
        notes: "",
      });
      fetchGuests();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить гостя",
      });
    }
  };

  const handleDelete = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", guestId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Гость удален из списка",
      });
      fetchGuests();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить гостя",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500"><UserCheck className="w-3 h-3 mr-1" />Подтвердил</Badge>;
      case "declined":
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Отказался</Badge>;
      default:
        return <Badge variant="outline"><UserMinus className="w-3 h-3 mr-1" />Ожидание</Badge>;
    }
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.attendance_status === "confirmed").length,
    declined: guests.filter((g) => g.attendance_status === "declined").length,
    pending: guests.filter((g) => g.attendance_status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Всего гостей</p>
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
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <p className="text-sm text-muted-foreground">Отказались</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Ожидают</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список гостей</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Добавить гостя
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Добавить гостя</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Полное имя *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="plus_one"
                    checked={formData.plus_one_allowed}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, plus_one_allowed: checked })
                    }
                  />
                  <Label htmlFor="plus_one">Разрешить +1</Label>
                </div>

                {formData.plus_one_allowed && (
                  <div className="space-y-2">
                    <Label htmlFor="plus_one_name">Имя +1</Label>
                    <Input
                      id="plus_one_name"
                      value={formData.plus_one_name}
                      onChange={(e) => setFormData({ ...formData, plus_one_name: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dietary">Диетические ограничения</Label>
                  <Input
                    id="dietary"
                    value={formData.dietary_restrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_restrictions: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  Добавить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Загрузка...</p>
          ) : guests.length === 0 ? (
            <p className="text-muted-foreground">Список гостей пуст</p>
          ) : (
            <div className="space-y-4">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{guest.full_name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {guest.email && <span>{guest.email}</span>}
                      {guest.phone && <span>{guest.phone}</span>}
                    </div>
                    {guest.plus_one_allowed && (
                      <p className="text-sm text-muted-foreground mt-1">
                        +1: {guest.plus_one_name || "Не указан"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(guest.attendance_status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(guest.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};