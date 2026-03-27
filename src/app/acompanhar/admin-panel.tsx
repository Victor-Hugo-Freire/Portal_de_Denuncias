"use client";

import { useState, useEffect } from "react";
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
  const [processed, setProcessed] = useState(false);
  const auth = useAuth();

  // Resetar quando código muda
  useEffect(() => {
    setProcessed(false);
  }, [inputCode]);

  useEffect(() => {
    if (!inputCode || processed) return;

    const handleCodeVerification = async () => {
      setProcessed(true);

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
  }, [inputCode, processed, onLoginSuccess, onAdminSuccess, onError, auth]);

  return null;
}
