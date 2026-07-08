import { cookies } from "next/headers";

// Lido do .env.local — fallback para dev local
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

type FetchOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	// true  → repassa cookies do browser (rotas protegidas — padrão)
	// false → não envia cookies (login / registo — ainda sem token)
	withAuth?: boolean;
};

export async function apiFetch<T = unknown>(
	path: string,
	opts: FetchOptions = {}
): Promise<{ data: T; status: number; ok: boolean }> {
	const { method = "GET", body, withAuth = true } = opts;

	// Todos os pedidos enviam e esperam JSON
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (withAuth) {
		const cookieStore = await cookies();

		const cookieHeader = cookieStore
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join("; ");

			  // LOG TEMPORÁRIO
    console.log("COOKIES ENVIADOS AO ELYSIA:", cookieHeader);


		if (cookieHeader) {
			headers["Cookie"] = cookieHeader;
		}
	}

	const response = await fetch(`${BACKEND_URL}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,

		cache: "no-store",
	});

	let data: T;
	try {
		data = await response.json();
	} catch {
		data = null as T;
	}

	return { data, status: response.status, ok: response.ok };
}
