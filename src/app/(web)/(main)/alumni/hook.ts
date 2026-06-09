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
} from "./service";

export const useAlumniList = (params: {
  page?: number;
  perPage?: number;
  q?: string;
  graduationYear?: number;
  specialization?: string;
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
