"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../../context/auth-context";

interface Denuncia {
  id: number;
  categoria: string;
  data_ocorrencia: string;
  cidade: string;
  estado: string;
  endereco: string;
  descricao: string;
  status: string | null;
  usuario_codigo?: string;
}

interface AdminPanelProps {
  inputCode: string;
  onLoginSuccess: (code: string) => void;
  onAdminSuccess: (denuncias: Denuncia[]) => void;
  onError?: (error: string) => void;
}

export default function AdminPanel({
  inputCode,
  onLoginSuccess,
  onAdminSuccess,
  onError,
}: AdminPanelProps) {
  const processedCodeRef = useRef("");
  const skipNextCheckRef = useRef(false);
  const auth = useAuth();
  const { userCode, isAdmin } = auth;

  useEffect(() => {
    if (!isAdmin && !userCode) {
      processedCodeRef.current = "";
    }

    const handleLogout = () => {
      // sempre forçar reprocessar o próximo valor de code
      skipNextCheckRef.current = false;
      processedCodeRef.current = "";
    };

    window.addEventListener("authLogout", handleLogout);
    return () => window.removeEventListener("authLogout", handleLogout);
  }, [isAdmin, userCode, inputCode]);

  useEffect(() => {
    if (!inputCode) return;

    const shouldSkip =
      (inputCode === processedCodeRef.current &&
        (isAdmin || userCode === inputCode)) ||
      skipNextCheckRef.current;

    if (shouldSkip) {
      skipNextCheckRef.current = false;
      return;
    }

    const handleCodeVerification = async () => {
      processedCodeRef.current = inputCode;

      if (inputCode === "ADM123654") {
        try {
          const res = await fetch("/api/admin/denuncias");
          const data = await res.json();
          if (data.denuncias) {
            auth.enterAdmin();
            onAdminSuccess(data.denuncias);
          }
        } catch (error) {
          console.error("Erro ao buscar denúncias administrativas:", error);
          onError?.("Erro ao buscar denúncias administrativas");
        }
      } else {
        // Valida código normal de usuário com a API
        try {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: inputCode }),
          });

          if (response.ok) {
            auth.login(inputCode);
            onLoginSuccess(inputCode);
          } else {
            const data = await response.json();
            onError?.(data.error || "Código inválido");
          }
        } catch (error) {
          console.error("Erro ao validar código:", error);
          onError?.("Erro ao validar código");
        }
      }
    };

    handleCodeVerification();
  }, [
    inputCode,
    onLoginSuccess,
    onAdminSuccess,
    onError,
    isAdmin,
    userCode,
    auth,
  ]);

  return null;
}
