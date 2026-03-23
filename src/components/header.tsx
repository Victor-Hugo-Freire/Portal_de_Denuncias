"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import Notification from "./notification";

interface HeaderProps {
  showMakeComplaintButton?: boolean;
  showCodeButton?: boolean;
}

export default function Header({
  showMakeComplaintButton = true,
  showCodeButton = true,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [userCode, setUserCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userCode");
    }
    return null;
  });
  const [isLogged, setIsLogged] = useState(!!userCode);

  useEffect(() => {
    const handler = () => {
      const code = sessionStorage.getItem("userCode");
      setUserCode(code);
      setIsLogged(!!code);
    };
    window.addEventListener("authChange", handler);
    return () => window.removeEventListener("authChange", handler);
  }, []);

  const router = useRouter();

  const handleLogin = async () => {
    if (loginCode.length !== 8) {
      setLoginError("O código deve ter 8 caracteres");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: loginCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Código inválido");
        return;
      }

      sessionStorage.setItem("userCode", loginCode);
      setUserCode(loginCode);
      setIsLogged(true);
      window.dispatchEvent(new CustomEvent("authChange"));
      setDialogOpen(false);
      setLoginCode("");
      setLoginError("");
      setNotification({
        type: "success",
        title: "Login realizado",
        message: "Login efetuado com sucesso.",
      });
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setLoginError("Erro ao conectar ao servidor");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userCode");
    setUserCode(null);
    setIsLogged(false);
    window.dispatchEvent(new CustomEvent("authChange"));
    setDropdownOpen(false);
    setNotification({
      type: "success",
      title: "Logout realizado",
      message: "Você saiu da conta.",
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <header className="w-full h-16 bg-gray-300 flex items-center justify-between px-4">
      <Link
        href="/"
        className="flex items-center gap-0.8 hover:opacity-75 transition"
      >
        <Image src="/icon.svg" alt="Ícone" width={27} height={27} />
        <span className="text-lg font-bold">Portal de Denúncias</span>
      </Link>

      <div className="flex items-center gap-1.5">
        <Notification notification={notification} />
        <button
          onClick={() => router.push("/acompanhar")}
          className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition"
        >
          Acompanhar denúncias
        </button>
        {showMakeComplaintButton && (
          <button
            onClick={() => router.push("/denuncia")}
            className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition"
          >
            Fazer denúncia
          </button>
        )}
        {isLogged ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition"
            >
              {userCode} ▼
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-400 rounded-md shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          showCodeButton && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition">
                Já tem um código?
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Entrar com código</DialogTitle>
                </DialogHeader>
                <p>
                  Insira seu código de 8 caracteres para acessar suas denúncias.
                </p>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="ABC12345"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Entrar
                </button>
              </DialogContent>
            </Dialog>
          )
        )}
      </div>
    </header>
  );
}
