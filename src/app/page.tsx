"use client";
import Header from "../components/header";
import Footer from "../components/footer";
import Notification from "../components/notification";
import { useState, useEffect, memo } from "react";

const Home = memo(function Home() {
  const [toast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.sessionStorage.getItem("denunciaNotification");
    if (!saved) return null;
    const parsed = JSON.parse(saved) as {
      type: "success" | "error";
      title: string;
      message: string;
    };
    window.sessionStorage.removeItem("denunciaNotification");
    return parsed;
  });

  const [userCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userCode");
    }
    return null;
  });

  useEffect(() => {
    const handler = () => {
      // O estado é gerenciado pelo contexto
    };
    window.addEventListener("authChange", handler);
    return () => window.removeEventListener("authChange", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showMakeComplaintButton={true} showCodeButton={true} />
      {toast ? <Notification notification={toast} /> : null}
      <main className="flex-1 text-black px-4 py-6">
        <div className="max-w-4xl mx-auto bg-gray-300 rounded-lg p-8 space-y-4">
          <p className="text-xl text-center font-bold">
            Bem-vindo ao Portal de Denúncias, uma plataforma segura e anônima
            para relatar irregularidades e promover a transparência.
          </p>

          <h2 className="text-2xl font-semibold">Como Usar?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Clique em &quot;Fazer denúncia&quot; no header para iniciar o
              processo.
            </li>
            <li>Preencha os detalhes da denúncia de forma anônima.</li>
            <li>
              Envie a denúncia, que será analisada pelas autoridades
              competentes.
            </li>
            <li>
              Use &quot;Acompanhar denúncias&quot; para verificar o status, se
              aplicável.
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
