// Server Actions do Next.js — toda a lógica delegada ao backend Elysia.

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Product, PreProduct } from "./schema";

export type ActionState = { erro?: string; sucesso?: string } | null;

// AUTENTICAÇÃO
// Função auxiliar para decodificar o token JWT e extrair os dados do usuário (como o nome completo)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString());
  } catch {
    return null;
  }
}

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { erro: "Por favor, preencha todos os campos." };
  }

  const { data, status } = await apiFetch<{ message?: string; accessToken?: string }>("/auth/sign-in", {
    method:   "POST",
    body:     { email, password },
    withAuth: false,
  });

  if (status === 401) return { erro: "Email ou senha inválidos." };
  if (!status.toString().startsWith("2")) {
    return { erro: (data as any)?.message ?? "Erro ao iniciar sessão." };
  }

  const cookieStore = await cookies();
  const token = (data as any).accessToken; // Armazena o token
  const tokenPayload = decodeJwt(token);   // Decodifica o payload do token

  // Guardar o access_token como cookie do Next.js (porta 3000)
  // para o apiFetch o poder repassar ao Elysia em pedidos futuros
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   5 * 60,
    path:     "/",
  });

  cookieStore.set("session", "authenticated", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   5 * 60,
    path:     "/",
  });
console.log("TOKEN PAYLOAD:", tokenPayload);
console.log("TOKEN PAYLOAD:", tokenPayload?.name);
  // Guardamos o Nome Completo vindo do token (ou fallback com o início do e-mail caso não exista no token)
  cookieStore.set("user_name", tokenPayload?.name || email.split("@")[0], {
    httpOnly: false, // Permitir que o frontend leia o nome completo se precisar
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   5 * 60,
    path:     "/",
  });

  // Guardamos também o ID do usuário que será necessário para filtrar os produtos na listagem
  cookieStore.set("user_id", tokenPayload?.id || tokenPayload?.sub || "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   5 * 60,
    path:     "/",
  });

  redirect("/");
}


export async function logoutAction(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });

  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_initials");

  redirect("/login");
}

export async function registerAction(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!name || !email || !password) {
		return { erro: "Todos campos são obrigatórios." };
	}

	const { data, status } = await apiFetch<{ message?: string }>(
		"/auth/sign-up",
		{
			method: "POST",
			body: { name, email, password },
			withAuth: false, // registo também não tem token ainda
		}
	);

	// 409 Conflict → email já existe na base de dados
	if (status === 409) return { erro: "Este e-mail já está cadastrado." };

	if (!status.toString().startsWith("2")) {
		return { erro: (data as any)?.message ?? "Erro ao registar." };
	}

	redirect("/login");
}

// PRODUTOS

export async function searchProducts(): Promise<Product[]> {
	// withAuth: true (padrão) — o apiFetch repassa o access_token
	const { data, ok } = await apiFetch<any[]>("/products");

	if (!ok) return [];


	// A função normalizeProduct faz a conversão e calcula os campos em falta.
	return (data ?? []).map(normalizeProduct);
}
export async function createProduct(productData: PreProduct): Promise<ActionState> {
  const { data, status, ok } = await apiFetch<unknown>("/products", {
    method: "POST",
    body: {
      name: productData.name,
      price: Number(productData.price),
      stockQuantity: Number(productData.stockQuantity),
    },
  });

  // LOG TEMPORÁRIO — apagar depois
  console.log("STATUS:", status);
  console.log("OK:", ok);
  console.log("DATA:", JSON.stringify(data));

  if (!status.toString().startsWith("2")) {
    return { erro: "Falha ao criar produto." };
  }

  revalidatePath("/products");
  revalidatePath("/");
  return { sucesso: "Produto criado com sucesso!" };
}

export async function updateProducts(id: string, productData: PreProduct): Promise<ActionState> {
  const { status } = await apiFetch<unknown>(`/products/${id}`, {
    method: "PUT",
    body: {
      name: productData.name,
      price: Number(productData.price),
      stockQuantity: Number(productData.stockQuantity),
    },
  });

  if (status === 404) return { erro: "Produto não encontrado." };
  if (!status.toString().startsWith("2")) {
    return { erro: "Falha ao atualizar produto." };
  }

  revalidatePath("/products");
  revalidatePath("/");
  return { sucesso: "Produto atualizado com sucesso!" };
}

export async function removeProduct(id: string): Promise<ActionState> {
  const { status } = await apiFetch<unknown>(`/products/${id}`, {
    method: "DELETE",
  });

  if (status === 404) return { erro: "Produto não encontrado." };
  if (!status.toString().startsWith("2")) {
    return { erro: "Falha ao remover produto." };
  }

  revalidatePath("/products");
  revalidatePath("/");
  return { sucesso: "Produto removido com sucesso!" };
}

//Adaptar a resposta do backend ao schema do frontend

function normalizeProduct(p: any): Product {
	return {
		id: String(p.id),
		name: p.name,
		price: Number(p.price),
		stockQuantity: Number(p.stockQuantity),
		totalPrice: Number(p.price) * Number(p.stockQuantity),
		updateAt: p.updateAt
			? new Date(p.updateAt).toLocaleDateString("pt-PT")
			: new Date().toLocaleDateString("pt-PT"),
		userId: String(p.userId ?? ""),
		createdByName: p.createdByName ?? "—",
	};
}