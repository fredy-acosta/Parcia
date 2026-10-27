import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/client';
import { products } from '../db/schema';

export function useProducts() {
  const { data } = useLiveQuery(db.select().from(products));
  return data ?? [];
}