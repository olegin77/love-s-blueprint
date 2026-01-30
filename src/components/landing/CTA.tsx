import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const CTA = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-hero p-12 shadow-2xl overflow-hidden">
            {/* Decorative glass elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            
            {/* Floating hearts */}
            <div className="absolute top-8 right-8 animate-float">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white/50" />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 animate-float" style={{ animationDelay: "1s" }}>
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="relative z-10 text-center text-white">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-8">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Начните планирование бесплатно
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Готовы увидеть свою свадьбу мечты?
              </h2>

              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Присоединяйтесь к тысячам пар, которые уже планируют свою идеальную свадьбу с WeddingTech UZ
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Ваш email"
                  className="h-14 bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50 rounded-xl"
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 whitespace-nowrap hover:scale-105 transition-all duration-300 shadow-lg rounded-xl font-semibold group"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Начать
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-sm text-white/70 mt-6">
                Бесплатно навсегда. Кредитная карта не требуется.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
