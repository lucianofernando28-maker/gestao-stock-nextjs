import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import NavBar from "@/components/nav-bar"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Gestão Estoque",
  description: "Gerenciado com Next.js e Bun",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const cookieStore = await cookies();
  
  const tokenSessao = cookieStore.get("session_token")?.value;
  const userInitials = cookieStore.get("user_initials")?.value || "";

  const isAuth = tokenSessao && tokenSessao.startsWith("user_autenticado_");
 //console.log("<<<<<<<<4 ",  userInitials)
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-100 flex flex-col text-slate-900">
        
        {isAuth && <NavBar userName={userInitials} />}
       
        {/* Conteúdo principal das páginas */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}