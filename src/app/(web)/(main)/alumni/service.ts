import AxiosClient from "@/lib/axios";

export interface AlumniItem {
  id: number;
  name: string;
  email: string | null;
  contactNumber: string | null;
  graduationYear: number;
  degree: string | null;
  specialization: string | null;
  institution: string | null;
  photo: string | null;
  photoPublicId: string | null;
  status: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniListResponse {
  status: number;
  items: AlumniItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FilterOptionsResponse {
  status: number;
  data: {
    years: number[];
    specializations: string[];
  };
}

export async function AlumniListService(params: {
  page?: number;
  perPage?: number;
  q?: string;
  graduationYear?: number;
  specialization?: string;
  sort?: string;
  approved?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/alumni", { params });
    return response as AlumniListResponse;
  } catch (error: any) {
    return { status: 500, items: [], total: 0, page: 1, perPage: 15, totalPages: 0 };
  }
}

export async function AlumniFilterOptionsService() {
  try {
    const { data: response } = await AxiosClient.get("/alumni/filter-options");
    return response as FilterOptionsResponse;
  } catch (error: any) {
    return { status: 500, data: { years: [], specializations: [] } };
  }
}

export async function AlumniCreateService(payload: {
  name: string;
  graduationYear: number;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  degree?: string | null;
  specialization?: string | null;
  institution?: string | null;
  photo?: File | null;
}) {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("graduationYear", String(payload.graduationYear));
    if (payload.email) formData.append("email", payload.email);
    if (payload.contactNumber) formData.append("contactNumber", payload.contactNumber);
    if (payload.password) formData.append("password", payload.password);
    if (payload.degree) formData.append("degree", payload.degree);
    if (payload.specialization) formData.append("specialization", payload.specialization);
    if (payload.institution) formData.append("institution", payload.institution);
    if (payload.photo) formData.append("photo", payload.photo);

    const { data: response } = await AxiosClient.post("/alumni", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to create alumni" };
  }
}

export async function AlumniUpdateService(
  id: number,
  payload: {
    name?: string;
    graduationYear?: number;
    email?: string | null;
    contactNumber?: string | null;
    password?: string | null;
    degree?: string | null;
    specialization?: string | null;
    institution?: string | null;
    photo?: File | null;
    removePhoto?: boolean;
  }
) {
  try {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.graduationYear) formData.append("graduationYear", String(payload.graduationYear));
    if (payload.email !== undefined) formData.append("email", payload.email || "");
    if (payload.contactNumber !== undefined) formData.append("contactNumber", payload.contactNumber || "");
    if (payload.password) formData.append("password", payload.password);
    if (payload.degree !== undefined) formData.append("degree", payload.degree || "");
    if (payload.specialization !== undefined) formData.append("specialization", payload.specialization || "");
    if (payload.institution !== undefined) formData.append("institution", payload.institution || "");
    if (payload.photo) formData.append("photo", payload.photo);
    if (payload.removePhoto) formData.append("removePhoto", "true");

    const { data: response } = await AxiosClient.put(`/alumni/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to update alumni" };
  }
}

export async function AlumniDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/alumni/${id}`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to delete alumni" };
  }
}

export async function AlumniDetailService(id: number) {
  try {
    const { data: response } = await AxiosClient.get(`/alumni/${id}`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to fetch alumni" };
  }
}

export async function AlumniApproveService(id: number) {
  try {
    const { data: response } = await AxiosClient.put(`/alumni/${id}/approve`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to approve alumni" };
  }
}

export async function AlumniRejectService(id: number) {
  try {
    const { data: response } = await AxiosClient.put(`/alumni/${id}/reject`);
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to reject alumni" };
  }
}
