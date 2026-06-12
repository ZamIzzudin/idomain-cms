import AxiosClient from "@/lib/axios";

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author: string;
  tags: string[];
  featuredImage: string | null;
  featuredImagePublicId: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  status: number;
  items: EventItem[];
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

export async function EventListService(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
  upcoming?: string;
  sortOrder?: string;
}) {
  try {
    const { data: response } = await AxiosClient.get("/events", { params });
    return response as EventListResponse;
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

export async function EventFilterOptionsService() {
  try {
    const { data: response } = await AxiosClient.get("/events/filter-options");
    return response as FilterOptionsResponse;
  } catch (error: any) {
    return { status: 500, data: { tags: [] } };
  }
}

export async function EventCreateService(payload: {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  eventDate: string;
  endDate?: string;
  location?: string;
  status?: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: File | null;
}) {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.content) formData.append("content", payload.content);
    if (payload.excerpt) formData.append("excerpt", payload.excerpt);
    if (payload.author) formData.append("author", payload.author);
    if (payload.tags) formData.append("tags", JSON.stringify(payload.tags));
    formData.append("eventDate", payload.eventDate);
    if (payload.endDate) formData.append("endDate", payload.endDate);
    if (payload.location) formData.append("location", payload.location);
    if (payload.status) formData.append("status", payload.status);
    if (payload.publishedAt) formData.append("publishedAt", payload.publishedAt);
    if (payload.metaTitle) formData.append("metaTitle", payload.metaTitle);
    if (payload.metaDescription)
      formData.append("metaDescription", payload.metaDescription);
    if (payload.metaKeywords)
      formData.append("metaKeywords", JSON.stringify(payload.metaKeywords));
    if (payload.featuredImage)
      formData.append("featuredImage", payload.featuredImage);

    const { data: response } = await AxiosClient.post("/events", formData);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to create event",
      }
    );
  }
}

export async function EventUpdateService(
  id: number,
  payload: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    tags?: string[];
    eventDate?: string;
    endDate?: string;
    location?: string;
    status?: string;
    publishedAt?: string | null;
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
    if (payload.slug !== undefined) formData.append("slug", payload.slug);
    if (payload.content !== undefined)
      formData.append("content", payload.content);
    if (payload.excerpt !== undefined)
      formData.append("excerpt", payload.excerpt);
    if (payload.author !== undefined)
      formData.append("author", payload.author);
    if (payload.tags !== undefined)
      formData.append("tags", JSON.stringify(payload.tags));
    if (payload.eventDate !== undefined)
      formData.append("eventDate", payload.eventDate);
    if (payload.endDate !== undefined)
      formData.append("endDate", payload.endDate);
    if (payload.location !== undefined)
      formData.append("location", payload.location);
    if (payload.status !== undefined)
      formData.append("status", payload.status);
    if (payload.publishedAt !== undefined)
      formData.append("publishedAt", payload.publishedAt || "");
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
      `/events/${id}`,
      formData
    );
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to update event",
      }
    );
  }
}

export async function EventDeleteService(id: number) {
  try {
    const { data: response } = await AxiosClient.delete(`/events/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to delete event",
      }
    );
  }
}

export async function EventDetailService(id: number) {
  try {
    const { data: response } = await AxiosClient.get(`/events/${id}`);
    return response;
  } catch (error: any) {
    return (
      error?.response?.data || {
        status: 400,
        message: "Failed to fetch event",
      }
    );
  }
}
