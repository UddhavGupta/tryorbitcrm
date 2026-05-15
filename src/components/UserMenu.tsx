import { LogOut, User as UserIcon, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/components/Tour";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import demoAvatar from "@/assets/demo-avatar.png";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { start: startTour } = useTour();
  const email = user?.email ?? "Guest";
  const initial = (email ?? "?").charAt(0).toUpperCase();
  const isAnon = !!user && ((user as any).is_anonymous === true || (user as any).app_metadata?.provider === "anonymous");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={demoAvatar} alt="" />
          <AvatarFallback className="bg-ink text-ink-foreground text-xs font-medium">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-start gap-2">
            <UserIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{isAnon ? "Demo session" : email}</p>
              <p className="text-[11px] text-muted-foreground">{isAnon ? "Temporary account" : "Signed in"}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isAnon && (
          <DropdownMenuItem onClick={() => startTour()}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Replay tour
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => { await signOut(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isAnon ? "Exit demo" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
