import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

export const ProfileDialog = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const email = user?.email ?? "";
  const initial = (profile?.full_name || email || "?").charAt(0).toUpperCase();

  const onPick = () => fileRef.current?.click();

  const onFile = async (file: File) => {
    if (!user) return;
    if (!ALLOWED.includes(file.type)) { toast.error("Use PNG, JPG, WEBP, or GIF"); return; }
    if (file.size > MAX_BYTES) { toast.error("Image must be under 2MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (updErr) throw updErr;

      // Best-effort cleanup of older avatars in user's folder
      const { data: list } = await supabase.storage.from("avatars").list(user.id);
      const stale = (list ?? [])
        .filter(f => `${user.id}/${f.name}` !== path)
        .map(f => `${user.id}/${f.name}`);
      if (stale.length) await supabase.storage.from("avatars").remove(stale);

      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile picture updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemove = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data: list } = await supabase.storage.from("avatars").list(user.id);
      const paths = (list ?? []).map(f => `${user.id}/${f.name}`);
      if (paths.length) await supabase.storage.from("avatars").remove(paths);
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile picture removed");
    } catch (e: any) {
      toast.error(e?.message ?? "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>Upload a personal profile picture. Max 2MB · PNG, JPG, WEBP, GIF.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-5 py-2">
          <Avatar className="h-20 w-20">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
            <AvatarFallback className="bg-ink text-ink-foreground text-xl font-medium">{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{profile?.full_name || email || "Your account"}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />

        <DialogFooter className="sm:justify-between gap-2">
          {profile?.avatar_url ? (
            <Button variant="ghost" onClick={onRemove} disabled={busy} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1.5" /> Remove
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
            <Button onClick={onPick} disabled={busy} className="gradient-primary">
              {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
              {profile?.avatar_url ? "Replace" : "Upload"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
