import { UserPlus, Search, Calendar, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Создайте профиль",
    description:
      "Зарегистрируйтесь и расскажите о вашей свадьбе - дата, бюджет, количество гостей",
  },
  {
    icon: Search,
    title: "Найдите поставщиков",
    description:
      "Используйте AI-рекомендации для поиска идеальных поставщиков из 1500+ профессионалов",
  },
  {
    icon: Calendar,
    title: "Планируйте с AI",
    description:
      "Умный планировщик создаст timeline, напоминания и поможет с бюджетом",
  },
  {
    icon: PartyPopper,
    title: "Наслаждайтесь",
    description:
      "Всё организовано, оплачено и подтверждено. Просто наслаждайтесь вашим днём!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-mesh relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-wedding-gold/10 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">4 простых шага</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Как это{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              работает?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Четыре простых шага к свадьбе вашей мечты
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 z-0">
                    <div className="h-full bg-gradient-to-r from-primary/50 to-primary/10" />
                  </div>
                )}

                <div 
                  className="relative z-10 glass-card p-6 h-full hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon with glow */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 shadow-lg glow">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Step number */}
                    <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center mb-4 text-sm font-bold text-primary border border-primary/20">
                      {index + 1}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
