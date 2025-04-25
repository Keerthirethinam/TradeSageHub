import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate();
    setOpen(false);
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "?";
    
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            id="user-menu-button"
          >
            <span className="sr-only">Open user menu</span>
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              toast({
                title: "Profile",
                description: "Profile view not implemented yet",
              });
              setOpen(false);
            }}
          >
            Your Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              toast({
                title: "Settings",
                description: "Settings view not implemented yet",
              });
              setOpen(false);
            }}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
