import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.home'), href: "top" },
    { name: t('marketplace.title'), href: "/marketplace" },
    { name: "Цены", href: "pricing" },
    { name: "О нас", href: "about" },
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      return;
    }
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg glow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              WeddingTech
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button 
              variant="ghost" 
              size="sm"
              className="glass-button border-0 bg-transparent hover:bg-accent/50"
              onClick={() => navigate('/install')}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('nav.install')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-accent/50"
              onClick={() => navigate('/auth')}
            >
              {t('nav.signIn')}
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-hero shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              {t('hero.cta')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-accent/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-1 glass-card p-3 rounded-2xl">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    scrollToSection(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border/50">
                <LanguageSwitcher />
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-button"
                  onClick={() => navigate('/install')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('nav.install')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/auth')}
                >
                  {t('nav.signIn')}
                </Button>
                <Button 
                  className="w-full bg-gradient-hero shadow-lg"
                  onClick={() => navigate('/auth')}
                >
                  {t('hero.cta')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
