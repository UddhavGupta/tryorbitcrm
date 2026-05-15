import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

const formatErr = (err: unknown) =>
  (err as any)?.message ?? "Something went wrong";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err, query) => {
      // Only toast on background refetches when there's already cached data,
      // or on the first failure — avoid spamming the user. Skip queries that
      // explicitly opt out via meta.silent.
      if ((query.meta as any)?.silent) return;
      toast.error(formatErr(err));
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      toast.error(formatErr(err));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
