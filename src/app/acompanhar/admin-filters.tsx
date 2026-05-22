"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

export interface FilterState {
  dataInicio: string;
  dataFim: string;
  status: string;
  categorias: string[];
}

interface Category {
  value: string;
  label: string;
}

interface AdminFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function AdminFilters({ onFilterChange }: AdminFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dataInicio: "",
    dataFim: "",
    status: "",
    categorias: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categorias");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [onFilterChange],
  );

  const toggleCategory = (categoria: string) => {
    const newCategorias = filters.categorias.includes(categoria)
      ? filters.categorias.filter((c) => c !== categoria)
      : [...filters.categorias, categoria];

    handleFilterChange({
      ...filters,
      categorias: newCategorias,
    });
  };

  const removeCategory = (categoria: string) => {
    handleFilterChange({
      ...filters,
      categorias: filters.categorias.filter((c) => c !== categoria),
    });
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      dataInicio: "",
      dataFim: "",
      status: "",
      categorias: [],
    };
    handleFilterChange(emptyFilters);
    setDropdownOpen(false);
  };

  const hasActiveFilters =
    filters.dataInicio ||
    filters.dataFim ||
    filters.status ||
    filters.categorias.length > 0;

  return (
    <div className="no-print bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) =>
                handleFilterChange({ ...filters, dataInicio: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) =>
                handleFilterChange({ ...filters, dataFim: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorias
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span>
                  {filters.categorias.length === 0
                    ? "Selecionar"
                    : `${filters.categorias.length} selecionada${filters.categorias.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categorias.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="cursor-pointer"
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filters.categorias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.categorias.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {categories.find((c) => c.value === cat)?.label ||
                  cat.charAt(0).toUpperCase() + cat.slice(1)}
                <button
                  onClick={() => removeCategory(cat)}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition text-sm"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>
    </div>
  );
}
