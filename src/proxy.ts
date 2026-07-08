// src/proxy.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
/*
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/products/:path*", "/login"],
};*/


export function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/products") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/products/:path*", "/login"],
};

