import AxiosClient from "@/lib/axios";

export interface AlumniStats {
  total: number;
  pendingCount: number;
  byProvince: Array<{ province: string; count: number }>;
  byYear: Array<{ year: number; count: number }>;
  byBatch: Array<{ batch: number; count: number }>;
  bySpecialization: Array<{ specialization: string; count: number }>;
}

export async function fetchAlumniStats() {
  const { data } = await AxiosClient.get("/alumni/stats");
  return data.data as AlumniStats;
}
