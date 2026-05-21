"use client";

import { X } from "lucide-react";

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

interface DenunciaDescriptionProps {
  denuncia: Denuncia | null;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (id: number, status: string) => Promise<void>;
  onOpenConfirmDialog?: (currentStatus: string, newStatus: string) => void;
  confirmDialog?: {
    isOpen: boolean;
    denunciaId: number;
    currentStatus: string;
    newStatus: string;
  };
  onConfirmStatusChange?: () => Promise<void>;
  onCancelConfirm?: () => void;
  formatarData: (data: string) => string;
  formatarTexto: (texto: string) => string;
}

export default function DenunciaDescription({
  denuncia,
  onClose,
  isAdmin = false,
  onStatusChange,
  onOpenConfirmDialog,
  confirmDialog,
  onConfirmStatusChange,
  onCancelConfirm,
  formatarData,
  formatarTexto,
}: DenunciaDescriptionProps) {
  if (!denuncia) return null;

  const handleStatusChange = (newStatus: string) => {
    onOpenConfirmDialog?.(denuncia.status || "pendente", newStatus);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <style jsx>{`
        .scrollbar-blue::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-blue::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-blue::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 4px;
        }
        .scrollbar-blue::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
      `}</style>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-blue">
        <div className="sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center p-6">
          <h2 className="text-xl font-bold">Detalhes da Denúncia</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isAdmin && denuncia.usuario_codigo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700">
                Código do Usuário
              </p>
              <p className="text-lg font-mono text-blue-600 mt-1">
                {denuncia.usuario_codigo}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Categoria</p>
              <p className="text-gray-900 mt-1">
                {formatarTexto(denuncia.categoria)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Data</p>
              <p className="text-gray-900 mt-1">
                {formatarData(denuncia.data_ocorrencia)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Cidade</p>
              <p className="text-gray-900 mt-1">{denuncia.cidade}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Estado</p>
              <p className="text-gray-900 mt-1">{denuncia.estado}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Endereço</p>
            <p className="text-gray-900 mt-1">{denuncia.endereco}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Descrição</p>
            <p className="text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">
              {denuncia.descricao}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Status</p>
            {isAdmin ? (
              <select
                value={denuncia.status || "pendente"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition cursor-pointer"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="resolvido">Resolvido</option>
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900">
                {formatarTexto(denuncia.status || "Em análise")}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
