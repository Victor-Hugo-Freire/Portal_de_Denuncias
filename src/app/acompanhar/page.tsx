"use client";

import Header from "../../components/header";
import Footer from "../../components/footer";
import { useState, useEffect, useCallback, memo } from "react";

const AcompanharPage = memo(function AcompanharPage() {
  const [userCode, setUserCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userCode");
    }
    return null;
  });
  const [isLogged, setIsLogged] = useState(!!userCode);
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthChange = useCallback(() => {
    const code = sessionStorage.getItem("userCode");
    setUserCode(code);
    setIsLogged(!!code);
  }, []);

  const fetchDenuncias = useCallback(async () => {
    if (!userCode) return;
    setLoading(true);
    try {
      const res = await fetch("/api/acompanhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode }),
      });
      const data = await res.json();
      if (data.denuncias) {
        setDenuncias(data.denuncias);
      }
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
    } finally {
      setLoading(false);
    }
  }, [userCode]);

  useEffect(() => {
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [handleAuthChange]);

  useEffect(() => {
    if (isLogged && userCode) {
      fetchDenuncias();
    }
  }, [isLogged, userCode, fetchDenuncias]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showMakeComplaintButton={true} showCodeButton={true} />
      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Acompanhar Denúncias</h1>
          {isLogged ? (
            <>
              <p className="mb-4">
                Bem-vindo {userCode}! Aqui estão suas denúncias:
              </p>
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <div className="space-y-4">
                  {denuncias.map((d) => (
                    <div key={d.id} className="border p-4 rounded">
                      <p>
                        <strong>Categoria:</strong> {d.categoria}
                      </p>
                      <p>
                        <strong>Data:</strong> {d.data_ocorrencia}
                      </p>
                      <p>
                        <strong>Local:</strong> {d.cidade}, {d.estado}
                      </p>
                      <p>
                        <strong>Descrição:</strong> {d.descricao}
                      </p>
                      <p>
                        <strong>Status:</strong> {d.status || "Em análise"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Você ainda não fez nenhuma denúncia.</p>
              )}
            </>
          ) : (
            <p>
              Faça login pelo código para acompanhar suas denúncias armazenadas.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default AcompanharPage;
