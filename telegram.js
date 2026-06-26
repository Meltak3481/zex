// Telegram WebApp SDK güvenli erişim katmanı.
// Tarayıcıda (Telegram dışında) test ederken çökmemesi için tüm çağrılar korumalı.

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#0a0e1a');
    tg.setBackgroundColor?.('#0a0e1a');
    tg.enableClosingConfirmation?.();
  } catch (e) {
    console.warn('Telegram init skipped:', e);
  }
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user ?? null;
}

export function getUserDisplayName() {
  const u = tg?.initDataUnsafe?.user;
  if (!u) return null;
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return name || u.username || null;
}

export function getUserReferralCode() {
  const u = tg?.initDataUnsafe?.user;
  if (u?.id) return 'ZEX' + String(u.id).slice(-6);
  return null;
}

export function closeApp() {
  try { tg?.close?.(); } catch (_) {}
}

export function isInTelegram() {
  return !!tg && !!tg.initData;
}

export function haptic(style = 'light') {
  try { tg?.HapticFeedback?.impactOccurred?.(style); } catch (_) {}
}

export function hapticSuccess() {
  try { tg?.HapticFeedback?.notificationOccurred?.('success'); } catch (_) {}
}

// ===== ÖDEME (Aşama 2 entegrasyonu) =====

// Sunucuya gönderilecek imzalı initData (backend doğrular)
export function getInitData() {
  return tg?.initData || '';
}

// Telegram Stars fatura ekranını aç. cb(status): 'paid'|'cancelled'|'failed'|'pending'
export function openInvoice(url, cb) {
  try {
    if (tg?.openInvoice) tg.openInvoice(url, cb);
    else cb && cb('failed');
  } catch (_) {
    cb && cb('failed');
  }
}
