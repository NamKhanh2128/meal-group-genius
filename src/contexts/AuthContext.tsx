import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/types";
import { authService } from "@/services/auth.service";
import { seedIfEmpty } from "@/services/seed";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  changePassword: (oldPw: string, newPw: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfEmpty();
    setUser(authService.current());
    setLoading(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login: async (e, p) => {
          const u = await authService.login(e, p);
          setUser(u);
          return u;
        },
        register: async (e, p, n) => {
          const u = await authService.register({ email: e, password: p, name: n });
          setUser(u);
          return u;
        },
        logout: async () => {
          await authService.logout();
          setUser(null);
        },
        updateProfile: async (patch) => {
          const u = await authService.updateProfile(patch);
          setUser(u);
        },
        changePassword: async (o, n) => {
          await authService.changePassword(o, n);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}