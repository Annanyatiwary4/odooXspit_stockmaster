import AppSidebar, { AppSidebarContent } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebarContent />
        <main className="flex-1 min-w-0 overflow-y-auto bg-background">
          <div className="p-4 max-w-full w-full">
            <SidebarTrigger />
          </div>
          <div className="w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

