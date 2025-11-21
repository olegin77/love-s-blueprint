import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Users, DollarSign, Heart, Camera, Utensils, Music, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

const weddingStyles = [
  {
    id: "rustic",
    name: "Рустик",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    description: "Натуральные материалы, природные цвета"
  },
  {
    id: "modern",
    name: "Модерн",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    description: "Минимализм, чистые линии"
  },
  {
    id: "traditional",
    name: "Традиционная",
    image: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=300&fit=crop",
    description: "Классика, элегантность"
  },
  {
    id: "elegant",
    name: "Элегантная",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop",
    description: "Изысканность, роскошь"
  },
  {
    id: "bohemian",
    name: "Бохо",
    image: "https://images.unsplash.com/photo-1525258437537-ea085f00d60d?w=400&h=300&fit=crop",
    description: "Свобода, креативность"
  },
  {
    id: "garden",
    name: "Садовая",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop",
    description: "На природе, цветы"
  }
];

const priorityOptions = [
  { id: "photography", label: "Фото/Видео", icon: Camera },
  { id: "catering", label: "Еда", icon: Utensils },
  { id: "entertainment", label: "Шоу/Музыка", icon: Music },
  { id: "decoration", label: "Декор", icon: Palette }
];

const schema = z.object({
  budget_total: z.number().min(1000, "Минимальный бюджет 1000"),
  estimated_guests: z.number().min(10, "Минимум 10 гостей").max(1000, "Максимум 1000 гостей"),
  wedding_date: z.string().optional(),
  venue_location: z.string().min(2, "Укажите город"),
  style_preferences: z.array(z.string()).min(1, "Выберите хотя бы один стиль"),
  priorities: z.object({
    photography: z.enum(["low", "medium", "high"]),
    catering: z.enum(["low", "medium", "high"]),
    entertainment: z.enum(["low", "medium", "high"]),
    decoration: z.enum(["low", "medium", "high"])
  })
});

type OnboardingFormData = z.infer<typeof schema>;

interface OnboardingQuizProps {
  onComplete: (weddingPlanId: string) => void;
}

export const OnboardingQuiz = ({ onComplete }: OnboardingQuizProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<{
    photography: "low" | "medium" | "high";
    catering: "low" | "medium" | "high";
    entertainment: "low" | "medium" | "high";
    decoration: "low" | "medium" | "high";
  }>({
    photography: "medium",
    catering: "medium",
    entertainment: "medium",
    decoration: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priorities: {
        photography: "medium",
        catering: "medium",
        entertainment: "medium",
        decoration: "medium"
      }
    }
  });

  const budget = watch("budget_total");
  const guests = watch("estimated_guests");

  const toggleStyle = (styleId: string) => {
    const newStyles = selectedStyles.includes(styleId)
      ? selectedStyles.filter(s => s !== styleId)
      : [...selectedStyles, styleId];
    setSelectedStyles(newStyles);
    setValue("style_preferences", newStyles);
  };

  const updatePriority = (key: keyof typeof priorities, value: number) => {
    const level = (value <= 33 ? "low" : value <= 66 ? "medium" : "high") as "low" | "medium" | "high";
    const newPriorities = { ...priorities, [key]: level };
    setPriorities(newPriorities);
    setValue("priorities", newPriorities);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Необходимо войти в систему");
        return;
      }

      const { data: weddingPlan, error } = await supabase
        .from("wedding_plans")
        .insert({
          couple_user_id: user.id,
          budget_total: data.budget_total,
          estimated_guests: data.estimated_guests,
          wedding_date: data.wedding_date || null,
          venue_location: data.venue_location,
          style_preferences: data.style_preferences,
          priorities: data.priorities,
          theme: data.style_preferences[0] || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("План свадьбы создан! Подбираем идеальных специалистов...");
      onComplete(weddingPlan.id);
    } catch (error: any) {
      console.error("Error creating wedding plan:", error);
      toast.error("Ошибка при создании плана");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Давайте спланируем вашу свадьбу</h2>
              <p className="text-muted-foreground">Ответьте на несколько вопросов, чтобы мы подобрали идеальных специалистов</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Общий бюджет (UZS)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="15000000"
                  {...register("budget_total", { valueAsNumber: true })}
                />
                {errors.budget_total && (
                  <p className="text-sm text-destructive mt-1">{errors.budget_total.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Количество гостей
                </Label>
                <Input
                  id="guests"
                  type="number"
                  placeholder="150"
                  {...register("estimated_guests", { valueAsNumber: true })}
                />
                {errors.estimated_guests && (
                  <p className="text-sm text-destructive mt-1">{errors.estimated_guests.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дата свадьбы (необязательно)
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("wedding_date")}
                />
              </div>

              <div>
                <Label htmlFor="location">Город проведения</Label>
                <Input
                  id="location"
                  placeholder="Ташкент"
                  {...register("venue_location")}
                />
                {errors.venue_location && (
                  <p className="text-sm text-destructive mt-1">{errors.venue_location.message}</p>
                )}
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Далее
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Выберите стиль свадьбы</h2>
              <p className="text-muted-foreground">Можно выбрать несколько вариантов</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weddingStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedStyles.includes(style.id)
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => toggleStyle(style.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="object-cover w-full h-full"
                      />
                      {selectedStyles.includes(style.id) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Heart className="w-8 h-8 fill-primary text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{style.name}</h3>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {errors.style_preferences && (
              <p className="text-sm text-destructive text-center">{errors.style_preferences.message}</p>
            )}

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Назад
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={selectedStyles.length === 0}>
                Далее
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Расставьте приоритеты</h2>
              <p className="text-muted-foreground">На что вы хотите потратить больше бюджета?</p>
            </div>

            <div className="space-y-8">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                const value = priorities[option.id as keyof typeof priorities];
                const numValue = value === "low" ? 25 : value === "medium" ? 50 : 75;

                return (
                  <div key={option.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {option.label}
                      </Label>
                      <span className="text-sm font-medium capitalize">
                        {value === "low" ? "Низкий" : value === "medium" ? "Средний" : "Высокий"}
                      </span>
                    </div>
                    <Slider
                      value={[numValue]}
                      onValueChange={(vals) => updatePriority(option.id as keyof typeof priorities, vals[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Ваш профиль:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>💰 Бюджет: {budget?.toLocaleString()} UZS</li>
                <li>👥 Гостей: {guests}</li>
                <li>🎨 Стили: {selectedStyles.map(s => weddingStyles.find(ws => ws.id === s)?.name).join(", ")}</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Назад
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Создаём план..." : "Начать планирование"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" : s < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};