// Telegram WebApp SDK güvenli erişim katmanı.
// Tarayıcıda (Telegram dışında) test ederken çökmemesi için tüm çağrılar korumalı.

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    // Telegram tema rengiyle uyum
    tg.setHeaderColor?.('#0a0e1a');
    tg.setBackgroundColor?.('#0a0e1a');
    tg.enableClosingConfirmation?.();
  } catch (e) {
    console.warn('Telegram init skipped:', e);
  }
}

// Telegram kullanıcısı (Aşama 2'de Firebase auth yerine bunu kullanacağız)
export function getTelegramUser() {
  return tg?.initDataUnsafe?.user ?? null;
}

// Kullanıcının görünen adı (Telegram'dan). Yoksa null.
export function getUserDisplayName() {
  const u = tg?.initDataUnsafe?.user;
  if (!u) return null;
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return name || u.username || null;
}

// Kullanıcının benzersiz referral kodu (Telegram ID'den türetilir)
export function getUserReferralCode() {
  const u = tg?.initDataUnsafe?.user;
  if (u?.id) return 'ZEX' + String(u.id).slice(-6);
  return null;
}

// Mini App'i kapat (Exit butonu)
export function closeApp() {
  try { tg?.close?.(); } catch (_) {}
}

export function isInTelegram() {
  return !!tg && !!tg.initData;
}

// Hafif titreşim/haptik (tap hissini güçlendirir)
export function haptic(style = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred?.(style);
  } catch (_) {}
}

export function hapticSuccess() {
  try {
    tg?.HapticFeedback?.notificationOccurred?.('success');
  } catch (_) {}
}
