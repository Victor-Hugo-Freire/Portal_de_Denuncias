"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  userCode: string | null;
  isLogged: boolean;
  isAdmin: boolean;
  login: (code: string) => void;
  enterAdmin: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar sessionStorage quando o componente monta
    const storedCode = sessionStorage.getItem("userCode");
    if (storedCode) {
      setUserCode(storedCode);
    }

    // Verificar cookie de admin
    const adminCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("isAdmin="));
    if (adminCookie) {
      setIsAdmin(true);
    }
  }, []);

  const login = (code: string) => {
    setUserCode(code);
    setIsAdmin(false);
    sessionStorage.setItem("userCode", code);
    // Remover cookie de admin se existir
    document.cookie =
      "isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.dispatchEvent(new CustomEvent("authChange"));
  };

  const enterAdmin = () => {
    setUserCode(null);
    setIsAdmin(true);
    sessionStorage.removeItem("userCode");
    // Definir cookie de admin (sessão do navegador)
    document.cookie = "isAdmin=true; path=/;";
    window.dispatchEvent(new CustomEvent("authChange"));
  };

  const logout = () => {
    setUserCode(null);
    setIsAdmin(false);
    sessionStorage.removeItem("userCode");
    // Remover cookie de admin
    document.cookie =
      "isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.dispatchEvent(new CustomEvent("authChange"));
  };

  return (
    <AuthContext.Provider
      value={{
        userCode,
        isLogged: Boolean(userCode),
        isAdmin,
        login,
        enterAdmin,
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
