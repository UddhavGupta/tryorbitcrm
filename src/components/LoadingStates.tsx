import { Skeleton } from "@/components/ui/skeleton";

export const CardListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="surface-card p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const RowListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="surface-card divide-y divide-border">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

import { AlertCircle } from "lucide-react";
export const ErrorState = ({ title = "Something went wrong", message }: { title?: string; message?: string }) => (
  <div className="surface-card p-6 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3">
    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
    <div>
      <p className="font-medium">{title}</p>
      {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
    </div>
  </div>
);
