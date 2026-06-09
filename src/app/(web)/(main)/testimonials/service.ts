import AxiosClient from "@/lib/axios";

export interface TestimonialItem {
  id: number;
  name: string;
  institution: string | null;
  testimonial: string;
  photo: string | null;
  photoPublicId: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialListResponse {
  status: number;
  items: TestimonialItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function TestimonialListService(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/testimonials", { params });
    return response as TestimonialListResponse;
  } catch (error: any) {
    return { status: 500, items: [], total: 0, page: 1, perPage: 10, totalPages: 0 };
  }
}

export async function TestimonialCreateService(payload: {
  name: string;
  institution?: string;
  testimonial: string;
  photo?: File | null;
}) {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.institution) formData.append("institution", payload.institution);
    formData.append("testimonial", payload.testimonial);
    if (payload.photo) formData.append("photo", payload.photo);

    const { data: response } = await AxiosClient.post("/testimonials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to create testimonial" };
  }
}

export async function TestimonialUpdateService(
  id: number,
  payload: {
    name?: string;
    institution?: string;
    testimonial?: string;
    photo?: File | null;
    removePhoto?: boolean;
  }
) {
  try {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.institution !== undefined) formData.append("institution", payload.institution);
    if (payload.testimonial) formData.append("testimonial", payload.testimonial);
    if (payload.photo) formData.append("photo", payload.photo);
    if (payload.removePhoto) formData.append("removePhoto", "true");

    const { data: response } = await AxiosClient.put(`/testimonials/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to update testimonial" };
  }
}

export async function TestimonialDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/testimonials/${id}`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to delete testimonial" };
  }
}

export async function TestimonialDetailService(id: number) {
  try {
    const { data: response } = await AxiosClient.get(`/testimonials/${id}`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to fetch testimonial" };
  }
}
