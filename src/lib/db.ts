import { promises as fs } from "fs";
import path from "path";
import { Product, User } from "@/features/products/schema";

// Caminhos absolutos garantidos pelo process.cwd()
const DB_PRODUCTS_PATH = path.join(process.cwd(), "products_db.json");
const DB_USERS_PATH = path.join(process.cwd(), "users_db.json");


async function existFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    // Se o fs.access falhar, criamos o arquivo imediatamente
    await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function readUsers(): Promise<User[]> {
  await existFile(DB_USERS_PATH);
  
  const conteudo = await fs.readFile(DB_USERS_PATH, "utf-8");
  return JSON.parse(conteudo) as User[];
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(DB_USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}


export async function readProducts(): Promise<Product[]> {
  await existFile(DB_PRODUCTS_PATH);
  
  const conteudo = await fs.readFile(DB_PRODUCTS_PATH, "utf-8");
  return JSON.parse(conteudo) as Product[];
}

export async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(DB_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
}