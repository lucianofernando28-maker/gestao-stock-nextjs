"use client";

import Image from 'next/image';
import logoImg from "../../public/ml-logo.webp";
import { logoutAction } from '@/features/products/actions';
import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface NavBarProps {
  userName?: string; // Recebe o nome ou iniciais tratadas vindas do Layout (Server Component)
}

const NavBar = ({ userName }: NavBarProps) => {
  const pathname = usePathname();

  // Funções simples para verificar qual rota está ativa
  const isInicioAtivo = pathname === "/";
  const isProdutosAtivo = pathname.startsWith("/products");
//
  return (
    <div className="bg-[#055adafd] border-b border-slate-300 px-6 py-4 flex justify-between items-center shadow-md">

      <div className="flex items-center gap-4">
        <div className="w-[100px]">
          <Image
            className="w-full h-auto"
            src={logoImg}
            alt="Logo da ML"
            width={100}
            height={40}
            priority
          />
        </div>


        {userName && (
          <span className="text-sm font-semibold bg-white/10 text-white px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 select-none">
            {/* Indicador de status online ativo */}
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>

            <UserIcon size={16} className="text-slate-200" />

            <span>{userName.toUpperCase()}</span>
          </span>
        )}
      </div>

      {/* Menu de Navegação */}
      <nav className="font-bold">
        <ul className="flex gap-6 items-center h-full">
          {/* Aba: Início */}
          <li className="relative py-2">
            <Link
              href="/"
              className={`transition-colors duration-200 pb-4 ${
                isInicioAtivo
                  ? "text-white border-b-2 border-red-600 font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Início
            </Link>
          </li>

          {/* Aba: Produtos */}
          <li className="relative py-2">
            <Link
              href="/products"
              className={`transition-colors duration-200 pb-4 ${
                isProdutosAtivo
                  ? "text-white border-b-2 border-red-600 font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Produtos
            </Link>
          </li>

          {/* Botão de Logout */}
          <li className="flex items-center justify-center pl-2">
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair do sistema"
                className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
              >
                <LogOut size={24} color="white" />
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
