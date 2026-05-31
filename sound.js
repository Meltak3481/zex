// Web Audio API ile koddan üretilen ses motoru.
// Dosya yok; tüm sesler sentezlenir. Tek bir AudioContext paylaşılır.

let ctx = null;
let enabled = true;
let masterGain = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  // iOS/Telegram: ilk dokunuşta context'i uyandır
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

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

// Tek bir osilatör notası (zarflı: hızlı attack, yumuşak decay)
function note(freq, start, dur, { type = 'sine', vol = 0.3, slideTo = null } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  // ADSR benzeri zarf
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Kısa gürültü patlaması (çatlama, vurgu için)
function noise(start, dur, { vol = 0.2, filterFreq = 2000 } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const bufferSize = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter); filter.connect(g); g.connect(masterGain);
  src.start(t0);
  src.stop(t0 + dur);
}

// ===== Oyun sesleri =====

export const sfx = {
  // Tap: kısa parlak pop. pitch parametresi boost'a göre tonu değiştirir.
  tap(pitch = 1) {
    if (!enabled) return;
    note(620 * pitch, 0, 0.09, { type: 'triangle', vol: 0.22, slideTo: 880 * pitch });
  },

  // Enerji bitti / geçersiz: boğuk düşük ton
  fail() {
    if (!enabled) return;
    note(180, 0, 0.14, { type: 'sawtooth', vol: 0.16, slideTo: 110 });
  },

  // Upgrade / power-up: yükselen iki nota
  upgrade() {
    if (!enabled) return;
    note(440, 0, 0.1, { type: 'square', vol: 0.18 });
    note(660, 0.08, 0.14, { type: 'square', vol: 0.18 });
  },

  // Satın alma başarılı: parlak akor
  purchase() {
    if (!enabled) return;
    note(523, 0, 0.12, { type: 'triangle', vol: 0.2 });
    note(659, 0.06, 0.14, { type: 'triangle', vol: 0.2 });
    note(784, 0.12, 0.18, { type: 'triangle', vol: 0.22 });
  },

  // Claim: yükselen "ding" + parıltı
  claim() {
    if (!enabled) return;
    note(660, 0, 0.12, { type: 'sine', vol: 0.22 });
    note(880, 0.1, 0.16, { type: 'sine', vol: 0.24 });
    note(1320, 0.2, 0.25, { type: 'sine', vol: 0.18 });
  },

  // Egg çatlama: gürültü + düşen ton
  eggCrack() {
    if (!enabled) return;
    noise(0, 0.12, { vol: 0.25, filterFreq: 3000 });
    note(400, 0.05, 0.15, { type: 'sawtooth', vol: 0.14, slideTo: 200 });
  },

  // Egg ödül fanfarı: yükselen arpej
  eggReward() {
    if (!enabled) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => note(f, i * 0.09, 0.22, { type: 'triangle', vol: 0.2 }));
  },

  // Swap: iki yönlü "swoosh"
  swap() {
    if (!enabled) return;
    note(400, 0, 0.12, { type: 'sine', vol: 0.18, slideTo: 800 });
    note(800, 0.1, 0.14, { type: 'sine', vol: 0.16, slideTo: 500 });
  },

  // Splash açılış: yumuşak yükselen whoosh
  splash() {
    if (!enabled) return;
    note(220, 0, 0.5, { type: 'sine', vol: 0.16, slideTo: 660 });
    note(330, 0.15, 0.5, { type: 'sine', vol: 0.12, slideTo: 990 });
  },

  // Sekme değişimi: hafif tık
  tab() {
    if (!enabled) return;
    note(700, 0, 0.05, { type: 'sine', vol: 0.1 });
  },
};
