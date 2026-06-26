// İstemci ödeme katmanı. Backend: Cloudflare Pages Functions (/api/*).
// Aynı origin olduğundan CORS gerekmez.
import { getInitData, openInvoice } from './telegram.js';

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Stars ile satın al. itemId: 'egg_free' | 'egg_common' | ... | 'boost_0'.. 'boost_8'
// Dönüş: 'paid' | 'cancelled' | 'failed' | 'pending' | 'error'
export async function buyWithStars(itemId) {
  const initData = getInitData();
  if (!initData) return 'error'; // Telegram dışında
  let inv;
  try {
    inv = await apiPost('/api/stars/create-invoice', { initData, itemId });
  } catch {
    return 'error';
  }
  if (!inv || inv.error || !inv.invoiceLink) return 'error';
  return new Promise((resolve) => openInvoice(inv.invoiceLink, (status) => resolve(status)));
}

// Sunucudaki satın alma defterini çek (uygulanmamışları istemci işler)
export async function fetchPurchases() {
  const initData = getInitData();
  if (!initData) return { purchases: [] };
  try {
    return await apiPost('/api/state', { initData });
  } catch {
    return { purchases: [] };
  }
}
