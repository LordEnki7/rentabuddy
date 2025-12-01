import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";
import type { User, ClientProfile, BuddyProfile } from "@shared/schema";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: ClientProfile | BuddyProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ClientProfile | BuddyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    await refetch();
  };

  const register = async (data: any) => {
    const result = await api.register(data);
    setUser(result.user);
    await refetch();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
