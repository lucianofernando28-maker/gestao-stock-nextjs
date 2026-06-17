import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Se tentar aceder ao dashboard sem token, vai para o login
  if (pathname.startsWith("/products") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

   // Se tentar aceder ao home sem token, vai para o login
if(pathname === "/" && !token){
  return NextResponse.redirect(new URL("/login", request.url));
}
  // Se já tiver logado e for ao login, vai para os produtos
  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/products/:path*", "/login"],
};