"use client";

import AxiosClient from "@/lib/axios";
import type { RoleItem, PermissionItem } from "@/interface/type";

export async function RoleListService() {
  try {
    const { data: response } = await AxiosClient.get("/roles");
    return (response.items || []) as RoleItem[];
  } catch (error: any) {
    return [];
  }
}

export async function PermissionListService() {
  try {
    const { data: response } = await AxiosClient.get("/roles/permissions");
    return (response.items || []) as PermissionItem[];
  } catch (error: any) {
    return [];
  }
}

export async function CreateRoleService(payload: {
  name: string;
  description?: string;
  permissionIds: number[];
  batchScopes?: number[];
}) {
  try {
    const { data: response } = await AxiosClient.post("/roles", payload);
    const { status, message } = response;
    if (status !== 201) throw new Error(message);
    return { status, message };
  } catch (error: any) {
    return (
      error?.response?.data || { status: 400, message: "Failed to create role" }
    );
  }
}

export async function UpdateRoleService(payload: {
  id: number;
  name?: string;
  description?: string;
  permissionIds?: number[];
  batchScopes?: number[];
}) {
  try {
    const { id, ...body } = payload;
    const { data: response } = await AxiosClient.put(`/roles/${id}`, body);
    const { status, message } = response;
    if (status !== 200) throw new Error(message);
    return { status, message };
  } catch (error: any) {
    return (
      error?.response?.data || { status: 400, message: "Failed to update role" }
    );
  }
}

export async function DeleteRoleService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/roles/${id}`);
    const { status, message } = response;
    if (status !== 200) throw new Error(message);
    return { status, message };
  } catch (error: any) {
    return (
      error?.response?.data || { status: 400, message: "Failed to delete role" }
    );
  }
}
