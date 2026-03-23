"use client";

import { useState } from "react";
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

export default function DenunciaPage() {
  const [userCode, setUserCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userCode");
    }
    return null;
  });
  const [isLogged, setIsLogged] = useState(!!userCode);
  const [form, setForm] = useState({
    categoria: "",
    data: "",
    estado: "",
    cidade: "",
    bairro: "",
    descricao: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const router = useRouter();

  const validar = () => {
    const newErrors: Record<string, string> = {};

    if (!form.categoria) newErrors.categoria = "Selecione o tipo do crime";
    if (!form.data) newErrors.data = "Informe a data do ocorrido";
    if (!form.estado) newErrors.estado = "Informe o estado";
    if (!form.cidade) newErrors.cidade = "Informe a cidade";
    if (!form.bairro) newErrors.bairro = "Informe o bairro";

    const wordCount = form.descricao.trim().split(/\s+/).filter(Boolean).length;
    if (!form.descricao) {
      newErrors.descricao = "Descreva o crime";
    } else if (wordCount > 150) {
      newErrors.descricao = "A descrição deve ter no máximo 150 palavras";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validar()) {
      setNotification({
        type: "error",
        title: "Erro no formulário",
        message:
          "Há campos inválidos ou incompletos. Corrija e tente novamente.",
      });
      return;
    }

    let codeToUse = userCode;
    if (!isLogged || !codeToUse) {
      codeToUse = gerarCodigoUsuario();
      setUserCode(codeToUse);
      setIsLogged(true);
      window.dispatchEvent(new CustomEvent("authChange"));
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
          bairro: form.bairro,
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
        bairro: "",
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
                onValueChange={(value) =>
                  setForm((s) => ({ ...s, categoria: value ?? "" }))
                }
              >
                <SelectTrigger
                  className={`${errors.categoria ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrupcao">Corrupção</SelectItem>
                  <SelectItem value="abuso">Abuso de poder</SelectItem>
                  <SelectItem value="fraude">Fraude</SelectItem>
                  <SelectItem value="discriminacao">Discriminação</SelectItem>
                  <SelectItem value="ambiental">Violação ambiental</SelectItem>
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
                  onChange={(e) =>
                    setForm((s) => ({ ...s, data: e.target.value }))
                  }
                  className={`${errors.data ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                />
                {errors.data && (
                  <p className="text-red-600 text-sm">{errors.data}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Estado</label>
                <Input
                  value={form.estado}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, estado: e.target.value }))
                  }
                  placeholder="Ex: São Paulo"
                  className={`${errors.estado ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                />
                {errors.estado && (
                  <p className="text-red-600 text-sm">{errors.estado}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Cidade</label>
                <Input
                  value={form.cidade}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, cidade: e.target.value }))
                  }
                  placeholder="Ex: Campinas"
                  className={`${errors.cidade ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                />
                {errors.cidade && (
                  <p className="text-red-600 text-sm">{errors.cidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bairro</label>
                <Input
                  value={form.bairro}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, bairro: e.target.value }))
                  }
                  placeholder="Ex: Centro"
                  className={`${errors.bairro ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                />
                {errors.bairro && (
                  <p className="text-red-600 text-sm">{errors.bairro}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Descrição do crime
              </label>
              <Textarea
                value={form.descricao}
                onChange={(e) => {
                  const value = e.target.value;
                  const words = value.trim().split(/\s+/).filter(Boolean);
                  const truncated = words.slice(0, 150).join(" ");

                  setForm((s) => ({
                    ...s,
                    descricao: words.length > 150 ? truncated : value,
                  }));
                }}
                placeholder="Descreva o ocorrido, quanto mais detalhes, melhor..."
                className={`${errors.descricao ? "border-red-500" : "border-gray-400"} border-2 focus:border-black focus:ring-2 focus:ring-black/10`}
                rows={6}
              />
              <p className="text-gray-500 text-xs">
                {form.descricao.trim().split(/\s+/).filter(Boolean).length} /
                150 palavras
              </p>
              {errors.descricao && (
                <p className="text-red-600 text-sm">{errors.descricao}</p>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Enviar denúncia
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
