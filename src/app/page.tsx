"use client";
import Header from "../components/header";
import Footer from "../components/footer";
import Notification from "../components/notification";
import { useState, useEffect, memo } from "react";
import { useAuth } from "../context/auth-context";

const Home = memo(function Home() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Verificar se há notificação salva no sessionStorage
    const saved = window.sessionStorage.getItem("denunciaNotification");
    if (saved) {
      const parsed = JSON.parse(saved) as {
        type: "success" | "error";
        title: string;
        message: string;
      };
      setToast(parsed);
      window.sessionStorage.removeItem("denunciaNotification");
    }
    // Definir título da página
    document.title = "Portal de Denúncias";
  }, []);

  useEffect(() => {
    const handler = () => {};
    window.addEventListener("authChange", handler);
    return () => window.removeEventListener("authChange", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showMakeComplaintButton={!isAdmin} showCodeButton={true} />
      {mounted && toast ? <Notification notification={toast} /> : null}
      <main className="flex-1 text-black px-4 py-6">
        <div className="max-w-4xl mx-auto bg-gray-300 rounded-lg p-8 space-y-4">
          <p className="text-xl text-center font-bold">
            Bem-vindo ao Portal de Denúncias, uma plataforma segura e anônima
            para relatar irregularidades e promover a transparência.
          </p>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Importante:</strong> Ao fazer uma denúncia, você
                  receberá um código único de 8 caracteres. Guarde este código
                  com segurança! Ele é essencial para acompanhar o status da sua
                  denúncia posteriormente. Sem ele, você não poderá verificar se
                  sua denúncia foi processada.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold">Como Usar?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Clique em &quot;Fazer denúncia&quot; no header para iniciar o
              processo.
            </li>
            <li>Preencha os detalhes da denúncia de forma anônima.</li>
            <li>
              Após enviar, você receberá um código único de 8 caracteres.{" "}
              <strong>Guarde este código!</strong>
            </li>
            <li>
              Use &quot;Acompanhar denúncias&quot; e digite seu código para
              verificar o status da sua denúncia.
            </li>
            <li>
              Você será automaticamente redirecionado para acompanhar suas
              denúncias após o envio.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold">Objetivo do Sistema</h2>
          <p>
            O objetivo deste portal é fornecer um canal seguro e confidencial
            para cidadãos reportarem atividades suspeitas, corrupção, violações
            éticas ou qualquer irregularidade que afete a sociedade. Garantimos
            anonimato e proteção aos denunciantes.
          </p>

          <h2 className="text-2xl font-semibold">O que pode ser denunciado?</h2>
          <p>
            Você pode denunciar uma ampla gama de irregularidades, incluindo
            corrupção, abuso de poder, violações ambientais, discriminação,
            fraudes e outras práticas ilícitas. Todas as denúncias são tratadas
            com seriedade e confidencialidade.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default Home;
