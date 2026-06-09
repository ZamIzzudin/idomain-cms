import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  DeleteService,
  RegisterService,
  UserListService,
  UpdateService,
} from "./service";

export const useUserList = (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortOrder?: string;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: ["user_list", params],
    queryFn: async () => {
      const response = await UserListService(params);
      if (response.status !== 200) throw new Error("Failed to fetch users");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useRegisterUser = () => {
  return useMutation({
    mutationKey: ["register_user"],
    mutationFn: async (payload: {
      username: string;
      password: string;
      displayName: string;
    }) => {
      const response = await RegisterService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to register");
      return response;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationKey: ["update_user"],
    mutationFn: async (payload: {
      id: number;
      username?: string;
      displayName?: string;
      password?: string;
      role?: string;
    }) => {
      const response = await UpdateService(payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update");
      return response;
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationKey: ["delete_user"],
    mutationFn: async (id: number) => {
      const response = await DeleteService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete");
      return response;
    },
  });
};
