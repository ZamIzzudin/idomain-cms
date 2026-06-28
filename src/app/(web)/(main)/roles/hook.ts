import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RoleListService,
  PermissionListService,
  CreateRoleService,
  UpdateRoleService,
  DeleteRoleService,
} from "./service";

export const useRoleList = () => {
  return useQuery({
    queryKey: ["role_list"],
    queryFn: async () => {
      const response = await RoleListService();
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const usePermissionList = () => {
  return useQuery({
    queryKey: ["permission_list"],
    queryFn: async () => {
      const response = await PermissionListService();
      return response;
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_role"],
    mutationFn: async (payload: {
      name: string;
      slug: string;
      description?: string;
      permissionIds: number[];
      batchScopes?: number[];
    }) => {
      const response = await CreateRoleService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to create role");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role_list"] });
      queryClient.invalidateQueries({ queryKey: ["role_options"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_role"],
    mutationFn: async (payload: {
      id: number;
      name?: string;
      slug?: string;
      description?: string;
      permissionIds?: number[];
      batchScopes?: number[];
    }) => {
      const response = await UpdateRoleService(payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update role");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role_list"] });
      queryClient.invalidateQueries({ queryKey: ["role_options"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_role"],
    mutationFn: async (id: number) => {
      const response = await DeleteRoleService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete role");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role_list"] });
      queryClient.invalidateQueries({ queryKey: ["role_options"] });
    },
  });
};
