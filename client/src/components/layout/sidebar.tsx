import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3, Clock, Settings, TrendingUp } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      current: location === "/",
    },
    {
      name: "Active Trades",
      href: "/active",
      icon: TrendingUp,
      current: location === "/active",
    },
    {
      name: "Trade History",
      href: "/history",
      icon: Clock,
      current: location === "/history",
    },
    {
      name: "API Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];

  if (!isOpen && !isMobile) {
    return null;
  }

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 z-10 w-64 transition-transform duration-300 ease-in-out transform bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 pt-16 pb-4 overflow-y-auto`}
    >
      <nav className="mt-5 px-2 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              item.current
                ? "bg-primary text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
          >
            <item.icon
              className={`mr-4 flex-shrink-0 h-6 w-6 ${
                item.current ? "text-white" : "text-slate-500 dark:text-slate-400"
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
