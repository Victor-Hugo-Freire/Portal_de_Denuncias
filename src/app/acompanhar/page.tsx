"use client";

import Header from "../../components/header";
import Footer from "../../components/footer";
import Notification from "../../components/notification";
import AdminPanel from "./admin-panel";
import AdminFilters, { FilterState } from "./admin-filters";
import ResponsiveTable from "../../components/responsive-table";
import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const [selectedUserCode, setSelectedUserCode] = useState<string | null>(null);
  const [ignoreQueryCode, setIgnoreQueryCode] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dataInicio: "",
    dataFim: "",
    status: "",
    categorias: [],
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCodeFromQuery = searchParams.get("code") || "";
  const codeFromQuery = ignoreQueryCode ? "" : rawCodeFromQuery;

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
    // Definir título para a página
    document.title = "Acompanhar Denúncias";

    const clearInput = () => setInputCode("");
    window.addEventListener("acompanhardialogopen", clearInput);
    window.addEventListener("acompanhardialogclose", clearInput);

    return () => {
      window.removeEventListener("acompanhardialogopen", clearInput);
      window.removeEventListener("acompanhardialogclose", clearInput);
    };
  }, []);

  // Limpar input quando usuário faz login ou logout
  useEffect(() => {
    if (isLogged || isAdmin) {
      setInputCode("");
    }
  }, [isLogged, isAdmin]);

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

  const getFilteredDenuncias = useCallback(
    (denunciasToFilter: Denuncia[]) => {
      return denunciasToFilter.filter((d) => {
        if (filters.dataInicio) {
          const denunciaDate = new Date(d.data_ocorrencia);
          const filterDate = new Date(filters.dataInicio);
          if (denunciaDate < filterDate) return false;
        }

        if (filters.dataFim) {
          const denunciaDate = new Date(d.data_ocorrencia);
          const filterDate = new Date(filters.dataFim);
          if (denunciaDate > filterDate) return false;
        }

        if (filters.status && d.status !== filters.status) {
          return false;
        }

        if (
          filters.categorias.length > 0 &&
          !filters.categorias.includes(d.categoria)
        ) {
          return false;
        }

        return true;
      });
    },
    [filters],
  );

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

  useEffect(() => {
    if (!isLogged && !isAdmin) {
      setSelectedUserCode(null);
      setDenuncias([]);
      setInputCode("");
    }
  }, [isLogged, isAdmin]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setSelectedUserCode(null);
      setDenuncias([]);
      setInputCode("");
      setIgnoreQueryCode(true);
      router.replace("/acompanhar");
      window.history.replaceState(null, "", "/acompanhar");
    };

    window.addEventListener("authLogout", handleLogoutEvent);
    return () => {
      window.removeEventListener("authLogout", handleLogoutEvent);
    };
  }, [router]);

  useEffect(() => {
    if (ignoreQueryCode && !rawCodeFromQuery) {
      setIgnoreQueryCode(false);
    }
  }, [ignoreQueryCode, rawCodeFromQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            font-size: 12px;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
            overflow: visible;
          }
          th,
          td {
            border: 1px solid #000;
            padding: 4px;
            word-wrap: break-word;
            white-space: normal;
            max-width: none;
          }
          .table-fixed {
            table-layout: auto !important;
            width: 100% !important;
          }
          .max-w-xs,
          .max-w-md,
          .min-w-80 {
            max-width: none !important;
            min-width: auto !important;
          }
          .wrap-break-word {
            word-wrap: break-word;
            white-space: normal;
          }
          body,
          html,
          .min-h-screen,
          main {
            overflow-x: hidden !important;
            overflow: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }
          main {
            padding: 0 !important;
          }
          -webkit-print-color-adjust: exact;
          .table-fixed {
            padding: 0 !important;
            margin: 0 !important;
          }
          th:nth-child(1),
          td:nth-child(1) {
            width: 8%;
          } /* Usuário */
          th:nth-child(2),
          td:nth-child(2) {
            width: 10%;
          } /* Categoria */
          th:nth-child(3),
          td:nth-child(3) {
            width: 8%;
          } /* Data */
          th:nth-child(4),
          td:nth-child(4) {
            width: 15%;
            word-break: break-word;
            font-size: 10px;
          } /* Cidade e Estado */
          th:nth-child(5),
          td:nth-child(5) {
            width: 25%;
          } /* Endereço */
          th:nth-child(6),
          td:nth-child(6) {
            width: 30%;
          } /* Descrição */
          th:nth-child(7),
          td:nth-child(7) {
            width: 12%;
          } /* Status */
          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>
      <div className="no-print">
        <Header
          showMakeComplaintButton={!isAdmin}
          showCodeButton={true}
          showTrackingButton={false}
        />
      </div>
      <AdminPanel
        inputCode={codeFromQuery}
        onLoginSuccess={(code) => {
          login(code);
          setSelectedUserCode(null);
          setNotification({
            type: "success",
            title: "Login realizado",
            message: "Login efetuado com sucesso.",
          });
          setTimeout(() => setNotification(null), 5000);
        }}
        onAdminSuccess={(adminDenuncias) => {
          setDenuncias(adminDenuncias);
          setSelectedUserCode(null);
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
          <h1 className="text-3xl font-bold mb-6 no-print">
            Acompanhar Denúncias
          </h1>
          {!mounted ? (
            <div className="space-y-4">
              <p>Carregando...</p>
            </div>
          ) : isAdmin ? (
            <>
              <AdminFilters onFilterChange={setFilters} />
              {selectedUserCode && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Mostrando denúncias do usuário:{" "}
                    <strong>{selectedUserCode}</strong>
                  </p>
                </div>
              )}
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <>
                  <ResponsiveTable
                    denuncias={getFilteredDenuncias(
                      selectedUserCode
                        ? denuncias.filter(
                            (d) => d.usuario_codigo === selectedUserCode,
                          )
                        : denuncias,
                    ).sort((a, b) =>
                      (a.usuario_codigo || "").localeCompare(
                        b.usuario_codigo || "",
                      ),
                    )}
                    isAdmin={true}
                    onUserClick={(code) =>
                      setSelectedUserCode(
                        selectedUserCode === code ? null : code,
                      )
                    }
                    selectedUserCode={selectedUserCode}
                    formatarData={formatarData}
                    formatarTexto={formatarTexto}
                  />
                  {(filters.dataInicio ||
                    filters.dataFim ||
                    filters.status ||
                    filters.categorias.length > 0) && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700 no-print">
                      <strong>Filtros aplicados:</strong>{" "}
                      {filters.dataInicio && (
                        <span>
                          Data inicial:{" "}
                          {new Date(filters.dataInicio).toLocaleDateString(
                            "pt-BR",
                          )}
                          {" | "}
                        </span>
                      )}
                      {filters.dataFim && (
                        <span>
                          Data final:{" "}
                          {new Date(filters.dataFim).toLocaleDateString(
                            "pt-BR",
                          )}
                          {" | "}
                        </span>
                      )}
                      {filters.status && (
                        <span>
                          Status: {formatarTexto(filters.status)}
                          {" | "}
                        </span>
                      )}
                      {filters.categorias.length > 0 && (
                        <span>
                          Categorias:{" "}
                          {filters.categorias
                            .map((c) => formatarTexto(c))
                            .join(", ")}
                          {" | "}
                        </span>
                      )}
                      {selectedUserCode && (
                        <span>Usuário: {selectedUserCode}</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p>Nenhuma denúncia encontrada.</p>
              )}
            </>
          ) : isLogged ? (
            <>
              {loading ? (
                <p>Carregando...</p>
              ) : denuncias.length > 0 ? (
                <ResponsiveTable
                  denuncias={denuncias}
                  isAdmin={false}
                  formatarData={formatarData}
                  formatarTexto={formatarTexto}
                />
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
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ABC12345"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                    {inputCode.length}
                  </span>
                </div>
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
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
});

export default AcompanharPage;
