import { supabase } from "@/integrations/supabase/client";

/** Convert an array of row objects to a CSV string with a stable header. */
function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set())
  );
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    if (Array.isArray(v)) v = v.join("; ");
    else if (typeof v === "object") v = JSON.stringify(v);
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerLine = headers.map(escape).join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return `${headerLine}\n${body}`;
}

function downloadFile(name: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download a CSV per dataset owned by the current user. */
export async function exportUserDataAsCsv(): Promise<{ files: number; rows: number }> {
  const datasets: { name: string; table: "contacts" | "interactions" | "reminders" | "custom_dates" | "groups" }[] = [
    { name: "contacts", table: "contacts" },
    { name: "interactions", table: "interactions" },
    { name: "reminders", table: "reminders" },
    { name: "custom_dates", table: "custom_dates" },
    { name: "groups", table: "groups" },
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  let files = 0;
  let rows = 0;
  for (const ds of datasets) {
    const { data, error } = await supabase.from(ds.table).select("*");
    if (error) throw error;
    if (!data || data.length === 0) continue;
    const csv = toCsv(data as Record<string, any>[]);
    downloadFile(`orbitcrm-${ds.name}-${stamp}.csv`, csv);
    files += 1;
    rows += data.length;
    // small gap so the browser doesn't drop sequential downloads
    await new Promise((r) => setTimeout(r, 250));
  }
  return { files, rows };
}
