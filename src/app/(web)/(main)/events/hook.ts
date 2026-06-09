import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EventListService,
  EventFilterOptionsService,
  EventCreateService,
  EventUpdateService,
  EventDeleteService,
  EventDetailService,
} from "./service";

export const useEventList = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
  upcoming?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ["event_list", params],
    queryFn: async () => {
      const response = await EventListService(params);
      if (response.status !== 200)
        throw new Error("Failed to fetch events");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useEventFilterOptions = () => {
  return useQuery({
    queryKey: ["event_filter_options"],
    queryFn: async () => {
      const response = await EventFilterOptionsService();
      if (response.status !== 200)
        throw new Error("Failed to fetch filter options");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_event"],
    mutationFn: async (payload: any) => {
      const response = await EventCreateService(payload);
      if (response.status !== 201)
        throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      queryClient.invalidateQueries({ queryKey: ["event_filter_options"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_event"],
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await EventUpdateService(id, payload);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      queryClient.invalidateQueries({ queryKey: ["event_filter_options"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_event"],
    mutationFn: async (id: number) => {
      const response = await EventDeleteService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      queryClient.invalidateQueries({ queryKey: ["event_filter_options"] });
    },
  });
};

export const useEventDetail = (id: number) => {
  return useQuery({
    queryKey: ["event_detail", id],
    queryFn: async () => {
      const response = await EventDetailService(id);
      if (response.status !== 200)
        throw new Error(response.message || "Failed to fetch event");
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
