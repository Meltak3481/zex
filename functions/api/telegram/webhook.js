import { CATALOG } from '../../_lib/catalog.js';
import { addPurchase } from '../../_lib/store.js';

const ok = () => new Response('ok');

async function tg(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Güvenlik: webhook setlenirken verilen secret_token başlığını doğrula
  if (env.WEBHOOK_SECRET) {
    const got = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (got !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  }

  let update;
  try { update = await request.json(); } catch { return ok(); }

  // 1) Pre-checkout: 10 sn içinde onayla (yoksa ödeme iptal olur)
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    let valid = true;
    try { valid = !!CATALOG[JSON.parse(q.invoice_payload).i]; } catch { valid = false; }
    await tg(env, 'answerPreCheckoutQuery', valid
      ? { pre_checkout_query_id: q.id, ok: true }
      : { pre_checkout_query_id: q.id, ok: false, error_message: 'Item unavailable' });
    return ok();
  }

  // 2) Başarılı ödeme: defterimize kaydet (idempotent)
  const sp = update.message?.successful_payment;
  if (sp) {
    try {
      const p = JSON.parse(sp.invoice_payload);
      const item = CATALOG[p.i];
      if (item) {
        await addPurchase(env, String(p.u), {
          chargeId: sp.telegram_payment_charge_id,
          itemId: p.i,
          stars: sp.total_amount,
          ts: Date.now(),
        });
        await tg(env, 'sendMessage', {
          chat_id: update.message.chat.id,
          text: `✅ ${item.title} alındı! Oyuna dönünce hesabına eklenecek.`,
        });
      }
    } catch {}
    return ok();
  }

  return ok();
}
