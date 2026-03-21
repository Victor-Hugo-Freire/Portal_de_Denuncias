"use client";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full h-16 bg-gray-300 flex items-center justify-between px-4">
      <div className="flex items-center gap-0.8">
        <Image src="/icon.svg" alt="Ícone" width={27} height={27} />
        <span className="text-lg font-bold">Portal de Denúncias</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition">
          Acompanhar denúncias
        </button>
        <button className="px-3 py-1.5 bg-white text-black rounded-md border border-gray-400 hover:bg-gray-100 transition">
          Fazer denúncia
        </button>
      </div>
    </header>
  );
}
