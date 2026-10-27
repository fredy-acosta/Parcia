import * as Crypto from 'expo-crypto';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { products } from '../schema';

export function listProducts() {
  return db.select().from(products);
}

export function createProduct(data: { name: string; quantity: number; price: number }) {
  return db.insert(products).values({
    clientId: Crypto.randomUUID(),
    name: data.name,
    quantity: data.quantity,
    price: data.price,
    updatedAt: new Date(),
  });
}

export function updateProduct(id: number, data: { name: string; quantity: number; price: number }) {
  return db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
}

export function deleteProduct(id: number) {
  return db.delete(products).where(eq(products.id, id));
}

export async function getProductById(id: number) {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0];
}