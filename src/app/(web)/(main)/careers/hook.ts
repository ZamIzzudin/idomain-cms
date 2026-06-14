import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CareerListService,
  CareerDetailService,
  CareerCreateService,
  CareerApproveService,
  CareerRejectService,
  CareerUpdateService,
  CareerDeleteService,
  CategoryListService,
  CategoryCreateService,
  CategoryUpdateService,
  CategoryDeleteService,
} from "./service";

export const useCareerList = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: number;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ["career_list", params],
    queryFn: async () => {
      const response = await CareerListService(params);
      if (response.status !== 200)
        throw new Error("Failed to fetch careers");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useCareerDetail = (id: number) => {
  return useQuery({
    queryKey: ["career_detail", id],
    queryFn: async () => {
      const response = await CareerDetailService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to fetch career");
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCareer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await CareerCreateService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career_list"] });
    },
  });
};

export const useApproveCareer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CareerApproveService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to approve");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career_list"] });
    },
  });
};

export const useRejectCareer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CareerRejectService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to reject");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career_list"] });
    },
  });
};

export const useUpdateCareer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await CareerUpdateService(id, payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career_list"] });
    },
  });
};

export const useDeleteCareer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CareerDeleteService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career_list"] });
    },
  });
};

// Category hooks
export const useCategoryList = (params?: { type?: string }) => {
  return useQuery({
    queryKey: ["category_list", params],
    queryFn: async () => {
      const response = await CategoryListService(params);
      if (response.status !== 200)
        throw new Error("Failed to fetch categories");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; type?: string }) => {
      const response = await CategoryCreateService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category_list"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await CategoryUpdateService(id, payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category_list"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await CategoryDeleteService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category_list"] });
    },
  });
};
