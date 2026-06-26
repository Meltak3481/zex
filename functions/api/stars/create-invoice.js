import { validateInitData } from '../../_lib/auth.js';
import { CATALOG } from '../../_lib/catalog.js';

const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { initData, itemId } = await request.json();
    const auth = await validateInitData(initData, env.BOT_TOKEN);
    if (!auth) return json({ error: 'unauthorized' }, 401);

    const item = CATALOG[itemId];
    if (!item) return json({ error: 'bad_item' }, 400);

    // payload <= 128 bayt: {u:userId, i:itemId}
    const payload = JSON.stringify({ u: auth.userId, i: itemId });

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        description: `${item.title} — Zex Network`,
        payload,
        provider_token: '',   // Stars için boş
        currency: 'XTR',
        prices: [{ label: item.title, amount: item.stars }],
      }),
    });
    const data = await res.json();
    if (!data.ok) return json({ error: 'invoice_failed', detail: data.description }, 502);
    return json({ invoiceLink: data.result });
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500);
  }
}
