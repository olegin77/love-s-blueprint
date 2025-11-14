import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface CreateWeddingPlanDialogProps {
  onSuccess?: () => void;
}

export const CreateWeddingPlanDialog = ({ onSuccess }: CreateWeddingPlanDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    wedding_date: "",
    venue_location: "",
    theme: "",
    estimated_guests: "",
    budget_total: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("wedding_plans").insert({
        couple_user_id: user.id,
        wedding_date: formData.wedding_date,
        venue_location: formData.venue_location,
        theme: formData.theme,
        estimated_guests: parseInt(formData.estimated_guests) || null,
        budget_total: parseFloat(formData.budget_total) || null,
        notes: formData.notes,
        budget_spent: 0,
      });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Свадебный план создан",
      });

      setOpen(false);
      setFormData({
        wedding_date: "",
        venue_location: "",
        theme: "",
        estimated_guests: "",
        budget_total: "",
        notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать план",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать план
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать свадебный план</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wedding_date">Дата свадьбы *</Label>
              <Input
                id="wedding_date"
                type="date"
                value={formData.wedding_date}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_location">Место проведения</Label>
              <Input
                id="venue_location"
                placeholder="Название места"
                value={formData.venue_location}
                onChange={(e) => setFormData({ ...formData, venue_location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Тема свадьбы</Label>
            <Input
              id="theme"
              placeholder="Классическая, современная, рустик..."
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_guests">Количество гостей</Label>
              <Input
                id="estimated_guests"
                type="number"
                placeholder="50"
                value={formData.estimated_guests}
                onChange={(e) => setFormData({ ...formData, estimated_guests: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_total">Общий бюджет</Label>
              <Input
                id="budget_total"
                type="number"
                step="0.01"
                placeholder="10000"
                value={formData.budget_total}
                onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация о вашей свадьбе..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Создание..." : "Создать план"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};