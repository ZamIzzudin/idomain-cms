import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SiteSettingsListService,
  SiteSettingsBulkUpdateService,
} from "./service";

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const data = await SiteSettingsListService();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_site_settings"],
    mutationFn: async (settings: { key: string; value: string | null; category: string }[]) => {
      const response = await SiteSettingsBulkUpdateService(settings);
      if (response.status !== 200) throw new Error(response.message || "Failed to save");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};
