import {
  Sparkles,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Визуализатор Свадьбы",
    description:
      "Увидьте реалистичную 3D визуализацию вашей свадьбы с вашими лицами в выбранном стиле",
    gradient: "from-wedding-rose to-primary-glow",
  },
  {
    icon: Mail,
    title: "AI Создатель Приглашений",
    description:
      "Автоматически создавайте видео-приглашения с анимацией и персонализацией",
    gradient: "from-wedding-gold to-wedding-champagne",
  },
  {
    icon: ShoppingBag,
    title: "Маркетплейс Поставщиков",
    description:
      "1500+ верифицированных поставщиков с реальными отзывами и рейтингами",
    gradient: "from-primary to-wedding-rose",
  },
  {
    icon: CreditCard,
    title: "Безопасные Платежи",
    description:
      "Escrow система защищает ваши деньги. Рассрочка на услуги до 12 месяцев",
    gradient: "from-wedding-champagne to-wedding-gold",
  },
  {
    icon: Calendar,
    title: "Умный Планировщик",
    description:
      "AI рекомендации по бюджету, timeline свадьбы и автоматические напоминания",
    gradient: "from-wedding-rose to-primary",
  },
  {
    icon: Users,
    title: "Управление Гостями",
    description:
      "Цифровые приглашения с QR-кодами, отслеживание ответов и списки подарков",
    gradient: "from-wedding-gold to-wedding-rose",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-mesh relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-wedding-gold/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Все возможности</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Всё что нужно для{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              идеальной свадьбы
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Полный набор AI-инструментов для планирования вашей мечты
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card p-6 hover:scale-[1.02] transition-all duration-500 animate-fade-in ios-highlight"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 glow`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover indicator */}
              <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Подробнее</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
