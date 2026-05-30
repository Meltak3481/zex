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
