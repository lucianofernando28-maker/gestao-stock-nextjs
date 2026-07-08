"use client";

import { useTransition, useState } from "react";
import { removeProduct } from "@/features/products/actions";
import { Product } from "@/features/products/schema";
import { ModalProduct } from "./modal-product";
import { Trash, ChevronLeft, ChevronRight } from "lucide-react"; 

import { FeedbackOverlay, FeedbackState } from "./feedback-overlay";

interface TabelaProps {
  dados: Product[];
}

export function TableProducts({ dados }: TabelaProps) {
  const [isPending, startTransition] = useTransition();
  
  // Estadps paginacao e feedback
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const itensPage = 5;

  if (dados.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Nenhum produto em stock de momento. Adicione um novo item!
      </div>
    );
  }

  // Cálculos de paginação
  const totalPage = Math.ceil(dados.length / itensPage);
  const indexLastItem = currentPage * itensPage;
  const indexFirstItem = indexLastItem - itensPage;
  
  const productsPages = dados.slice(indexFirstItem, indexLastItem);

  const nextPage = () => {
    if (currentPage < totalPage) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Função gerenciadora da remoção com captura de resposta da Action
  const handleRemove = (id: string) => {
    startTransition(async () => {
      try {
        const response = await removeProduct(id);
        
        if (response && response.erro) {
          setFeedback({ type: "error", message: response.erro });
        } else if (response && response.sucesso) {
          setFeedback({ type: "success", message: response.sucesso });
          setTimeout(() => setFeedback(null), 1500);
        }
      } catch (error) {
        setFeedback({ type: "error", message: "Erro ao tentar remover o artigo." });
      }
    });
  };

  return (
    <div className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Estrutura da Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-600 text-xs uppercase text-slate-100 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Produto</th>
              <th className="px-6 py-3 text-center">Quantidade</th>
              <th className="px-6 py-3 text-right">Preço Unitário</th>
              <th className="px-6 py-3 text-right">Valor Total</th>
              <th className="px-6 py-3 text-center">Cadastrado por</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {productsPages.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{product.name}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    product.stockQuantity < 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {product.stockQuantity} un
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {product.totalPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center text-xs text-slate-600">{product.createdByName}</td>
                <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                  <ModalProduct mode="edit" productTarget={product} />
                  <button
                    disabled={isPending}
                    onClick={() => handleRemove(product.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer font-medium disabled:text-red-300 transition-colors"
                  >
                    <Trash size={20}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Componentes de paginacao */}
      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200 text-slate-600 text-xs font-medium">
        <div>
          A mostrar <span className="font-semibold">{indexFirstItem + 1}</span> a{" "}
          <span className="font-semibold">
            {indexLastItem > dados.length ? dados.length : indexLastItem}
          </span>{" "}
          de <span className="font-semibold">{dados.length}</span> produtos
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <span className="bg-slate-200/60 text-slate-800 px-3 py-1.5 rounded-md font-bold">
            {currentPage} / {totalPage}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPage}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Seguinte
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <FeedbackOverlay 
        feedback={feedback} 
        onCloseError={() => setFeedback(null)} 
      />
    </div>
  );
}