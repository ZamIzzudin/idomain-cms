import { useQuery } from "@tanstack/react-query";
import { fetchAlumniStats } from "@/services/alumni-stats";

export const useAlumniStats = () => {
  return useQuery({
    queryKey: ["cms_alumni_stats"],
    queryFn: fetchAlumniStats,
    staleTime: 2 * 60 * 1000,
  });
};
