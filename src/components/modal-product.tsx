"use client";

import { useState } from "react";
import { createProduct, updateProducts } from "@/features/products/actions";
import { Product } from "@/features/products/schema";
import { Edit } from "lucide-react";
import { FeedbackOverlay, FeedbackState } from "./feedback-overlay";

interface ModalProps {
  mode: "create" | "edit";
  productTarget?: Product;
}

export function ModalProduct({ mode, productTarget }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado do feedback 
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const dados = {
      name: formData.get("name") as string,
      stockQuantity: Number(formData.get("stockQuantity")),
      price: Number(formData.get("price")),
    };

    try {
      let response;
      if (mode === "create") {
        response = await createProduct(dados);
      } else if (mode === "edit" && productTarget) {
        response = await updateProducts(productTarget.id, dados);
      }

      // Mostra a mensagem de erro retornada pela action
      if (response && response.erro) {
        setFeedback({ type: "error", message: response.erro });
        setLoading(false);
        return;
      }

      // Mostra a mensagem de sucesso retornada dinamicamente pela action
      if (response && response.sucesso) {
        setFeedback({ 
          type: "success", 
          message: response.sucesso 
        });
      }

      setTimeout(() => {
        setFeedback(null);
        setIsOpen(false);
      }, 1500);

    } catch (error) {
      setFeedback({ type: "error", message: "Erro de comunicação com o servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {mode === "create" ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-900 cursor-pointer transition"
        >
          + Adicionar Produto
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-indigo-600 hover:text-indigo-900 cursor-pointer font-medium mr-3"
        >
          <Edit size={20} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-slate-300 p-6 shadow-2xl text-slate-900 relative overflow-hidden">
            <h3 className="text-lg font-bold mb-4 text-slate-800">
              {mode === "create" ? "Novo Produto" : `Editar: ${productTarget?.name}`}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Nome do Artigo</label>
                <input name="name" type="text" required defaultValue={productTarget?.name || ""} className="w-full rounded-lg border border-white p-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Quantidade</label>
                  <input name="stockQuantity" type="number" min="0" required defaultValue={productTarget?.stockQuantity ?? ""} className="w-full rounded-lg border border-white p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Preço (AKZ)</label>
                  <input name="price" type="number" step="0.01" min="0" required defaultValue={productTarget?.price ?? ""} className="w-full rounded-lg border border-white p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                  {loading ? "A guardar..." : "Guardar"}
                </button>
              </div>
            </form>

            <FeedbackOverlay 
              feedback={feedback} 
              onCloseError={() => setFeedback(null)} 
            />

          </div>
        </div>
      )}
    </>
  );
}