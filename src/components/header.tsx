"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();
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

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setLoginCode("");
      setLoginError("");
    }

    const eventName = open ? "acompanhardialogopen" : "acompanhardialogclose";
    window.dispatchEvent(new Event(eventName));
  };

  const performLogout = useCallback(() => {
    auth.logout();
    window.dispatchEvent(new Event("authLogout"));
    setDropdownOpen(false);
    setNotification({
      type: "success",
      title: "Logout realizado",
      message: "Você saiu da conta.",
    });
    setTimeout(() => setNotification(null), 5000);
    window.history.replaceState(null, "", "/acompanhar");
    router.replace("/acompanhar");
  }, [auth, router]);

  const handleLogout = useCallback(() => {
    if (isAdmin) {
      setLogoutDialogOpen(true);
    } else {
      performLogout();
    }
  }, [isAdmin, performLogout]);

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
        {isAdmin && pathname === "/acompanhar" && (
          <button
            onClick={() => window.print()}
            className="px-2 py-1 bg-blue-500 text-white rounded-md border border-blue-600 hover:bg-blue-600 transition cursor-pointer text-sm"
          >
            Gerar Relatório
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
          <>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
            >
              Logout
            </button>
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar logout</DialogTitle>
                </DialogHeader>
                <p>Você realmente deseja sair da conta de administrador?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setLogoutDialogOpen(false)}
                    className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      performLogout();
                      setLogoutDialogOpen(false);
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Confirmar
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </>
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
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
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
