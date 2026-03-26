"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../context/auth-context";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Notification from "../../components/notification";

function gerarCodigoUsuario() {
  const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 8 },
    () => pool[Math.floor(Math.random() * pool.length)],
  ).join("");
}

interface Municipio {
  id: number;
  nome: string;
}

interface Categoria {
  value: string;
  label: string;
}

export default memo(function DenunciaPage() {
  const { userCode, isLogged, login } = useAuth();
  const [form, setForm] = useState({
    categoria: "",
    data: "",
    estado: "",
    cidade: "",
    endereco: "",
    descricao: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [estados, setEstados] = useState<{ id: number; nome: string }[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const router = useRouter();

  const handleCategoriaChange = useCallback((value: string | null) => {
    setForm((prev) => ({ ...prev, categoria: value ?? "" }));
  }, []);

  const handleDataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, data: e.target.value }));
    },
    [],
  );

  const handleEstadoChange = useCallback((value: string | null) => {
    setForm((prev) => ({ ...prev, estado: value ?? "" }));
  }, []);

  const handleCidadeChange = useCallback((value: string | null) => {
    setForm((prev) => ({ ...prev, cidade: value ?? "" }));
  }, []);

  const handleEnderecoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, endereco: e.target.value }));
    },
    [],
  );

  const handleDescricaoChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const words = value.trim().split(/\s+/).filter(Boolean);
      const truncated = words.slice(0, 150).join(" ");
      setForm((prev) => ({
        ...prev,
        descricao: words.length > 150 ? truncated : value,
      }));
    },
    [],
  );

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
        );
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    };
    fetchEstados();
  }, []);

  // Carregar categorias do BD
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/categorias");
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoadingCategorias(false);
      }
    };
    fetchCategorias();
  }, []);

  // Carregar municípios quando estado é selecionado
  useEffect(() => {
    if (form.estado) {
      setLoadingCidades(true);
      const fetchMunicipios = async () => {
        try {
          const estadoSelecionado = estados.find((e) => e.nome === form.estado);
          if (!estadoSelecionado) return;

          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado.id}/municipios`,
          );
          const data = await response.json();
          const sorted = (data as Municipio[]).sort((a, b) =>
            a.nome.localeCompare(b.nome),
          );
          setMunicipios(sorted);
          setForm((s) => ({ ...s, cidade: "" }));
        } catch (error) {
          console.error("Erro ao carregar municípios:", error);
          setMunicipios([]);
        } finally {
          setLoadingCidades(false);
        }
      };
      fetchMunicipios();
    } else {
      setMunicipios([]);
    }
  }, [form.estado, estados]);

  const validar = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!form.categoria) newErrors.categoria = "Selecione o tipo do crime";
    if (!form.data) {
      newErrors.data = "Informe a data do ocorrido";
    } else {
      const dataOcorrencia = new Date(form.data);
      const data1990 = new Date("1990-01-01");
      if (dataOcorrencia < data1990) {
        newErrors.data =
          "A data está preenchida incorretamente ou é muito antiga";
      }
    }
    if (!form.estado) newErrors.estado = "Selecione o estado";
    if (!form.cidade) newErrors.cidade = "Selecione a cidade";
    if (!form.endereco) {
      newErrors.endereco = "Informe o endereço";
    } else if (form.endereco.length < 20) {
      newErrors.endereco = "O endereço deve ter pelo menos 20 caracteres";
    }

    const wordCount = form.descricao.trim().split(/\s+/).filter(Boolean).length;
    if (!form.descricao) {
      newErrors.descricao = "Descreva o crime";
    } else if (wordCount < 15) {
      newErrors.descricao = "A descrição deve ter pelo menos 15 palavras";
    } else if (wordCount > 150) {
      newErrors.descricao = "A descrição deve ter no máximo 150 palavras";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const wordCount = useMemo(() => {
    return form.descricao.trim().split(/\s+/).filter(Boolean).length;
  }, [form.descricao]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validar()) {
      setNotification({
        type: "error",
        title: "Erro no formulário",
        message:
          "Há campos inválidos ou incompletos. Corrija e tente novamente.",
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    let codeToUse = userCode;
    if (!isLogged || !codeToUse) {
      codeToUse = gerarCodigoUsuario();
      login(codeToUse);
    }

    try {
      // Registrar usuário no DB (idempotente)
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToUse }),
      });

      // Submeter denúncia
      const response = await fetch("/api/denuncia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_codigo: codeToUse,
          categoria: form.categoria,
          data_ocorrencia: form.data,
          estado: form.estado,
          cidade: form.cidade,
          endereco: form.endereco,
          descricao: form.descricao,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao submeter denúncia");
      }

      // redireciona primeiro e exibe toast na home
      sessionStorage.setItem(
        "denunciaNotification",
        JSON.stringify({
          type: "success",
          title: "Denúncia registrada",
          message: `Denúncia enviada com sucesso. Seu código é ${codeToUse}. Guarde este código para acompanhar a situação de sua denúncia.`,
        }),
      );
      router.push("/");

      setForm({
        categoria: "",
        data: "",
        estado: "",
        cidade: "",
        endereco: "",
        descricao: "",
      });
      setErrors({});
    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        title: "Erro",
        message: "Erro ao enviar denúncia. Tente novamente.",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showMakeComplaintButton={false} showCodeButton={!isLogged} />

      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-4xl mx-auto bg-gray-100 rounded-lg p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Fazer Denúncia</h1>

          <Notification notification={notification} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Qual o tipo do crime?
              </label>
              <Select
                value={form.categoria}
                onValueChange={handleCategoriaChange}
              >
                <SelectTrigger
                  className={`${errors.categoria ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10 cursor-pointer w-full`}
                >
                  <SelectValue
                    placeholder={
                      loadingCategorias
                        ? "Carregando..."
                        : "Selecione uma categoria"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-red-600 text-sm">{errors.categoria}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Data de ocorrência
                </label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={handleDataChange}
                  className={`${errors.data ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                />
                {errors.data && (
                  <p className="text-red-600 text-sm">{errors.data}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Estado</label>
                <Select value={form.estado} onValueChange={handleEstadoChange}>
                  <SelectTrigger
                    className={`${errors.estado ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10 cursor-pointer w-full`}
                  >
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.nome}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-red-600 text-sm">{errors.estado}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Cidade {!form.estado && "(selecione o estado primeiro)"}
                </label>
                <Select
                  value={form.cidade}
                  onValueChange={handleCidadeChange}
                  disabled={!form.estado || loadingCidades}
                >
                  <SelectTrigger
                    className={`${errors.cidade ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10 ${
                      form.estado
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"
                    } w-full`}
                  >
                    <SelectValue
                      placeholder={
                        loadingCidades
                          ? "Carregando..."
                          : "Selecione uma cidade"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((municipio) => (
                      <SelectItem key={municipio.id} value={municipio.nome}>
                        {municipio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cidade && (
                  <p className="text-red-600 text-sm">{errors.cidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Endereço {!form.cidade && "(selecione a cidade primeiro)"}
                </label>
                <Input
                  value={form.endereco}
                  onChange={handleEnderecoChange}
                  placeholder="Rua, número, complemento..."
                  disabled={!form.cidade}
                  className={`${errors.endereco ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10 ${
                    form.cidade ? "" : "cursor-not-allowed opacity-50"
                  }`}
                />
                <p className="text-gray-500 text-xs">
                  {form.endereco.length} caracteres
                </p>
                {errors.endereco && (
                  <p className="text-red-600 text-sm">{errors.endereco}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Descrição do crime
              </label>
              <Textarea
                value={form.descricao}
                onChange={handleDescricaoChange}
                placeholder="Descreva o ocorrido, quanto mais detalhes, melhor..."
                className={`${errors.descricao ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                rows={6}
              />
              <p className="text-gray-500 text-xs text-right">
                {wordCount}/150
              </p>
              {errors.descricao && (
                <p className="text-red-600 text-sm">{errors.descricao}</p>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
            >
              Enviar denúncia
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
});
