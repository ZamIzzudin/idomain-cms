import AxiosClient from "@/lib/axios";

export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author: string;
  tags: string[];
  featuredImage: string | null;
  featuredImagePublicId: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  status: number;
  items: ArticleItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FilterOptionsResponse {
  status: number;
  data: {
    tags: string[];
  };
}

export async function ArticleListService(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
  sortOrder?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/articles", { params });
    return response as ArticleListResponse;
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

export async function ArticleFilterOptionsService() {
  try {
    const { data: response } = await AxiosClient.get(
      "/articles/filter-options"
    );
    return response as FilterOptionsResponse;
  } catch (error: any) {
    return { status: 500, data: { tags: [] } };
  }
}

export async function ArticleCreateService(payload: {
  title: string;
  content?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: File | null;
}) {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.content) formData.append("content", payload.content);
    if (payload.excerpt) formData.append("excerpt", payload.excerpt);
    if (payload.author) formData.append("author", payload.author);
    if (payload.tags) formData.append("tags", JSON.stringify(payload.tags));
    if (payload.status) formData.append("status", payload.status);
    if (payload.metaTitle) formData.append("metaTitle", payload.metaTitle);
    if (payload.metaDescription)
      formData.append("metaDescription", payload.metaDescription);
    if (payload.metaKeywords)
      formData.append("metaKeywords", JSON.stringify(payload.metaKeywords));
    if (payload.featuredImage)
      formData.append("featuredImage", payload.featuredImage);

    const { data: response } = await AxiosClient.post("/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to create article",
      }
    );
  }
}

export async function ArticleUpdateService(
  id: number,
  payload: {
    title?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    tags?: string[];
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    featuredImage?: File | null;
    removeImage?: boolean;
  }
) {
  try {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.content !== undefined)
      formData.append("content", payload.content);
    if (payload.excerpt !== undefined)
      formData.append("excerpt", payload.excerpt);
    if (payload.author !== undefined)
      formData.append("author", payload.author);
    if (payload.tags !== undefined)
      formData.append("tags", JSON.stringify(payload.tags));
    if (payload.status !== undefined)
      formData.append("status", payload.status);
    if (payload.metaTitle !== undefined)
      formData.append("metaTitle", payload.metaTitle);
    if (payload.metaDescription !== undefined)
      formData.append("metaDescription", payload.metaDescription);
    if (payload.metaKeywords !== undefined)
      formData.append("metaKeywords", JSON.stringify(payload.metaKeywords));
    if (payload.featuredImage)
      formData.append("featuredImage", payload.featuredImage);
    if (payload.removeImage) formData.append("removeImage", "true");

    const { data: response } = await AxiosClient.put(
      `/articles/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to update article",
      }
    );
  }
}

export async function ArticleDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/articles/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to delete article",
      }
    );
  }
}

export async function ArticleDetailService(id: number) {
  try {
    const { data: response } = await AxiosClient.get(`/articles/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to fetch article",
      }
    );
  }
}
