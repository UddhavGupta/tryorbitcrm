import { LogOut, User as UserIcon, PlayCircle, ImagePlus, Download, Trash2, Plug } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/components/Tour";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import demoAvatar from "@/assets/demo-avatar.png";
import { ProfileDialog } from "@/components/ProfileDialog";
import { exportUserDataAsCsv } from "@/lib/exportData";
import { toast } from "sonner";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { start: startTour } = useTour();
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const email = user?.email ?? "Guest";
  const initial = (email ?? "?").charAt(0).toUpperCase();
  const isAnon = !!user && ((user as any).is_anonymous === true || (user as any).app_metadata?.provider === "anonymous");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user && !isAnon,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const avatarSrc = isAnon ? demoAvatar : (profile?.avatar_url || undefined);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { files, rows } = await exportUserDataAsCsv();
      if (files === 0) toast.info("No data to export yet.");
      else toast.success(`Exported ${rows} rows across ${files} file${files === 1 ? "" : "s"}.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't export your data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      toast.success("Your account has been deleted.");
      await signOut();
      navigate("/");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't delete your account.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-tour="account"
          className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar className="h-7 w-7">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
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
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <ImagePlus className="h-4 w-4 mr-2" />
              Profile picture
            </DropdownMenuItem>
          )}
          {!isAnon && (
            <DropdownMenuItem onClick={() => startTour()}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Replay tour
            </DropdownMenuItem>
          )}
          {!isAnon && (
            <DropdownMenuItem onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting…" : "Export data as CSV"}
            </DropdownMenuItem>
          )}
          {!isAnon && <DropdownMenuSeparator />}
          {!isAnon && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => { e.preventDefault(); setConfirmDelete(true); }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete account
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

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

      <AlertDialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your contacts, interactions, reminders, dates, groups, and profile.
              This action can't be undone. Consider exporting your data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
