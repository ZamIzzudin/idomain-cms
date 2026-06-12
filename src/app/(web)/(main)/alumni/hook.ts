import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlumniListService,
  AlumniFilterOptionsService,
  AlumniCreateService,
  AlumniUpdateService,
  AlumniDeleteService,
  AlumniDetailService,
  AlumniApproveService,
  AlumniRejectService,
  AlumniExportExcelService,
  AlumniImportExcelService,
  AlumniDownloadTemplateService,
} from "./service";

export const useAlumniList = (params: {
  page?: number;
  perPage?: number;
  q?: string;
  graduationYear?: number;
  specialization?: string;
  province?: string;
  sort?: string;
  approved?: string;
}) => {
  return useQuery({
    queryKey: ["alumni_list", params],
    queryFn: async () => {
      const response = await AlumniListService(params);
      if (response.status !== 200) throw new Error("Failed to fetch alumni");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useAlumniFilterOptions = () => {
  return useQuery({
    queryKey: ["alumni_filter_options"],
    queryFn: async () => {
      const response = await AlumniFilterOptionsService();
      if (response.status !== 200) throw new Error("Failed to fetch filter options");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_alumni"],
    mutationFn: async (payload: any) => {
      const response = await AlumniCreateService(payload);
      if (response.status !== 201) throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
      queryClient.invalidateQueries({ queryKey: ["alumni_filter_options"] });
    },
  });
};

export const useUpdateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_alumni"],
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await AlumniUpdateService(id, payload);
      if (response.status !== 200) throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
      queryClient.invalidateQueries({ queryKey: ["alumni_filter_options"] });
    },
  });
};

export const useDeleteAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_alumni"],
    mutationFn: async (id: number) => {
      const response = await AlumniDeleteService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
      queryClient.invalidateQueries({ queryKey: ["alumni_filter_options"] });
    },
  });
};

export const useAlumniDetail = (id: number) => {
  return useQuery({
    queryKey: ["alumni_detail", id],
    queryFn: async () => {
      const response = await AlumniDetailService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to fetch alumni");
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const useApproveAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["approve_alumni"],
    mutationFn: async (id: number) => {
      const response = await AlumniApproveService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to approve");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
    },
  });
};

export const useRejectAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reject_alumni"],
    mutationFn: async (id: number) => {
      const response = await AlumniRejectService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to reject");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
    },
  });
};

export const useExportAlumni = () => {
  return useMutation({
    mutationKey: ["export_alumni"],
    mutationFn: async () => {
      const blob = await AlumniExportExcelService();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `alumni_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useImportAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["import_alumni"],
    mutationFn: async (file: File) => {
      const response = await AlumniImportExcelService(file);
      if (response.status !== 200 && response.status !== 201) throw new Error(response.message || "Failed to import");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni_list"] });
      queryClient.invalidateQueries({ queryKey: ["alumni_filter_options"] });
    },
  });
};

export const useDownloadTemplate = () => {
  return useMutation({
    mutationKey: ["download_template"],
    mutationFn: async () => {
      const blob = await AlumniDownloadTemplateService();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "alumni_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};
