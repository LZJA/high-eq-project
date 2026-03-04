import axios, { AxiosInstance } from 'axios';

// API 基础 URL
// 开发环境：使用 Vite 代理 /api
// 生产环境：使用环境变量 VITE_API_URL 或相对路径
const API_BASE_URL = import.meta.env.MODE === 'development'
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api');

/**
 * API 客户端配置
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器 - 添加 JWT Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 处理 Token 过期
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 认证相关 API
 */
export const authAPI = {
  /**
   * 用户注册
   */
  register: async (data: {
    username: string;
    password: string;
    email?: string;
    phone?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * 用户登录
   */
  login: async (data: { username: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * 刷新 Token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

/**
 * 回复生成相关 API
 */
export const replyAPI = {
  /**
   * 生成高情商回复
   */
  generateReplies: async (data: {
    chatContent: string;
    roleBackground: string;
    userIntent: string;
    replyCount?: number;
    modelPreference?: string;
  }) => {
    const response = await apiClient.post('/reply/generate', data);
    return response.data;
  },

  /**
   * 获取历史记录列表
   */
  getHistory: async (page: number = 1, size: number = 10) => {
    const response = await apiClient.get('/reply/history', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * 获取历史记录详情
   */
  getHistoryDetail: async (historyId: string) => {
    const response = await apiClient.get(`/reply/history/${historyId}`);
    return response.data;
  },

  /**
   * 获取历史记录的回复建议
   */
  getHistorySuggestions: async (historyId: string) => {
    const response = await apiClient.get(`/reply/history/${historyId}/suggestions`);
    return response.data;
  },

  /**
   * 删除历史记录
   */
  deleteHistory: async (historyId: string) => {
    const response = await apiClient.delete(`/reply/history/${historyId}`);
    return response.data;
  },

  /**
   * 收藏/取消收藏历史记录
   */
  toggleFavorite: async (historyId: string) => {
    const response = await apiClient.post(`/reply/history/${historyId}/favorite`);
    return response.data;
  },

  /**
   * 获取收藏的历史记录
   */
  getFavoriteHistory: async () => {
    const response = await apiClient.get('/reply/history/favorite');
    return response.data;
  },
};

export default apiClient;
