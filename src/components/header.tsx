"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

interface HeaderProps {
  showMakeComplaintButton?: boolean;
  showCodeButton?: boolean;
  isLoggedIn?: boolean;
}

export default function Header({
  showMakeComplaintButton = true,
  showCodeButton = true,
  isLoggedIn = false,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Lógica de logout: remover cookie, etc.
    console.log("Logout");
    setDropdownOpen(false);
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
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition"
            >
              Conta ▼
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
            <Dialog>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
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
