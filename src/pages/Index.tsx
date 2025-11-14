import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { AIShowcase } from "@/components/landing/AIShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="marketplace-section">
          <AIShowcase />
        </div>
        <HowItWorks />
        <Stats />
        <div id="pricing">
          <Pricing />
        </div>
        <div id="about">
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
