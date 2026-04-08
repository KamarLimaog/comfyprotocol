import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type ActivityKind = "deposit" | "borrow" | "repay";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  at: number;
  detail?: string;
};

type Ctx = {
  activities: ActivityEntry[];
  push: (kind: ActivityKind, detail?: string) => void;
};

const ActivityCtx = createContext<Ctx | null>(null);

export function ActivityProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  const push = useCallback((kind: ActivityKind, detail?: string) => {
    setActivities((prev) => {
      const next: ActivityEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        kind,
        at: Date.now(),
        detail,
      };
      return [next, ...prev].slice(0, 25);
    });
  }, []);

  const value = useMemo(() => ({ activities, push }), [activities, push]);
  return <ActivityCtx.Provider value={value}>{children}</ActivityCtx.Provider>;
}

export function useActivityLog() {
  const v = useContext(ActivityCtx);
  if (!v) throw new Error("ActivityProvider missing");
  return v;
}
