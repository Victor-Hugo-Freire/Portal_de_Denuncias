"use client";

import { useState, useEffect } from "react";
import DenunciaDescription from "./denuncia-description";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

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

interface TableProps {
  denuncias: Denuncia[];
  isAdmin?: boolean;
  onUserClick?: (code: string) => void;
  onStatusChange?: (id: number, status: string) => Promise<void>;
  selectedUserCode?: string | null;
  formatarData: (data: string) => string;
  formatarTexto: (texto: string) => string;
}

const ITEMS_PER_PAGE = 10;

export default function ResponsiveTable({
  denuncias,
  isAdmin = false,
  onUserClick,
  onStatusChange,
  selectedUserCode,
  formatarData,
  formatarTexto,
}: TableProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    denunciaId: number;
    currentStatus: string;
    newStatus: string;
  }>({
    isOpen: false,
    denunciaId: 0,
    currentStatus: "",
    newStatus: "",
  });

  // Resetar para página 1 quando selectedUserCode muda ou denúncias mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserCode, denuncias.length]);

  const handleConfirmStatusChange = async () => {
    if (!onStatusChange) return;
    await onStatusChange(confirmDialog.denunciaId, confirmDialog.newStatus);
    setSelectedDenuncia((prev) =>
      prev && prev.id === confirmDialog.denunciaId
        ? { ...prev, status: confirmDialog.newStatus }
        : prev,
    );
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleCellHover = (e: React.MouseEvent) => {
    const tableElement = (e.target as HTMLElement).closest("table");
    if (tableElement) {
      const tableRect = tableElement.getBoundingClientRect();
      setTooltipPosition({ x: tableRect.left, y: tableRect.top });
      setShowTooltip(true);
    }
  };

  const handleCellLeave = () => {
    setShowTooltip(false);
  };

  const totalPages = Math.ceil(denuncias.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDenuncias = denuncias.slice(startIndex, endIndex);
  const shouldShowPagination = denuncias.length > ITEMS_PER_PAGE;

  if (denuncias.length === 0) {
    return (
      <p className="text-center text-gray-600 py-4">
        {isAdmin
          ? "Nenhuma denúncia encontrada."
          : "Você ainda não fez nenhuma denúncia."}
      </p>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto relative">
        {showTooltip && (
          <div
            className="fixed bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium pointer-events-none z-50"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
            }}
          >
            Ver detalhes
          </div>
        )}

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Usuário</TableHead>}
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDenuncias.map((d) => (
              <TableRow
                key={d.id}
                className={`cursor-pointer hover:bg-blue-100 transition ${
                  isAdmin && selectedUserCode === d.usuario_codigo
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedDenuncia(d)}
              >
                {isAdmin && (
                  <TableCell
                    className="font-mono text-sm hover:bg-gray-100 cursor-pointer font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick?.(d.usuario_codigo || "");
                    }}
                  >
                    {d.usuario_codigo}
                  </TableCell>
                )}
                <TableCell
                  className="text-sm"
                  onMouseEnter={handleCellHover}
                  onMouseLeave={handleCellLeave}
                >
                  {formatarTexto(d.categoria)}
                </TableCell>
                <TableCell
                  className="text-sm"
                  onMouseEnter={handleCellHover}
                  onMouseLeave={handleCellLeave}
                >
                  {formatarData(d.data_ocorrencia)}
                </TableCell>
                <TableCell
                  className="text-sm"
                  onMouseEnter={handleCellHover}
                  onMouseLeave={handleCellLeave}
                >
                  {d.cidade}, {d.estado}
                </TableCell>
                <TableCell
                  className="text-sm"
                  onMouseEnter={handleCellHover}
                  onMouseLeave={handleCellLeave}
                >
                  {d.endereco.length > 40
                    ? d.endereco.slice(0, 40) + "..."
                    : d.endereco}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {formatarTexto(d.status || "Em análise")}
                  </span>
                </TableCell>
                <TableCell
                  className="text-sm"
                  onMouseEnter={handleCellHover}
                  onMouseLeave={handleCellLeave}
                >
                  {d.descricao.length > 50
                    ? d.descricao.slice(0, 50) + "..."
                    : d.descricao}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {shouldShowPagination && (
          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            <div className="text-sm font-medium w-8 text-center">
              {currentPage}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-3">
        {currentDenuncias.map((d) => (
          <div
            key={d.id}
            className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
          >
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {isAdmin && (
                  <div
                    className="font-mono text-sm font-bold text-blue-600 mb-1 cursor-pointer hover:text-blue-800"
                    onClick={() => onUserClick?.(d.usuario_codigo || "")}
                  >
                    {d.usuario_codigo}
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-800">
                  {formatarTexto(d.categoria)}
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                {formatarTexto(d.status || "Em análise")}
              </span>
            </div>

            {/* Informações Principais */}
            <div className="space-y-2 mb-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-600">Data:</span>
                <span className="text-gray-800">
                  {formatarData(d.data_ocorrencia)}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-600">Local:</span>
                <span className="text-gray-800 text-right">
                  {d.cidade}, {d.estado}
                </span>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-600">Endereço:</span>
                <p className="text-gray-800 mt-1 text-xs">{d.endereco}</p>
              </div>
            </div>

            {/* Descrição com Expandir */}
            <div>
              <span className="font-medium text-gray-600 text-sm">
                Descrição:
              </span>
              <p
                onClick={() => setSelectedDenuncia(d)}
                className="text-gray-700 text-sm mt-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition"
              >
                {d.descricao}
              </p>
              <button
                onClick={() => setSelectedDenuncia(d)}
                className="text-blue-500 text-xs font-medium mt-2 hover:text-blue-700"
              >
                Ver todos os detalhes
              </button>
            </div>
          </div>
        ))}

        {shouldShowPagination && (
          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            <div className="text-sm font-medium w-8 text-center">
              {currentPage}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>

      <DenunciaDescription
        denuncia={selectedDenuncia}
        onClose={() => setSelectedDenuncia(null)}
        isAdmin={isAdmin}
        onStatusChange={onStatusChange}
        onOpenConfirmDialog={(currentStatus, newStatus) => {
          setConfirmDialog({
            isOpen: true,
            denunciaId: selectedDenuncia?.id || 0,
            currentStatus,
            newStatus,
          });
        }}
        confirmDialog={confirmDialog}
        onConfirmStatusChange={handleConfirmStatusChange}
        onCancelConfirm={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
        formatarData={formatarData}
        formatarTexto={formatarTexto}
      />

      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar mudança de status</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Deseja mudar o status de{" "}
            <span className="font-semibold">
              {formatarTexto(confirmDialog.currentStatus)}
            </span>{" "}
            para{" "}
            <span className="font-semibold">
              {formatarTexto(confirmDialog.newStatus)}
            </span>
            ?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, isOpen: false })
              }
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmStatusChange}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
