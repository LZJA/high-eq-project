import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";

/**
 * 用户信息类型
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  nickname?: string;
  createTime?: string;
}

/**
 * 认证上下文类型
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    email?: string,
    phone?: string
  ) => Promise<void>;
  logout: () => void;
}

/**
 * 创建认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // 验证 token 是否有效
      authAPI.getCurrentUser()
        .then(() => {
          // token 有效，从 localStorage 中恢复用户信息
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        })
        .catch(() => {
          // token 无效，清除所有数据
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    // 监听自定义登出事件（当 token 失效时触发）
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout', handleLogout);

    return () => {
      window.removeEventListener('auth_logout', handleLogout);
    };
  }, []);

  /**
   * 登录
   */
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ username, password });
      const { token, refreshToken, user: userData } = response.data;

      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 注册
   */
  const register = async (
    username: string,
    password: string,
    email?: string,
    phone?: string
  ) => {
    setIsLoading(true);
    try {
      await authAPI.register({ username, password, email, phone });
      // 注册成功后自动登录
      await login(username, password);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 登出
   */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证上下文的 Hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
