"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/products/actions";
import Link from "next/link";

export default function LoginPage() {
  // O hook agora recebe a action corrigida. Começamos com null (ou { erro: "" })
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (

    <div className="flex min-h-screen items-center justify-center  bg-slate-300 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl border border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-2">Iniciar Sessão</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Insira as suas credenciais para ter acesso ao SGE ML</p>


        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              name="email"
              type="email"
              required
              defaultValue="aluno@test.com"
              className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Palavra-passe</label>
            <input
              name="password"
              type="password"
              required
              defaultValue="senha123456"
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
            {isPending ? "A entrar..." : "Entrar"}
          </button>
        </form>
<br />
        <p className="text-sm text-slate-500 text-center mb-6">Não está cadastrado? Clique em <Link className=" font-bold text-slate-800 text-center mb-2" href="/register">cadastrar</Link> para cadastrar-se</p>
      </div>
    </div>
     );
}
