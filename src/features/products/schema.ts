export interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  totalPrice: number;
  updateAt: string;
  userId: string;
}


export type PreProduct = Omit<Product, "id" | "totalPrice" | "updateAt"| "userId">;


export interface User {
  id: string;
  name: string;
  role: string
  email: string;
  password: string;
}


export type PreUser = Omit<User, "id" | "role">;