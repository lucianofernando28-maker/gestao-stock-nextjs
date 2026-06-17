"use client";

import { useActionState } from "react";
import { registerAction } from "@/features/products/actions";
import Link from "next/link";

export default function SiginPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-300 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-2">Registro de Usuário</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Preencha o formulário</p>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="Nome completo"
              className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="usuario@dominio.com"
              className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Palavra-passe</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="Palavra passe"
              className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          {state?.erro && (
            <p className="text-sm font-medium text-red-500 text-center">{state.erro}</p>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 p-2.5 font-semibold text-white transition hover:bg-indigo-700 cursor-pointer disabled:bg-indigo-400"
          >
            {isPending ? "A cadastrar..." : "Cadastrar"}
          </button>

          <Link 
            href="/login"
            className={`block w-full text-center rounded-lg bg-red-600 p-2.5 font-semibold text-white transition hover:bg-red-500 ${
              isPending ? "pointer-events-none bg-red-400" : ""
            }`}
          >
            Sair
          </Link>
        </form>
      </div>
    </div>
  );
}