import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArticleListService,
  ArticleFilterOptionsService,
  ArticleCreateService,
  ArticleUpdateService,
  ArticleDeleteService,
  ArticleDetailService,
} from "./service";

export const useArticleList = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ["article_list", params],
    queryFn: async () => {
      const response = await ArticleListService(params);
      if (response.status !== 200)
        throw new Error("Failed to fetch articles");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useArticleFilterOptions = () => {
  return useQuery({
    queryKey: ["article_filter_options"],
    queryFn: async () => {
      const response = await ArticleFilterOptionsService();
      if (response.status !== 200)
        throw new Error("Failed to fetch filter options");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_article"],
    mutationFn: async (payload: any) => {
      const response = await ArticleCreateService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article_list"] });
      queryClient.invalidateQueries({ queryKey: ["article_filter_options"] });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_article"],
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await ArticleUpdateService(id, payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article_list"] });
      queryClient.invalidateQueries({ queryKey: ["article_filter_options"] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_article"],
    mutationFn: async (id: number) => {
      const response = await ArticleDeleteService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article_list"] });
      queryClient.invalidateQueries({ queryKey: ["article_filter_options"] });
    },
  });
};

export const useArticleDetail = (id: number) => {
  return useQuery({
    queryKey: ["article_detail", id],
    queryFn: async () => {
      const response = await ArticleDetailService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to fetch article");
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
