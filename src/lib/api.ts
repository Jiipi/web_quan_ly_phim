export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

function errMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

async function parseError(res: Response): Promise<never> {
  const errorData = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
}

export const api = {
  async get<T>(url: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    try {
      let queryUrl = url;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => searchParams.append(key, String(val)));
        queryUrl += `?${searchParams.toString()}`;
      }
      const res = await fetch(queryUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) await parseError(res);
      return { data: (await res.json()) as T, success: true };
    } catch (err: unknown) {
      console.error(`API GET Error [${url}]:`, err);
      return { error: errMessage(err, "Đã xảy ra lỗi kết nối."), success: false };
    }
  },

  async post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) await parseError(res);
      return { data: (await res.json()) as T, success: true };
    } catch (err: unknown) {
      console.error(`API POST Error [${url}]:`, err);
      return { error: errMessage(err, "Đã xảy ra lỗi gửi dữ liệu."), success: false };
    }
  },

  async put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) await parseError(res);
      return { data: (await res.json()) as T, success: true };
    } catch (err: unknown) {
      console.error(`API PUT Error [${url}]:`, err);
      return { error: errMessage(err, "Đã xảy ra lỗi cập nhật."), success: false };
    }
  },

  async patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) await parseError(res);
      return { data: (await res.json()) as T, success: true };
    } catch (err: unknown) {
      console.error(`API PATCH Error [${url}]:`, err);
      return { error: errMessage(err, "Đã xảy ra lỗi cập nhật."), success: false };
    }
  },

  async delete<T>(url: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    try {
      let queryUrl = url;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => searchParams.append(key, String(val)));
        queryUrl += `?${searchParams.toString()}`;
      }
      const res = await fetch(queryUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) await parseError(res);
      return { data: (await res.json()) as T, success: true };
    } catch (err: unknown) {
      console.error(`API DELETE Error [${url}]:`, err);
      return { error: errMessage(err, "Đã xảy ra lỗi xoá dữ liệu."), success: false };
    }
  },
};
