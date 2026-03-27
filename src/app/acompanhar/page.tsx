"use client";

import Header from "../../components/header";
import Footer from "../../components/footer";
import Notification from "../../components/notification";
import AdminPanel from "./admin-panel";
import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function formatarTexto(texto: string): string {
  return texto
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

type Denuncia = {
  id: number;
  categoria: string;
  data_ocorrencia: string;
  cidade: string;
  estado: string;
  endereco: string;
  descricao: string;
  status: string | null;
  usuario_codigo?: string;
};

const AcompanharPage = memo(function AcompanharPage() {
  const auth = useAuth();
  const { userCode, isLogged, isAdmin, login, enterAdmin } = auth;
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromQuery = searchParams.get("code") || "";

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  useEffect(() => {
    setMounted(true);
    // Verificar se há notificação de denúncia salva
    const saved = window.sessionStorage.getItem("denunciaNotification");
    if (saved) {
      const parsed = JSON.parse(saved) as {
        type: "success" | "error";
        title: string;
        message: string;
      };
      setNotification(parsed);
      window.sessionStorage.removeItem("denunciaNotification");
      setTimeout(() => setNotification(null), 5000);
    }
  }, []);

  const handleCodeSubmit = useCallback(
    (code?: string) => {
      const codeToUse = code || inputCode;
      if (!codeToUse) {
        setNotification({
          type: "error",
          title: "Código inválido",
          message: "Informe um código para continuar.",
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // Redireciona para acompanhar - AdminPanel fará a validação
      router.push(`/acompanhar?code=${codeToUse}`);
    },
    [inputCode, router],
  );

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
    if (isAdmin) {
      return;
    }

    if (isLogged && userCode) {
      fetchDenuncias();
    } else {
      setDenuncias([]);
    }
  }, [isLogged, userCode, fetchDenuncias, isAdmin]);

  // Buscar denúncias automaticamente quando o componente monta e o usuário está logado
  useEffect(() => {
    if (mounted && isLogged && userCode && !isAdmin && denuncias.length === 0) {
      fetchDenuncias();
    }
  }, [mounted, isLogged, userCode, isAdmin, denuncias.length, fetchDenuncias]);

  // Buscar denúncias admin se estiver em modo admin
  useEffect(() => {
    if (mounted && isAdmin && denuncias.length === 0) {
      const fetchAdminDenuncias = async () => {
        try {
          const res = await fetch("/api/admin/denuncias");
          const data = await res.json();
          if (data.denuncias) {
            setDenuncias(data.denuncias);
          }
        } catch (error) {
          console.error("Erro ao buscar denúncias administrativas:", error);
        }
      };
      fetchAdminDenuncias();
    }
  }, [mounted, isAdmin, denuncias.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showMakeComplaintButton={!isAdmin}
        showCodeButton={true}
        showTrackingButton={false}
      />
      <AdminPanel
        inputCode={codeFromQuery}
        onLoginSuccess={(code) => {
          login(code);
          setNotification({
            type: "success",
            title: "Login realizado",
            message: "Login efetuado com sucesso.",
          });
          setTimeout(() => setNotification(null), 5000);
        }}
        onAdminSuccess={(adminDenuncias) => {
          setDenuncias(adminDenuncias);
          enterAdmin();
          setNotification({
            type: "success",
            title: "Login admin realizado",
            message: "Você entrou como administrador.",
          });
          setTimeout(() => setNotification(null), 5000);
        }}
        onError={(error) => {
          setNotification({
            type: "error",
            title: "Login falhou",
            message: error || "Código inválido.",
          });
          setTimeout(() => setNotification(null), 5000);
        }}
      />
      {notification && <Notification notification={notification} />}
      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Acompanhar Denúncias</h1>
          {!mounted ? (
            <div className="space-y-4">
              <p>Carregando...</p>
            </div>
          ) : isAdmin ? (
            <>
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cidade e Estado</TableHead>
                      <TableHead>Endereço</TableHead>
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
                          <TableCell>{formatarTexto(d.categoria)}</TableCell>
                          <TableCell>
                            {formatarData(d.data_ocorrencia)}
                          </TableCell>
                          <TableCell className="wrap-break-word whitespace-normal">
                            {d.cidade}, {d.estado}
                          </TableCell>
                          <TableCell className="max-w-xs wrap-break-word whitespace-normal">
                            {d.endereco.length > 50
                              ? d.endereco.slice(0, 50) + "..."
                              : d.endereco}
                          </TableCell>
                          <TableCell className="max-w-md wrap-break-word whitespace-normal min-w-80">
                            {d.descricao}
                          </TableCell>
                          <TableCell>
                            {formatarTexto(d.status || "Em análise")}
                          </TableCell>
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
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cidade e Estado</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {denuncias.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{formatarTexto(d.categoria)}</TableCell>
                        <TableCell>{formatarData(d.data_ocorrencia)}</TableCell>
                        <TableCell className="wrap-break-word whitespace-normal">
                          {d.cidade}, {d.estado}
                        </TableCell>
                        <TableCell className="max-w-xs wrap-break-word whitespace-normal">
                          {d.endereco.length > 50
                            ? d.endereco.slice(0, 50) + "..."
                            : d.endereco}
                        </TableCell>
                        <TableCell className="max-w-md wrap-break-word whitespace-normal min-w-80">
                          {d.descricao}
                        </TableCell>
                        <TableCell>
                          {formatarTexto(d.status || "Em análise")}
                        </TableCell>
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
                  onClick={() => handleCodeSubmit()}
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
