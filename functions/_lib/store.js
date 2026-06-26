// Cloudflare KV tabanlı satın alma defteri.
// Anahtar: user:<id> -> { purchases:[{chargeId,itemId,stars,ts}], starsSpent }
// charge_id ile idempotent (aynı ödeme iki kez işlenmez).

export async function getUser(env, userId) {
  const raw = await env.ZEX_KV.get(`user:${userId}`);
  if (!raw) return { purchases: [], starsSpent: 0 };
  try { return JSON.parse(raw); } catch { return { purchases: [], starsSpent: 0 }; }
}

export async function addPurchase(env, userId, entry) {
  const u = await getUser(env, userId);
  if (u.purchases.some((p) => p.chargeId === entry.chargeId)) return u; // zaten işlendi
  u.purchases.push(entry);
  u.starsSpent = (u.starsSpent || 0) + (entry.stars || 0);
  if (u.purchases.length > 300) u.purchases = u.purchases.slice(-300);
  await env.ZEX_KV.put(`user:${userId}`, JSON.stringify(u));
  return u;
}
