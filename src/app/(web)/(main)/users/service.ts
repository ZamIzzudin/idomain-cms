"use client";

import AxiosClient from "@/lib/axios";

export interface UserItem {
  id: number;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export interface UserListResponse {
  status: number;
  items: UserItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function UserListService(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortOrder?: string;
  sortBy?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/auth/list", { params });
    return response as UserListResponse;
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

export async function RegisterService(payload: {
  username: string;
  password: string;
  displayName: string;
}) {
  try {
    const { data: response } = await AxiosClient.post("/auth/register", payload);
    const { status, message, data } = response;
    if (status !== 201) throw new Error(message);
    return { status, message, data };
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to register" };
  }
}

export async function UpdateService(payload: {
  id: number;
  username?: string;
  displayName?: string;
  password?: string;
  role?: string;
}) {
  try {
    const { id, ...body } = payload;
    const { data: response } = await AxiosClient.put(`/auth/adjust/${id}`, body);
    const { status, message } = response;
    if (status !== 200) throw new Error(message);
    return { status, message };
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to update" };
  }
}

export async function DeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/auth/takedown/${id}`);
    const { status, message } = response;
    if (status !== 200) throw new Error(message);
    return { status, message };
  } catch (error: any) {
    return error?.response?.data || { status: 400, message: "Failed to delete" };
  }
}
