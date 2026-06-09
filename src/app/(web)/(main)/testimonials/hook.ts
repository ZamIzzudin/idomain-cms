import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TestimonialListService,
  TestimonialCreateService,
  TestimonialUpdateService,
  TestimonialDeleteService,
  TestimonialDetailService,
} from "./service";

export const useTestimonialList = (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ["testimonial_list", params],
    queryFn: async () => {
      const response = await TestimonialListService(params);
      if (response.status !== 200) throw new Error("Failed to fetch testimonials");
      return response;
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_testimonial"],
    mutationFn: async (payload: any) => {
      const response = await TestimonialCreateService(payload);
      if (response.status !== 201) throw new Error(response.message || "Failed to create");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonial_list"] }),
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_testimonial"],
    mutationFn: async ({ id, ...payload }: any) => {
      const response = await TestimonialUpdateService(id, payload);
      if (response.status !== 200) throw new Error(response.message || "Failed to update");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonial_list"] }),
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_testimonial"],
    mutationFn: async (id: number) => {
      const response = await TestimonialDeleteService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to delete");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonial_list"] }),
  });
};

export const useTestimonialDetail = (id: number) => {
  return useQuery({
    queryKey: ["testimonial_detail", id],
    queryFn: async () => {
      const response = await TestimonialDetailService(id);
      if (response.status !== 200) throw new Error(response.message || "Failed to fetch testimonial");
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
