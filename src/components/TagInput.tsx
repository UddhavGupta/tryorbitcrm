import { useMemo, useRef, useState, KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeTag, tagClasses } from "@/lib/tags";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export const TagInput = ({ value, onChange, placeholder = "Add tag and press Enter" }: Props) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allTags } = useQuery({
    queryKey: ["all-tags", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("tags").eq("user_id", user!.id);
      const set = new Set<string>();
      (data ?? []).forEach((c: any) => (c.tags ?? []).forEach((t: string) => set.add(t)));
      return Array.from(set).sort();
    },
  });

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const used = new Set(value.map((v) => v.toLowerCase()));
    return (allTags ?? [])
      .filter((t) => !used.has(t.toLowerCase()) && (q === "" || t.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [allTags, draft, value]);

  const add = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t) return;
    if (value.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div>
      <div
        className="min-h-10 w-full rounded-md border border-input bg-background px-2 py-1.5 flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((t) => (
          <span key={t} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tagClasses(t)}`}>
            {t}
            <button type="button" onClick={() => remove(t)} className="hover:opacity-70" aria-label={`Remove ${t}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => setFocused(false), 120); if (draft.trim()) add(draft); }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="border-0 shadow-none focus-visible:ring-0 h-7 px-1 flex-1 min-w-[120px]"
        />
      </div>
      {focused && suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              className={`text-xs px-2 py-0.5 rounded-full hover:opacity-80 ${tagClasses(s)}`}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
