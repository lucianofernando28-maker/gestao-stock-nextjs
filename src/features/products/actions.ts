"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { readProducts, saveProducts, readUsers, saveUsers } from "@/lib/db";
import { Product, PreProduct, User } from "./schema";

// Definição de estados padrão para as Server Actions
export type ActionState = { erro?: string; sucesso?: string } | null;


// AUTENTICAÇÃO 

//Função de login
export async function loginAction(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { erro: "Por favor, preencha todos os campos." };
    }

    const users = await readUsers();
    const userFind = users.find((user) => user.email === email);

    let validPassword = false;
    if (userFind) {
      validPassword = await bcrypt.compare(password, userFind.password);
    }

    if (!userFind || !validPassword) {
      return { erro: "Credenciais inválidas!" };
    }

    const cookieStore = await cookies();
    if (!cookieStore) {
      return { erro: "Erro interno no servidor ao processar cookies de sessão." };
    }

    cookieStore.set("session_token", `user_autenticado_${btoa(email)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutos
      path: "/",
    });

    
    const namePart = userFind.name.trim().split(/\s+/);
    let username = userFind.name.trim(); 

    // Regra: Abrevia se tiver mais de 2 nomes OU se o nome completo for muito longo (ex: maior que 15 caracteres)
    if (namePart.length > 2 || username.length > 20) {
      const firstName = namePart[0];
      const lastName = namePart[namePart.length - 1];
      
      // Se tiver mais nomes, extrai as duas iniciais
      if (namePart.length > 1) {
        username = (firstName[0] + lastName[0]).toUpperCase();
      } else {
        // Se for apenas 1 nome mas for muito longo, mostra apenas as 3 primeiras letras
        username = firstName.slice(0, 3).toUpperCase();
      }
    }

    // Salva o cookie com o texto tratado para o NavBar
    cookieStore.set("user_initials", username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
    });
        
  } catch (error) {
    return { erro: "Ocorreu um erro interno ao tentar iniciar sessão." };
  }

  
  redirect("/");
}

//Função de logout
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  redirect("/login");
}

//Obter usuarios logados atraves de emails
async function getLoggedUser(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token || !token.startsWith("user_autenticado_")) {
    throw new Error("Utilizador não autenticado.");
  }

  // Extrai a parte em Base64 do token e decodifica para obter o e-mail novamente
  const base64Email = token.replace("user_autenticado_", "");
  return atob(base64Email); 
}

//Obter usuario por role
async function getLoggedUserRole(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token || !token.startsWith("user_autenticado_")) {
    throw new Error("Utilizador não autenticado.");
  }

  const base64Email = token.replace("user_autenticado_", "");
  const loggedEmail = atob(base64Email);

  const users = await readUsers();
  const userFind = users.find((user) => user.email === loggedEmail);


  if (!userFind) {
    throw new Error("Utilizador não encontrado no sistema.");
  }

  return userFind.role; 
}

//Função de cadastro de usuario
export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const name = formData.get("name") as string;
    //const role = formData.get("role") as string
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { erro: "Todos os campos (nome, e-mail e senha) são obrigatórios!" };
    }

    const users = await readUsers();

    const userExist = users.find((user) => user.email === email);
    if (userExist) {
      return { erro: "Este e-mail já está cadastrado!" };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordCriptografada = await bcrypt.hash(password, salt);
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name,
      role: "user",
      email: email,
      password: passwordCriptografada
    };

    users.push(newUser);
    await saveUsers(users);

  } catch (error) {
    return { erro: "Erro ao processar o seu registo na base de dados." };
  }

  redirect("/login");
}

// OPERACAO COM PRODUTO
//Função de procurar produtos
export async function searchProducts(): Promise<Product[]> {
  try {
    const loggedRole = await getLoggedUserRole();
    const loggedEmail = await getLoggedUser()
    const allProducts = await readProducts();

    if (loggedRole === "admin") {
      return allProducts;
    }

    return allProducts.filter((p) => p.userId === loggedEmail);
  } catch (error) {
   
    return []; 
  }
}

//Função criar produto
export async function createProduct(data: PreProduct): Promise<ActionState> {
  try {
    const loggedEmail = await getLoggedUser();
    const products = await readProducts();
    
    const duplicateProduct = products.some(
      (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase() && p.userId === loggedEmail
    );

    if (duplicateProduct) {
      return { erro: `O produto "${data.name}" já está registado no seu stock.` };
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: data.name,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      totalPrice: Number(data.stockQuantity) * Number(data.price),
      updateAt: new Date().toLocaleDateString("pt-PT"),
      userId: loggedEmail, 
    };

    products.push(newProduct);
    await saveProducts(products);
    
    revalidatePath("/products");
    revalidatePath("/");
    return { sucesso: "Produto criado com sucesso!" };
  } catch (error) {
    return { erro: "Falha ao criar o produto." };
  }
}

//Atualizar produtos
export async function updateProducts(id: string, data: PreProduct): Promise<ActionState> {
  try {
    const loggedEmail = await getLoggedUser();
    const products = await readProducts();
    
   
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return { erro: "Produto não encontrado." };
    }

    //Verifica se o produto pertence mesmo a quem está a tentar editar
    if (products[index].userId !== loggedEmail) {
      return { erro: "Não tem permissão para alterar este produto!" };
    }

    products[index] = {
      ...products[index],
      name: data.name,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      totalPrice: Number(data.stockQuantity) * Number(data.price),
      updateAt: new Date().toLocaleDateString("pt-PT"),
    };

    await saveProducts(products);
    
    revalidatePath("/products");
    revalidatePath("/");
    return { sucesso: "Produto atualizado com sucesso!" };
  } catch (error) {
    return { erro: "Falha ao atualizar o produto." };
  }
}

//Remover produtos
export async function removeProduct(id: string): Promise<ActionState> {
  try {
    const loggedEmail = await getLoggedUser();
    const products = await readProducts();
    
    const produtoAlvo = products.find((p) => p.id === id);

    if (!produtoAlvo) {
      return { erro: "Produto não encontrado para remoção." };
    }

    
    if (produtoAlvo.userId !== loggedEmail) {
      return { erro: "Não tem permissão para remover este produto!" };
    }

    const productsFiltered = products.filter((p) => !(p.id === id && p.userId === loggedEmail || p.userId==="admin@estoque.com"));
    
    await saveProducts(productsFiltered);
    
    revalidatePath("/products");
    revalidatePath("/");
    return { sucesso: "Produto removido com sucesso!" };
  } catch (error) {
    return { erro: "Falha ao remover o produto." };
  }
}