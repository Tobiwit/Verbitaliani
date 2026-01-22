import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useVerbs() {
  return useQuery({
    queryKey: [api.verbs.list.path],
    queryFn: async () => {
      const res = await fetch(api.verbs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch verbs");
      // Validate with Zod schema from routes
      return api.verbs.list.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });
}
