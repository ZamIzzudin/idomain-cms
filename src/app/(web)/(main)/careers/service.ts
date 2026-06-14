import AxiosClient from "@/lib/axios";

export interface CareerItem {
  id: number;
  title: string;
  slug: string;
  institutionName: string;
  logo: string | null;
  logoPublicId: string | null;
  position: string;
  province: string | null;
  city: string | null;
  jobType: string;
  description: string | null;
  requirements: string | null;
  deadline: string | null;
  recruitmentEmail: string | null;
  recruitmentUrl: string | null;
  contactPerson: string | null;
  categoryId: number;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "EXPIRED";
  views: number;
  publishedAt: string | null;
  expiredAt: string | null;
  authorId: number;
  approvedById: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string; slug: string; type: string };
  author: { id: number; name: string; photo: string | null };
}

export interface CareerListResponse {
  status: number;
  items: CareerItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  type: "KLINIS" | "NON_KLINIS";
  sortOrder: number;
}

export async function CareerListService(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: number;
  jobType?: string;
  location?: string;
  sortOrder?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/careers", { params });
    return response as CareerListResponse;
  } catch (error: any) {
    return {
      status: 500,
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 0,
    };
  }
}

export async function CareerDetailService(id: number) {
  try {
    const { data: response } = await AxiosClient.get(`/careers/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to fetch career",
      }
    );
  }
}

export async function CareerApproveService(id: number) {
  try {
    const { data: response } = await AxiosClient.put(`/careers/${id}/approve`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to approve career",
      }
    );
  }
}

export async function CareerRejectService(id: number) {
  try {
    const { data: response } = await AxiosClient.put(`/careers/${id}/reject`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to reject career",
      }
    );
  }
}

export async function CareerCreateService(payload: FormData) {
  try {
    const { data: response } = await AxiosClient.post("/careers", payload);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to create career",
      }
    );
  }
}

export async function CareerUpdateService(id: number, payload: any) {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    }
    const { data: response } = await AxiosClient.put(
      `/careers/${id}`,
      formData
    );
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to update career",
      }
    );
  }
}

export async function CareerDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/careers/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to delete career",
      }
    );
  }
}

// Category services
export async function CategoryListService(params?: {
  type?: string;
  sortOrder?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/categories", { params });
    return response as { status: number; data: CategoryItem[] };
  } catch (error: any) {
    return { status: 500, data: [] };
  }
}

export async function CategoryCreateService(payload: {
  name: string;
  type?: string;
}) {
  try {
    const { data: response } = await AxiosClient.post("/categories", payload);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to create category",
      }
    );
  }
}

export async function CategoryUpdateService(id: number, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/categories/${id}`,
      payload
    );
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to update category",
      }
    );
  }
}

export async function CategoryDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/categories/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to delete category",
      }
    );
  }
}
