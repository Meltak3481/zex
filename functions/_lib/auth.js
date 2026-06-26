// Telegram initData doğrulama (Cloudflare Pages Functions / Web Crypto).
// Algoritma (resmî): secret = HMAC_SHA256(key="WebAppData", msg=botToken)
//                    geçerli  = HMAC_SHA256(key=secret, msg=dataCheckString) === hash

const enc = new TextEncoder();

async function hmac(keyBytes, msgBytes) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, msgBytes);
  return new Uint8Array(sig);
}
const toHex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');

// initData query string'ini ham (decode edilmiş) olarak güvenli ayrıştır
export async function validateInitData(initData, botToken, maxAgeSec = 86400) {
  if (!initData || !botToken) return null;

  let hash = null;
  const pairs = [];
  for (const part of initData.split('&')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i);
    const v = decodeURIComponent(part.slice(i + 1));
    if (k === 'hash') { hash = v; continue; }
    if (k === 'signature') continue; // 3rd-party imza alanı; HMAC'te kullanılmaz
    pairs.push(`${k}=${v}`);
  }
  if (!hash) return null;
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secret = await hmac(enc.encode('WebAppData'), enc.encode(botToken));
  const computed = toHex(await hmac(secret, enc.encode(dataCheckString)));
  if (computed !== hash) return null;

  // tazelik
  const authPair = pairs.find((p) => p.startsWith('auth_date='));
  const authDate = authPair ? parseInt(authPair.split('=')[1], 10) : 0;
  if (maxAgeSec && authDate && (Date.now() / 1000 - authDate) > maxAgeSec) return null;

  const userPair = pairs.find((p) => p.startsWith('user='));
  let user = null;
  try { user = JSON.parse(userPair.slice(5)); } catch {}
  if (!user || !user.id) return null;

  return { userId: String(user.id), user };
}
