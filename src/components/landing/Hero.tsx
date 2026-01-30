import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-wedding.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-32 left-10 animate-float">
        <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center glow">
          <Heart className="w-8 h-8 text-primary fill-primary/50" />
        </div>
      </div>
      <div className="absolute bottom-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center glow-lg">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
      </div>
      <div className="absolute top-1/2 right-32 animate-float hidden lg:flex" style={{ animationDelay: "0.5s" }}>
        <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-hero" />
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-card mb-8 animate-scale-in">
            <div className="w-2 h-2 rounded-full bg-gradient-hero animate-pulse" />
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Увидьте свою{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              мечту о свадьбе
            </span>
            <br />
            <span className="text-foreground/90">ещё до её начала</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="text-lg h-14 px-8 bg-gradient-hero shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            >
              Начать планирование
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 glass-button border-2 hover:bg-accent/50 group"
              onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Смотреть демо
            </Button>
          </div>

          {/* Stats with glass cards */}
          <div className="grid grid-cols-3 gap-4 mt-14 pt-8">
            {[
              { value: "1500+", label: "Поставщиков" },
              { value: "10K+", label: "Свадеб" },
              { value: "98%", label: "Довольны" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card p-4 text-center hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
