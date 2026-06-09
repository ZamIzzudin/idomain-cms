import AxiosClient from "@/lib/axios";

export interface SiteSettingItem {
  id: number;
  key: string;
  value: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export async function SiteSettingsListService() {
  try {
    const { data: response } = await AxiosClient.get("/settings");
    return response.data as SiteSettingItem[];
  } catch (error: any) {
    return [];
  }
}

export async function SiteSettingsByCategoryService(category: string) {
  try {
    const { data: response } = await AxiosClient.get(`/settings/category/${category}`);
    return response.data as SiteSettingItem[];
  } catch (error: any) {
    return [];
  }
}

export async function SiteSettingsBulkUpdateService(settings: { key: string; value: string | null; category: string }[]) {
  try {
    const { data: response } = await AxiosClient.put("/settings", { settings });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to save settings" };
  }
}
