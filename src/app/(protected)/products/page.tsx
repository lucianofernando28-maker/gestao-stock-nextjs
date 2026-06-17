import { searchProducts } from "@/features/products/actions";
import { TableProducts } from "@/components/tabela-products";
import { ModalProduct } from "@/components/modal-product";

export default async function ProdutosPage() {
  const products = await searchProducts();

  return (
    <div className="min-h-screen bg-slate-300">
    
      {/* Conteúdo Principal */}
      <main className=" p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end">
          <ModalProduct mode="create" />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <TableProducts dados={products} />
        </div>
      </main>
    </div>
  );
}