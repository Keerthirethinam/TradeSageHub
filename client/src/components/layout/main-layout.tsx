import { useState, useEffect } from "react";
import { useMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mounted, setMounted] = useState(false);

  // Update sidebar state on mobile/desktop switch
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main 
          className="flex-1 relative overflow-y-auto focus:outline-none transition-all duration-300"
          style={{
            paddingLeft: sidebarOpen && !isMobile ? "16rem" : "0"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
