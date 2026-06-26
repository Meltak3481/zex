import { validateInitData } from '../_lib/auth.js';
import { getUser } from '../_lib/store.js';

const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });

// Kullanıcının satın alma defterini döner (istemci uygulanmamışları işler)
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { initData } = await request.json();
    const auth = await validateInitData(initData, env.BOT_TOKEN);
    if (!auth) return json({ error: 'unauthorized' }, 401);
    const u = await getUser(env, auth.userId);
    return json({ userId: auth.userId, purchases: u.purchases, starsSpent: u.starsSpent });
  } catch (e) {
    return json({ error: 'server_error' }, 500);
  }
}
