import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "../lib/api";
import type { User } from "../types";

const TOKEN_KEY = "ravenstrail_token";
// sessionStorage so the login ends when the browser closes; drop tokens saved by the old localStorage version.
localStorage.removeItem(TOKEN_KEY);

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (body: Parameters<typeof authApi.updateProfile>[1]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me(token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function applyAuth(response: { user: User; token: string }) {
    sessionStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  async function signup(name: string, email: string, password: string) {
    applyAuth(await authApi.signup({ name, email, password }));
  }

  async function login(email: string, password: string) {
    applyAuth(await authApi.login({ email, password }));
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function updateProfile(body: Parameters<typeof authApi.updateProfile>[1]) {
    if (!token) return;
    setUser(await authApi.updateProfile(token, body));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
