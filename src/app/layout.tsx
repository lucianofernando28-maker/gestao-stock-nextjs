import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import NavBar from "@/components/nav-bar";
import "./globals.css";



export const metadata: Metadata = {
  title:       "Sistema Gestão Estoque",
  description: "App para Sistema Gestão Estoque",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const cookieStore = await cookies();

  const isAuth = !!cookieStore.get("session")?.value;

  // user_initials é escrito pelo loginAction (não-HttpOnly) para o NavBar mostrar
  // as iniciais do utilizador sem precisar de chamar o backend neste layout.
  const userInitials = cookieStore.get("user_name")?.value ?? "";

  return (
    <html
      lang="pt-PT"
      
    >
      <body className="min-h-full bg-slate-100 flex flex-col text-slate-900">

        {/* NavBar só aparece quando o utilizador está autenticado */}
        {isAuth && <NavBar userName={userInitials} />}

        {/* Conteúdo principal renderizado pelas páginas filhas */}
        <main className="flex-1 w-full">
          {children}
        </main>

      </body>
    </html>
  );
}
