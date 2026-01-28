import * as React from "react";
import authService from "./services/auth";

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface AuthContext {
  isAuthenticated: boolean;
  status: 'loggedOut' | 'loggedIn';
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = "user";

function getStoredUser(): User | null {
  const userStr = localStorage.getItem(key);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser());
  const isAuthenticated = !!user && authService.isAuthenticated();
  const status = isAuthenticated ? 'loggedIn' : 'loggedOut';

  React.useEffect(() => {
    const storedUser = getStoredUser();
    // 如果有 user 但没有 token，清除 user
    if (storedUser && !authService.isAuthenticated()) {
      localStorage.removeItem(key);
      setUser(null);
    } else if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    localStorage.setItem(key, JSON.stringify(data.user));
  }, []);

  const logout = React.useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(key);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, status, user, setUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
