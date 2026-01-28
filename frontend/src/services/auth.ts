// src/services/auth.service.js
import apiService from "./api";

class AuthService {
  private readonly BASE_PATH: string;
  constructor() {
    this.BASE_PATH = "/auth";
  }

  async login(email: string, password: string) {
    const data = await apiService.post(`${this.BASE_PATH}/login`, {
      email,
      password,
    });

    if (data.token) {
      apiService.setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData: any) {
    return await apiService.post(`${this.BASE_PATH}/register`, userData);
  }

  async getCurrentUser() {
    const response = await apiService.get(`${this.BASE_PATH}/me`);
    return response.user;
  }

  async logout() {
    await apiService.post(`${this.BASE_PATH}/logout`);
    apiService.clearAuth();
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    return await apiService.post(`/api/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  getCurrentUserId() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch {
      return null;
    }
  }

  getCurrentUserData() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return apiService.isAuthenticated();
  }
}

const authService = new AuthService();

export default authService;
