import { useCallback, useState } from "react";

export function useSelection() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  const has = useCallback((id: string) => ids.has(id), [ids]);
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const set = useCallback((nextIds: string[]) => setIds(new Set(nextIds)), []);
  const clear = useCallback(() => setIds(new Set()), []);
  const add = useCallback((nextIds: string[]) => {
    setIds((prev) => {
      const next = new Set(prev);
      nextIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  return { ids, count: ids.size, has, toggle, set, add, clear };
}
