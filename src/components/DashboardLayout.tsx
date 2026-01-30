import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Heart } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-mesh">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Glass header */}
          <header className="h-14 md:h-16 glass-panel border-b-0 flex items-center justify-between px-3 md:px-4 sticky top-0 z-10 safe-top">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="touch-target rounded-xl hover:bg-accent/50 transition-colors" />
              <div className="flex items-center gap-2.5 md:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-md glow">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-semibold text-sm bg-gradient-hero bg-clip-text text-transparent">
                  WeddingTech
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-x-hidden safe-bottom">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
