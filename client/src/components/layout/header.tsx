import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import UserMenu from "@/components/ui/user-menu";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <div className="flex-shrink-0 flex items-center ml-4">
              <span className="text-primary dark:text-blue-400 font-bold text-xl">TradeHub</span>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
            <div className="ml-3 relative">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
