import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { products } from '../db/schema';
import { supabase } from '../lib/supabase';

export async function syncProducts(userId: string) {
  let subidos = 0;
  let bajados = 0;

  // 1. Bajar
  const { data: remotos, error } = await supabase.from('products').select('*');
  if (error) throw new Error(error.message);

  const locales = await db.select().from(products);
  const clientIdsLocales = new Set(locales.map((p) => p.clientId));

  for (const r of remotos ?? []) {
    if (!clientIdsLocales.has(r.client_id)) {
      await db.insert(products).values({
        clientId: r.client_id,
        name: r.name,
        quantity: r.quantity,
        price: r.price,
        updatedAt: new Date(r.updated_at),
        syncedAt: new Date(r.updated_at),
      });
      bajados++;
    }
  }

  // 2. Subir pendientes
  const todosLocales = await db.select().from(products);
  const pendientes = todosLocales.filter((p) => !p.syncedAt || p.syncedAt.getTime() < p.updatedAt.getTime());

  for (const p of pendientes) {
    const { error: upErr } = await supabase.from('products').upsert(
      {
        client_id: p.clientId,
        user_id: userId,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        updated_at: p.updatedAt.toISOString(),
      },
      { onConflict: 'client_id' }
    );
    if (upErr) throw new Error(upErr.message);
    await db.update(products).set({ syncedAt: p.updatedAt }).where(eq(products.id, p.id));
    subidos++;
  }

  return { subidos, bajados };
}