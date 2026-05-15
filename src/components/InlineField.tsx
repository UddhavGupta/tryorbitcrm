import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  value: string | null | undefined;
  onSave: (next: string) => Promise<void> | void;
  schema?: z.ZodSchema<string>;
  multiline?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  type?: "text" | "email" | "url" | "tel";
  renderDisplay?: (value: string) => React.ReactNode;
  className?: string;
};

export const InlineField = ({
  value,
  onSave,
  schema,
  multiline = false,
  placeholder = "Add…",
  emptyLabel = "Not set",
  type = "text",
  renderDisplay,
  className,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value ?? "");
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current && "select" in inputRef.current) inputRef.current.select();
      }, 0);
    }
  }, [editing, value]);

  const cancel = () => { setEditing(false); setDraft(value ?? ""); };

  const save = async () => {
    const next = draft.trim();
    if (next === (value ?? "").trim()) { setEditing(false); return; }
    if (schema) {
      const parsed = schema.safeParse(next);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid value");
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); cancel(); }
    else if (e.key === "Enter" && !multiline) { e.preventDefault(); save(); }
    else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
  };

  if (editing) {
    return (
      <div className={`flex items-start gap-2 ${className ?? ""}`}>
        {multiline ? (
          <Textarea
            ref={inputRef as any}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="flex-1 min-h-[80px]"
            disabled={saving}
          />
        ) : (
          <Input
            ref={inputRef as any}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="flex-1 h-8"
            disabled={saving}
          />
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={save} disabled={saving} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-primary" aria-label="Save"><Check className="h-4 w-4" /></button>
          <button onClick={cancel} disabled={saving} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground" aria-label="Cancel"><X className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  const hasValue = !!(value && value.trim());

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex items-start gap-1.5 text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-secondary/60 transition-colors w-full ${className ?? ""}`}
    >
      <span className={`flex-1 min-w-0 ${hasValue ? "" : "italic text-muted-foreground"}`}>
        {hasValue ? (renderDisplay ? renderDisplay(value!) : value) : emptyLabel}
      </span>
      <Pencil className="h-3 w-3 mt-1 opacity-0 group-hover:opacity-60 shrink-0 text-muted-foreground" />
    </button>
  );
};
