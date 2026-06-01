// Gerçek ses dosyalarını çalan ses motoru (MP3, kullanıcının yüklediği sesler).
// Her ses için bir Audio havuzu (üst üste çalabilsin diye klonlanır).

import sndTap from './snd_tap.mp3';
import sndTab from './snd_tab.mp3';
import sndUpgrade from './snd_upgrade.mp3';
import sndPurchase from './snd_purchase.mp3';
import sndClaim from './snd_claim.mp3';
import sndCheckin from './snd_checkin.mp3';
import sndEggCrack from './snd_eggcrack.mp3';
import sndEggReward from './snd_eggreward.mp3';

let enabled = true;

export function setSoundEnabled(v) {
  enabled = v;
  try { localStorage.setItem('zex_sound', v ? '1' : '0'); } catch {}
}
export function isSoundEnabled() {
  try {
    const s = localStorage.getItem('zex_sound');
    if (s !== null) enabled = s === '1';
  } catch {}
  return enabled;
}

// Her ses için bir Audio nesnesi; çalarken klonlayarak üst üste binmeye izin ver
function makePlayer(src, volume = 0.7) {
  const base = new Audio(src);
  base.preload = 'auto';
  base.volume = volume;
  return () => {
    if (!enabled) return;
    try {
      // Kısa sesler için klon (hızlı tıklamada kesilmesin)
      const a = base.cloneNode();
      a.volume = volume;
      a.play().catch(() => {});
    } catch {}
  };
}

const players = {
  tap: makePlayer(sndTap, 0.6),
  tab: makePlayer(sndTab, 0.5),
  upgrade: makePlayer(sndUpgrade, 0.7),
  purchase: makePlayer(sndPurchase, 0.7),
  claim: makePlayer(sndClaim, 0.75),
  checkin: makePlayer(sndCheckin, 0.7),
  eggCrack: makePlayer(sndEggCrack, 0.8),
  eggReward: makePlayer(sndEggReward, 0.8),
};

export const sfx = {
  tap() { players.tap(); },
  tab() { players.tab(); },
  upgrade() { players.upgrade(); },
  purchase() { players.purchase(); },
  claim() { players.claim(); },
  checkin() { players.checkin(); },
  eggCrack() { players.eggCrack(); },
  eggReward() { players.eggReward(); },
  // Koddan üretilenler kaldırıldı; bunlar artık gerçek dosya yok -> sessiz/eşlenik
  fail() { /* enerji bitti sesi yok; istenirse eklenir */ },
  swap() { players.claim(); },   // swap için claim sesini kullan (ya da ayrı yüklenebilir)
  splash() { /* splash sesi yok; ilk dokunuşta zaten ses açılır */ },
};
