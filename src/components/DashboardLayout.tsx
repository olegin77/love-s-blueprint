import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 bg-background sticky top-0 z-10">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 bg-gradient-elegant">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
