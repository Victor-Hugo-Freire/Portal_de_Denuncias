"use client";

import { useState, useEffect, useCallback } from "react";

interface Denuncia {
  id: number;
  categoria: string;
  data_ocorrencia: string;
  cidade: string;
  estado: string;
  descricao: string;
  status: string | null;
  usuario_codigo?: string;
}

interface AdminPanelProps {
  inputCode: string;
  onLoginSuccess: () => void;
  onAdminSuccess: (denuncias: Denuncia[]) => void;
}

export default function AdminPanel({
  inputCode,
  onLoginSuccess,
  onAdminSuccess,
}: AdminPanelProps) {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!inputCode || processed) return;

    const handleCodeVerification = async () => {
      if (inputCode === "ADM123654") {
        try {
          const res = await fetch("/api/admin/denuncias");
          const data = await res.json();
          if (data.denuncias) {
            onAdminSuccess(data.denuncias);
          }
        } catch (error) {
          console.error("Erro ao buscar denúncias administrativas:", error);
        }
      } else {
        // Código normal de usuário
        onLoginSuccess();
      }
      setProcessed(true);
    };

    handleCodeVerification();
  }, [inputCode, onLoginSuccess, onAdminSuccess, processed]);

  return null;
}
