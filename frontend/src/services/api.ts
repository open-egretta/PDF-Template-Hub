// src/services/api.ts
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// ============================================
// 類型定義
// ============================================

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
  data?: any;
  isNetworkError?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

// ============================================
// API Service Class
// ============================================

class ApiService {
  private axiosInstance: AxiosInstance;
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  // ============================================
  // 設定攔截器
  // ============================================

  private setupInterceptors(): void {
    // Request 攔截器
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response 攔截器
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  // ============================================
  // Request 處理
  // ============================================

  private handleRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    // 自動加入 Token
    const token = this.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 開發環境 log
    if (import.meta.env.DEV) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  }

  private handleRequestError(error: AxiosError): Promise<never> {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }

  // ============================================
  // Response 處理
  // ============================================

  private handleResponse(response: AxiosResponse): AxiosResponse {
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  }

  private handleResponseError(error: AxiosError): Promise<ApiError> {
    const apiError = this.formatError(error);

    // 處理特定狀態碼
    if (apiError.status === 401) {
      this.handleUnauthorized();
    }

    console.error("❌ API Error:", apiError);
    return Promise.reject(apiError);
  }

  // ============================================
  // 錯誤格式化
  // ============================================

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      // 伺服器回應錯誤
      return {
        status: error.response.status,
        message:
          (error.response.data as any)?.error ||
          (error.response.data as any)?.message ||
          "Unknown error",
        errors: (error.response.data as any)?.errors || null,
        data: error.response.data,
      };
    } else if (error.request) {
      // 網路錯誤
      return {
        status: 0,
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      };
    } else {
      // 請求配置錯誤
      return {
        status: 0,
        message: error.message || "Request failed",
      };
    }
  }

  // ============================================
  // 401 處理
  // ============================================

  private handleUnauthorized(): void {
    // this.clearAuth();
    // if (!window.location.pathname.includes("/login")) {
    //   const currentPath = window.location.pathname;
    //   if (currentPath !== "/login") {
    //     localStorage.setItem("redirectAfterLogin", currentPath);
    //   }
    //   window.location.href = "/login";
    // }
  }

  // ============================================
  // HTTP Methods
  // ============================================

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // ============================================
  // Token 管理
  // ============================================

  setToken(token: string): void {
    localStorage.setItem("token", token);
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  clearAuth(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ============================================
  // 上傳檔案
  // ============================================

  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });

    return response.data;
  }

  // ============================================
  // 取得原始 Axios 實例（進階使用）
  // ============================================

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// ============================================
// 單例模式匯出
// ============================================

const apiService = new ApiService();

export default apiService;

// 也匯出 class 本身，方便測試或建立多個實例
export { ApiService };
