import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInDays, parseISO, format } from "date-fns";
import { Plus, Search, UserPlus, X, SlidersHorizontal, MapPin, CalendarClock, Clock, Bell, ArrowUpDown, Upload, CheckCheck, MoreVertical, Flag, Snowflake, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ContactDialog } from "@/components/ContactDialog";
import { ImportCsvDialog } from "@/components/ImportCsvDialog";
import { CardListSkeleton, ErrorState } from "@/components/LoadingStates";
import { PageHeader } from "@/components/PageHeader";
import { SampleDataButton } from "@/components/SampleDataButton";
import { BulkActionBar } from "@/components/BulkActionBar";
import { useSelection } from "@/hooks/useSelection";
import { tagClasses, dedupeTags } from "@/lib/tags";
import { todayLocalISO, dateToLocalISO } from "@/lib/dates";
import {
  getRelationshipStatus, getSuggestedAction, STATUS_LABEL, STATUS_CLASSES,
  ACTION_LABEL, ACTION_CLASSES, INTEL_DISCLAIMER, type RelationshipStatus, type SuggestedAction,
} from "@/lib/relationshipIntel";

type LastRange = "all" | "7" | "30" | "90" | "never" | "cooling60" | "cooling";
type FollowUp = "all" | "overdue" | "today" | "week" | "month" | "none";
type OpenReminder = "all" | "yes" | "no";
type SortBy = "name" | "recent" | "stale" | "follow" | "priority";
type StatusFilter = "all" | RelationshipStatus;
type ActionFilter = "all" | SuggestedAction;

const People = () => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const selection = useSelection();
  const [searchParams, setSearchParams] = useSearchParams();
  const groupFilter = searchParams.get("group") ?? "all";
  const setGroupFilter = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v === "all") next.delete("group"); else next.set("group", v);
    setSearchParams(next);
  };
  const [priority, setPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [lastRange, setLastRange] = useState<LastRange>("all");
  const [followUp, setFollowUp] = useState<FollowUp>("all");
  const [openReminder, setOpenReminder] = useState<OpenReminder>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: allGroups } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => (await supabase.from("groups").select("*").order("name")).data ?? [],
  });

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, contact_groups(group_id, groups(name, color))")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: openReminders } = useQuery({
    queryKey: ["open-reminders-by-contact"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reminders")
        .select("contact_id, due_date")
        .eq("completed", false)
        .order("due_date");
      const set = new Set<string>();
      const earliest = new Map<string, string>();
      (data ?? []).forEach((r: any) => {
        if (!r.contact_id) return;
        set.add(r.contact_id);
        if (!earliest.has(r.contact_id)) earliest.set(r.contact_id, r.due_date);
      });
      return { set, earliest };
    },
  });

  const companies = useMemo(() => {
    const set = new Set<string>();
    (contacts ?? []).forEach((c: any) => { if (c.company) set.add(c.company); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  const allTags = useMemo(() => {
    const flat: string[] = [];
    (contacts ?? []).forEach((c: any) => (c.tags ?? []).forEach((t: string) => flat.push(t)));
    return dedupeTags(flat);
  }, [contacts]);

  const filtered = useMemo(() => {
    let list = contacts ?? [];
    const today = new Date();
    const todayStr = todayLocalISO();

    if (groupFilter !== "all") {
      list = list.filter((c: any) => c.contact_groups?.some((cg: any) => cg.group_id === groupFilter));
    }
    if (priority !== "all") {
      list = list.filter((c: any) => (c.priority ?? "medium") === priority);
    }
    if (companyFilter !== "all") {
      list = list.filter((c: any) => c.company === companyFilter);
    }
    if (openReminder !== "all") {
      list = list.filter((c: any) => {
        const has = openReminders?.set.has(c.id) ?? false;
        return openReminder === "yes" ? has : !has;
      });
    }
    if (lastRange !== "all") {
      list = list.filter((c: any) => {
        if (lastRange === "never") return !c.last_contacted_at;
        if (!c.last_contacted_at) return false;
        const days = differenceInDays(today, parseISO(c.last_contacted_at));
        if (lastRange === "cooling") return days >= (c.cooling_days ?? 30);
        if (lastRange === "cooling60") return days > 60;
        return days <= Number(lastRange);
      });
    }
    if (followUp !== "all") {
      list = list.filter((c: any) => {
        if (followUp === "none") return !c.next_follow_up_date;
        if (!c.next_follow_up_date) return false;
        const d = c.next_follow_up_date;
        if (followUp === "overdue") return d < todayStr;
        if (followUp === "today") return d === todayStr;
        if (followUp === "week") {
          const weekOut = new Date(today); weekOut.setDate(today.getDate() + 7);
          return d >= todayStr && d <= dateToLocalISO(weekOut);
        }
        if (followUp === "month") {
          const monthOut = new Date(today); monthOut.setDate(today.getDate() + 30);
          return d >= todayStr && d <= dateToLocalISO(monthOut);
        }
        return true;
      });
    }
    if (statusFilter !== "all") {
      list = list.filter((c: any) => getRelationshipStatus(c.last_contacted_at) === statusFilter);
    }
    if (actionFilter !== "all") {
      list = list.filter((c: any) => getSuggestedAction({
        priority: c.priority,
        last_contacted_at: c.last_contacted_at,
        birthday: c.birthday,
        nextOpenReminderDue: openReminders?.earliest.get(c.id) ?? null,
      }) === actionFilter);
    }
    if (tagFilter.length > 0) {
      list = list.filter((c: any) => {
        const tags: string[] = (c.tags ?? []).map((t: string) => t.toLowerCase());
        return tagFilter.every((t) => tags.includes(t.toLowerCase()));
      });
    }
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((c: any) =>
        [c.name, c.last_name, c.title, c.company, c.city, c.email, c.notes,
         ...(c.contact_groups?.map((cg: any) => cg.groups?.name) ?? []),
         ...((c.tags ?? []) as string[])]
          .filter(Boolean).join(" ").toLowerCase().includes(t)
      );
    }

    const priorityRank = (p: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);
    const sorted = [...list];
    sorted.sort((a: any, b: any) => {
      if (sortBy === "name") return [a.name, a.last_name].filter(Boolean).join(" ").localeCompare([b.name, b.last_name].filter(Boolean).join(" "));
      if (sortBy === "recent") {
        const ad = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
        const bd = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
        return bd - ad;
      }
      if (sortBy === "stale") {
        const ad = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : -Infinity;
        const bd = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : -Infinity;
        return ad - bd;
      }
      if (sortBy === "follow") {
        const ad = a.next_follow_up_date ?? "9999-12-31";
        const bd = b.next_follow_up_date ?? "9999-12-31";
        return ad.localeCompare(bd);
      }
      if (sortBy === "priority") return priorityRank(a.priority ?? "medium") - priorityRank(b.priority ?? "medium");
      return 0;
    });
    return sorted;
  }, [contacts, q, groupFilter, priority, companyFilter, lastRange, followUp, openReminder, openReminders, statusFilter, actionFilter, sortBy, tagFilter]);

  const fullName = (c: any) => [c.name, c.last_name].filter(Boolean).join(" ");
  const activeGroupName = allGroups?.find((g: any) => g.id === groupFilter)?.name;

  const activeFilterCount =
    (groupFilter !== "all" ? 1 : 0) +
    (priority !== "all" ? 1 : 0) +
    (companyFilter !== "all" ? 1 : 0) +
    (lastRange !== "all" ? 1 : 0) +
    (followUp !== "all" ? 1 : 0) +
    (openReminder !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (actionFilter !== "all" ? 1 : 0) +
    (tagFilter.length > 0 ? 1 : 0);

  const clearAll = () => {
    setQ("");
    setGroupFilter("all");
    setPriority("all");
    setCompanyFilter("all");
    setLastRange("all");
    setFollowUp("all");
    setOpenReminder("all");
    setStatusFilter("all");
    setActionFilter("all");
    setTagFilter([]);
  };

  const lastContactedLabel = (c: any) => {
    if (!c.last_contacted_at) return "Never contacted";
    const days = differenceInDays(new Date(), parseISO(c.last_contacted_at));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const markContactedToday = async (e: React.MouseEvent, c: any) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase
      .from("contacts")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["dashboard-contacts"] });
    toast.success(`Marked ${[c.name, c.last_name].filter(Boolean).join(" ")} contacted today`);
  };

  useEffect(() => { selection.clear(); }, [q]);

  const quickUpdate = async (id: string, patch: Record<string, any>, label: string) => {
    const { error } = await (supabase.from("contacts").update(patch as any) as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["contact", id] });
    toast.success(label);
  };

  return (
    <AppLayout>
      <PageHeader
        title="People"
        description="Search, filter, and manage the relationships in your orbit."
        meta={`${contacts?.length ?? 0} contacts`}
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)} className="flex-1 sm:flex-none"><Upload className="h-4 w-4 mr-2" />Import CSV</Button>
            <Button onClick={() => setOpen(true)} className="gradient-primary flex-1 sm:flex-none"><Plus className="h-4 w-4 mr-2" />Add contact</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input data-hotkey-search placeholder="Search name, title, company, city, notes, group… (press / to focus)" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="recent">Recently contacted</SelectItem>
            <SelectItem value="stale">Most stale</SelectItem>
            <SelectItem value="follow">Next follow-up</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 grid place-items-center">{activeFilterCount}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-3" align="end">
            <div className="space-y-1.5">
              <Label className="text-xs">Group</Label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  {(allGroups ?? []).map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All companies</SelectItem>
                  {companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Open reminder</Label>
              <Select value={openReminder} onValueChange={(v) => setOpenReminder(v as OpenReminder)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">Has open reminder</SelectItem>
                  <SelectItem value="no">No open reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last contacted</Label>
              <Select value={lastRange} onValueChange={(v) => setLastRange(v as LastRange)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="7">Within last 7 days</SelectItem>
                  <SelectItem value="30">Within last 30 days</SelectItem>
                  <SelectItem value="90">Within last 90 days</SelectItem>
                  <SelectItem value="cooling60">Cooling (60+ days ago)</SelectItem>
                  <SelectItem value="cooling">Cooling (past threshold)</SelectItem>
                  <SelectItem value="never">Never contacted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Next follow-up</Label>
              <Select value={followUp} onValueChange={(v) => setFollowUp(v as FollowUp)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Due today</SelectItem>
                  <SelectItem value="week">Within 7 days</SelectItem>
                  <SelectItem value="month">Within 30 days</SelectItem>
                  <SelectItem value="none">No follow-up set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relationship status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  <SelectItem value="active">Active (≤30d)</SelectItem>
                  <SelectItem value="warming">Warming (31–60d)</SelectItem>
                  <SelectItem value="cooling">Cooling (61–90d)</SelectItem>
                  <SelectItem value="cold">Cold (90+d)</SelectItem>
                  <SelectItem value="unknown">No history</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Suggested action</Label>
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any action</SelectItem>
                  <SelectItem value="overdue_follow_up">Overdue follow-up</SelectItem>
                  <SelectItem value="follow_up_today">Follow up today</SelectItem>
                  <SelectItem value="reconnect_soon">Reconnect soon</SelectItem>
                  <SelectItem value="send_birthday_note">Send birthday note</SelectItem>
                  <SelectItem value="no_action">No action needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {allTags.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {allTags.map((t) => {
                    const active = tagFilter.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setTagFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                        }
                        className={`text-xs px-2 py-0.5 rounded-full border transition-opacity ${tagClasses(t)} ${active ? "" : "opacity-50 hover:opacity-100"}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                {tagFilter.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">Match all selected tags</p>
                )}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border">{INTEL_DISCLAIMER}</p>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" />Clear all filters
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {(activeFilterCount > 0 || q) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="text-muted-foreground">{filtered.length} of {contacts?.length ?? 0} match</span>
          {q && <Chip onClear={() => setQ("")}>Search: "{q}"</Chip>}
          {activeGroupName && <Chip onClear={() => setGroupFilter("all")}>Group: {activeGroupName}</Chip>}
          {priority !== "all" && <Chip onClear={() => setPriority("all")}>Priority: {priority}</Chip>}
          {companyFilter !== "all" && <Chip onClear={() => setCompanyFilter("all")}>Company: {companyFilter}</Chip>}
          {openReminder !== "all" && <Chip onClear={() => setOpenReminder("all")}>{openReminder === "yes" ? "Has open reminder" : "No open reminder"}</Chip>}
          {lastRange !== "all" && <Chip onClear={() => setLastRange("all")}>Last contacted: {lastLabel(lastRange)}</Chip>}
          {followUp !== "all" && <Chip onClear={() => setFollowUp("all")}>Follow-up: {followLabel(followUp)}</Chip>}
          {tagFilter.map((t) => (
            <Chip key={t} onClear={() => setTagFilter((prev) => prev.filter((x) => x !== t))}>Tag: {t}</Chip>
          ))}
        </div>
      )}

      {isLoading && <CardListSkeleton />}

      {error && <ErrorState title="Couldn't load contacts" message={(error as Error).message} />}

      {!isLoading && !error && (contacts?.length ?? 0) === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Your orbit is empty</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Add the first person you want to keep in touch with — friends, founders, recruiters, anyone.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => setOpen(true)} className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Add your first contact</Button>
            <SampleDataButton />
          </div>
        </div>
      )}

      {!isLoading && !error && (contacts?.length ?? 0) > 0 && filtered.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-secondary mx-auto grid place-items-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{q ? "No search results" : "No contacts match these filters"}</h3>
          <p className="text-muted-foreground mt-1">Try a different search or clear some filters.</p>
          <Button onClick={clearAll} variant="outline" className="mt-5">Clear all</Button>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => {
            const days = c.last_contacted_at ? differenceInDays(new Date(), parseISO(c.last_contacted_at)) : null;
            const isCooling = days !== null && days >= (c.cooling_days ?? 30);
            const hasOpenReminder = openReminders?.set.has(c.id);
            const priorityVal = c.priority ?? "medium";
            const status = getRelationshipStatus(c.last_contacted_at);
            const action = getSuggestedAction({
              priority: c.priority,
              last_contacted_at: c.last_contacted_at,
              birthday: c.birthday,
              nextOpenReminderDue: openReminders?.earliest.get(c.id) ?? null,
            });

            const isSelected = selection.has(c.id);
            return (
              <Link
                key={c.id}
                to={`/app/people/${c.id}`}
                className={`group surface-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 flex flex-col relative ${isSelected ? "ring-2 ring-primary border-primary/40" : ""}`}
              >
                <div
                  className={`absolute top-3 left-3 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); selection.toggle(c.id); }}
                >
                  <Checkbox checked={isSelected} className="bg-background" aria-label={`Select ${fullName(c)}`} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{fullName(c)}</p>
                    <p className="text-sm text-muted-foreground truncate">{[c.title, c.company].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  {priorityVal !== "medium" && (
                    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      priorityVal === "high" ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"
                    }`}>
                      {priorityVal}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full border ${STATUS_CLASSES[status]}`}>{STATUS_LABEL[status]}</span>
                  {action !== "no_action" && (
                    <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full border ${ACTION_CLASSES[action]}`}>{ACTION_LABEL[action]}</span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {c.city && (
                    <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /><span className="truncate">{c.city}</span></div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span className={isCooling ? "text-warning font-medium" : ""}>
                      {lastContactedLabel(c)}{isCooling ? " · cooling" : ""}
                    </span>
                  </div>
                  {c.next_follow_up_date && (
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Follow up {format(parseISO(c.next_follow_up_date), "MMM d")}</span>
                    </div>
                  )}
                  {hasOpenReminder && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <Bell className="h-3.5 w-3.5" /><span>Open reminder</span>
                    </div>
                  )}
                </div>

                {(c.contact_groups?.length > 0 || (c.tags?.length ?? 0) > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.contact_groups?.map((cg: any) => (
                      <span key={cg.group_id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (cg.groups?.color ?? "#a78bfa") + "22", color: cg.groups?.color ?? "#a78bfa" }}>
                        {cg.groups?.name}
                      </span>
                    ))}
                    {(c.tags ?? []).map((t: string) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${tagClasses(t)}`}>{t}</span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => markContactedToday(e, c)}
                    className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Mark contacted today"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark contacted
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ContactDialog open={open} onOpenChange={setOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["contacts"] })} />
      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} onImported={() => {
        qc.invalidateQueries({ queryKey: ["contacts"] });
        qc.invalidateQueries({ queryKey: ["all-groups"] });
      }} />
    </AppLayout>
  );
};

const Chip = ({ children, onClear }: { children: React.ReactNode; onClear: () => void }) => (
  <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs">
    {children}
    <button onClick={onClear} className="hover:text-foreground"><X className="h-3 w-3" /></button>
  </span>
);

const lastLabel = (v: LastRange) =>
  v === "7" ? "≤ 7 days" : v === "30" ? "≤ 30 days" : v === "90" ? "≤ 90 days"
  : v === "cooling60" ? "60+ days" : v === "cooling" ? "Cooling" : v === "never" ? "Never" : "Any";

const followLabel = (v: FollowUp) =>
  v === "overdue" ? "Overdue" : v === "today" ? "Today" : v === "week" ? "This week"
  : v === "month" ? "This month" : v === "none" ? "Not set" : "Any";

export default People;
