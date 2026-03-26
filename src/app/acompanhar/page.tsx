"use client";

import Header from "../../components/header";
import Footer from "../../components/footer";
import Notification from "../../components/notification";
import AdminPanel from "./admin-panel";
import { useState, useEffect, useCallback, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useAuth } from "../../context/auth-context";

function formatarData(dataISO: string): string {
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dataISO;
  }
}

type Denuncia = {
  id: number;
  categoria: string;
  data_ocorrencia: string;
  cidade: string;
  estado: string;
  descricao: string;
  status: string | null;
  usuario_codigo?: string;
};

const AcompanharPage = memo(function AcompanharPage() {
  const auth = useAuth();
  const { userCode, isLogged, login } = auth;
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCodeSubmit = useCallback(async () => {
    if (inputCode.length !== 8 && inputCode !== "ADM123654") {
      setNotification({
        type: "error",
        title: "Código inválido",
        message: "O código deve ter 8 caracteres.",
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Passa para AdminPanel fazer a verificação
    setIsAdmin(true);
  }, [inputCode]);

  const handleAdminCodeVerification = useCallback(
    (adminDenuncias: Denuncia[]) => {
      setDenuncias(adminDenuncias);
    },
    [],
  );

  const handleNormalLogin = useCallback(async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNotification({
          type: "error",
          title: "Login falhou",
          message: data.error || "Código inválido.",
        });
        setTimeout(() => setNotification(null), 5000);
        setIsAdmin(false);
        return;
      }

      login(inputCode);
      setIsAdmin(false);
      setNotification({
        type: "success",
        title: "Login realizado",
        message: "Login efetuado com sucesso.",
      });
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setNotification({
        type: "error",
        title: "Erro",
        message: "Erro ao conectar ao servidor.",
      });
      setTimeout(() => setNotification(null), 5000);
      setIsAdmin(false);
    }
  }, [inputCode, login]);

  const fetchDenuncias = useCallback(async () => {
    if (!userCode) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/acompanhar?code=${userCode}`);
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
    if (isAdmin) {
      return;
    }

    if (isLogged && userCode) {
      fetchDenuncias();
    } else {
      setDenuncias([]);
    }
  }, [isLogged, userCode, fetchDenuncias, isAdmin]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showMakeComplaintButton={true}
        showCodeButton={true}
        showTrackingButton={false}
      />
      {notification && <Notification notification={notification} />}
      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Acompanhar Denúncias</h1>
          {isAdmin ? (
            <>
              <AdminPanel
                inputCode={inputCode}
                onLoginSuccess={handleNormalLogin}
                onAdminSuccess={handleAdminCodeVerification}
              />
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {denuncias
                      .sort((a, b) =>
                        (a.usuario_codigo || "").localeCompare(
                          b.usuario_codigo || "",
                        ),
                      )
                      .map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-sm">
                            {d.usuario_codigo}
                          </TableCell>
                          <TableCell>{d.categoria}</TableCell>
                          <TableCell>
                            {formatarData(d.data_ocorrencia)}
                          </TableCell>
                          <TableCell>
                            {d.cidade}, {d.estado}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {d.descricao}
                          </TableCell>
                          <TableCell>{d.status || "Em análise"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Nenhuma denúncia encontrada.</p>
              )}
            </>
          ) : isLogged ? (
            <>
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {denuncias.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.categoria}</TableCell>
                        <TableCell>{formatarData(d.data_ocorrencia)}</TableCell>
                        <TableCell>
                          {d.cidade}, {d.estado}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {d.descricao}
                        </TableCell>
                        <TableCell>{d.status || "Em análise"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Você ainda não fez nenhuma denúncia.</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p>
                Digite seu código de 8 caracteres para acompanhar suas
                denúncias:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ABC12345"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleCodeSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                >
                  Acompanhar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default AcompanharPage;
