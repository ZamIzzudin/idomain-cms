import AxiosClient from "@/lib/axios";

export interface WorkHistoryItem {
  id: number;
  alumniId: number;
  institutionName: string;
  startYear: number;
  endYear: number | null;
  province: string | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniItem {
  id: number;
  name: string;
  email: string | null;
  contactNumber: string | null;
  graduationYear: number;
  batch: number | null;
  degreePrefix: string | null;
  degreeSuffix: string | null;
  specialization: string | null;
  province: string | null;
  city: string | null;
  photo: string | null;
  photoPublicId: string | null;
  status: number;
  isApproved: boolean;
  workHistories: WorkHistoryItem[];
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
    provinces: string[];
  };
}

export async function AlumniListService(params: {
  page?: number;
  perPage?: number;
  q?: string;
  graduationYear?: number;
  specialization?: string;
  province?: string;
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
    return { status: 500, data: { years: [], specializations: [], provinces: [] } };
  }
}

export async function AlumniCreateService(payload: {
  name: string;
  graduationYear: number;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  degreePrefix?: string | null;
  degreeSuffix?: string | null;
  specialization?: string | null;
  province?: string | null;
  city?: string | null;
  photo?: File | null;
  batch?: number | null;
}) {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("graduationYear", String(payload.graduationYear));
    if (payload.email) formData.append("email", payload.email);
    if (payload.contactNumber) formData.append("contactNumber", payload.contactNumber);
    if (payload.password) formData.append("password", payload.password);
    if (payload.degreePrefix) formData.append("degreePrefix", payload.degreePrefix);
    if (payload.degreeSuffix) formData.append("degreeSuffix", payload.degreeSuffix);
    if (payload.specialization) formData.append("specialization", payload.specialization);
    if (payload.province) formData.append("province", payload.province);
    if (payload.city) formData.append("city", payload.city);
    if (payload.photo) formData.append("photo", payload.photo);
    if (payload.batch) formData.append("batch", String(payload.batch));

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
    degreePrefix?: string | null;
    degreeSuffix?: string | null;
    specialization?: string | null;
    province?: string | null;
    city?: string | null;
    photo?: File | null;
    removePhoto?: boolean;
    batch?: number | null;
  }
) {
  try {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.graduationYear) formData.append("graduationYear", String(payload.graduationYear));
    if (payload.email !== undefined) formData.append("email", payload.email || "");
    if (payload.contactNumber !== undefined) formData.append("contactNumber", payload.contactNumber || "");
    if (payload.password) formData.append("password", payload.password);
    if (payload.degreePrefix !== undefined) formData.append("degreePrefix", payload.degreePrefix || "");
    if (payload.degreeSuffix !== undefined) formData.append("degreeSuffix", payload.degreeSuffix || "");
    if (payload.specialization !== undefined) formData.append("specialization", payload.specialization || "");
    if (payload.province !== undefined) formData.append("province", payload.province || "");
    if (payload.city !== undefined) formData.append("city", payload.city || "");
    if (payload.photo) formData.append("photo", payload.photo);
    if (payload.removePhoto) formData.append("removePhoto", "true");
    if (payload.batch !== undefined) formData.append("batch", payload.batch ? String(payload.batch) : "");

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

export async function AlumniExportExcelService() {
  try {
    const { data: response } = await AxiosClient.get("/alumni/export", {
      responseType: "blob",
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to export alumni" };
  }
}

export async function AlumniImportExcelService(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data: response } = await AxiosClient.post("/alumni/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to import alumni" };
  }
}

export async function AlumniDownloadTemplateService() {
  try {
    const { data: response } = await AxiosClient.get("/alumni/import-template", {
      responseType: "blob",
    });
    return response;
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to download template" };
  }
}
