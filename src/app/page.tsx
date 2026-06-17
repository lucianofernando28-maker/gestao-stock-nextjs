import { cookies } from "next/headers";
import NavBar from "@/components/nav-bar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
   <div className="min-h-screen bg-slate-300 font-sans antialiased flex flex-col">

      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-3xl select-none">
          
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-red-600 mb-3 bg-white/40 px-3 py-1 rounded-full border border-white/20 shadow-sm">
            Painel Geral
          </span>
          
          <h1 className="font-serif font-black text-center text-slate-950 text-6xl sm:text-7xl lg:text-8xl tracking-tighter drop-shadow-sm leading-none mb-2">
            BEM-VINDO
          </h1>
          
          <h2 className="font-serif font-extrabold text-center text-slate-900 text-3xl sm:text-4xl lg:text-5xl tracking-tight uppercase border-t-4 border-slate-950 pt-4 px-6 mt-2">
            SISTEMA DE GESTÃO DE STOCK
          </h2>
          
        </div>

      </main>
    </div>
  );
}