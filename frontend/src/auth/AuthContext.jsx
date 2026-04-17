import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post("/api/auth/register", payload);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

