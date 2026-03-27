"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
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
  showTrackingButton?: boolean;
}

export default function Header({
  showMakeComplaintButton = true,
  showCodeButton = true,
  showTrackingButton = true,
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

  const router = useRouter();
  const auth = useAuth();
  const { userCode, isLogged, isAdmin } = auth;

  const handleLogin = useCallback(() => {
    if (!loginCode) {
      setLoginError("Informe um código");
      return;
    }

    // Redireciona para acompanhar - AdminPanel fará a validação
    setLoginError("");
    setDialogOpen(false);
    setLoginCode("");
    router.push(`/acompanhar?code=${loginCode}`);
  }, [loginCode, router]);

  const handleLogout = useCallback(() => {
    auth.logout();
    setDropdownOpen(false);
    setNotification({
      type: "success",
      title: "Logout realizado",
      message: "Você saiu da conta.",
    });
    setTimeout(() => setNotification(null), 5000);
  }, [auth]);

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
        {showTrackingButton && (
          <button
            onClick={() => router.push("/acompanhar")}
            className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            Acompanhar denúncias
          </button>
        )}
        {showMakeComplaintButton && (
          <button
            onClick={() => router.push("/denuncia")}
            className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            Fazer denúncia
          </button>
        )}
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            Logout
          </button>
        ) : isLogged ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
            >
              {userCode} ▼
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-400 rounded-md shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          showCodeButton && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer">
                Já tem um código?
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Entrar com código</DialogTitle>
                </DialogHeader>
                <p>Insira seu código (8 caracteres)</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ABC12345"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                    {loginCode.length}
                  </span>
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
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
