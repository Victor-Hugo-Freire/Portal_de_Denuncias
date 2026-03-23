"use client";

import { createContext, useContext, useState } from "react";

type AuthContextType = {
  userCode: string | null;
  isLogged: boolean;
  login: (code: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userCode, setUserCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("userCode");
  });

  const login = (code: string) => {
    setUserCode(code);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("userCode", code);
    }
  };

  const logout = () => {
    setUserCode(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("userCode");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userCode,
        isLogged: Boolean(userCode),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
