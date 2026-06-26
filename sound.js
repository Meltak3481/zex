// Düşük gecikmeli ses motoru (Web Audio API).
// Sesler bir kez decode edilip buffer olarak tutulur; tıklamada anında çalar.
// Web Audio yoksa/decode başarısızsa HTML5 Audio'ya düşer.

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

// İsim -> [url, ses seviyesi]
const SOURCES = {
  tap: [sndTap, 0.6],
  tab: [sndTab, 0.5],
  upgrade: [sndUpgrade, 0.7],
  purchase: [sndPurchase, 0.7],
  claim: [sndClaim, 0.75],
  checkin: [sndCheckin, 0.7],
  eggCrack: [sndEggCrack, 0.8],
  eggReward: [sndEggReward, 0.8],
};

let ctx = null;
const buffers = {};    // name -> AudioBuffer (Web Audio)
const fallback = {};   // name -> HTMLAudioElement (yedek)

function getCtx() {
  if (ctx) return ctx;
  const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try { ctx = new AC(); } catch { ctx = null; }
  return ctx;
}

// Tüm sesleri önceden decode et (ilk dokunuşta hazır olsun -> gecikme olmaz)
async function decodeAll() {
  const c = getCtx();
  await Promise.all(Object.entries(SOURCES).map(async ([name, [url]]) => {
    try {
      if (!c) throw new Error('no-webaudio');
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      buffers[name] = await c.decodeAudioData(arr);
    } catch {
      try { const a = new Audio(url); a.preload = 'auto'; fallback[name] = a; } catch {}
    }
  }));
}

if (typeof window !== 'undefined') {
  // Modül yüklenir yüklenmez ön-yükle
  decodeAll();
  // İlk kullanıcı etkileşiminde AudioContext'i aç (tarayıcı autoplay kuralı)
  const onFirst = () => {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    window.removeEventListener('pointerdown', onFirst);
    window.removeEventListener('touchstart', onFirst);
  };
  window.addEventListener('pointerdown', onFirst, { once: true });
  window.addEventListener('touchstart', onFirst, { once: true });
}

function play(name) {
  if (!enabled) return;
  const c = getCtx();
  const conf = SOURCES[name] || [null, 0.7];
  const vol = conf[1];

  // Web Audio yolu (anında, gecikmesiz, üst üste binebilir)
  if (c && buffers[name]) {
    try {
      if (c.state === 'suspended') c.resume().catch(() => {});
      const src = c.createBufferSource();
      src.buffer = buffers[name];
      const g = c.createGain();
      g.gain.value = vol;
      src.connect(g).connect(c.destination);
      src.start(0);
      return;
    } catch {}
  }

  // Yedek: HTML5 Audio (buffer henüz hazır değilse)
  try {
    const a = fallback[name] ? fallback[name].cloneNode() : new Audio(conf[0]);
    a.volume = vol;
    a.play().catch(() => {});
  } catch {}
}

export const sfx = {
  tap() { play('tap'); },
  tab() { play('tab'); },
  upgrade() { play('upgrade'); },
  purchase() { play('purchase'); },
  claim() { play('claim'); },
  checkin() { play('checkin'); },
  eggCrack() { play('eggCrack'); },
  eggReward() { play('eggReward'); },
  fail() { /* sessiz */ },
  swap() { play('claim'); },
  splash() { /* splash sesi yok */ },
};
