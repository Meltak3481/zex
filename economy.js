// Oyun ekonomisi - TEK KAYNAK (Flutter projesindeki mantığın React karşılığı)
// Buradaki değerleri değiştirince tüm oyun dengelenir.

// Swap oranı: 40.000 puan = 1 ZEX (Flutter wallet_screen ile aynı)
export const POINTS_PER_ZEX = 40000;
export const MIN_SWAP_POINTS = 40000; // minimum çevrim (mikro-ZEX istismarını önler)

// Click (tap) gücü: her seviye +1 puan/tap
export const getClickValue = (level) => level;

// Mine (saniyelik otomatik üretim): her seviye +1 puan/sn
export const getMineValue = (level) => level;

// Enerji limiti (tap için harcanan enerji havuzu)
export const getLimitValue = (level) => {
  switch (level) {
    case 1: return 1000;
    case 2: return 1500;
    case 3: return 2000;
    case 4: return 3000;
    default: return 5000 + (level - 4) * 1000;
  }
};

// Enerji yenilenme hızı (puan/sn)
export const ENERGY_RECHARGE_PER_SEC = 3;

// Yükseltme maliyet deseni (puan -> puan -> "money" kilidi)
// "money" basamakları Telegram Stars ile açılacak (Aşama 2). Şimdilik kilitli gösterilir.
export const UPGRADE_PATTERN = [
  { cost: 2000, type: 'points' },
  { cost: 6000, type: 'points' },
  { cost: 0.5, type: 'money' },
  { cost: 12000, type: 'points' },
  { cost: 24000, type: 'points' },
  { cost: 1.0, type: 'money' },
  { cost: 48000, type: 'points' },
  { cost: 96000, type: 'points' },
  { cost: 3.0, type: 'money' },
  { cost: 192000, type: 'points' },
  { cost: 384000, type: 'points' },
  { cost: 9.0, type: 'money' },
];

export const MAX_LEVEL = UPGRADE_PATTERN.length;

// Boost çarpanları (Flutter shop_screen ile aynı): kalıcı ZEX bonus + günlük çarpan
// pointCost: POINTS_PER_ZEX baz alınarak hesaplandı (parayla almak hep cazip kalsın diye ~1.5x)
export const BOOSTS = [
  { label: '2x',  multiplier: 2.0,  bonus: 2.0,  price: 0.4, pointCost: 20000 },
  { label: '3x',  multiplier: 3.0,  bonus: 3.0,  price: 0.6, pointCost: 40000 },
  { label: '4x',  multiplier: 4.0,  bonus: 5.0,  price: 0.8, pointCost: 70000 },
  { label: '5x',  multiplier: 5.0,  bonus: 6.0,  price: 1.0, pointCost: 110000 },
  { label: '7x',  multiplier: 7.0,  bonus: 8.0,  price: 1.4, pointCost: 180000 },
  { label: '10x', multiplier: 10.0, bonus: 10.0, price: 1.8, pointCost: 300000 },
  { label: '15x', multiplier: 15.0, bonus: 15.0, price: 2.2, pointCost: 500000 },
  { label: '20x', multiplier: 20.0, bonus: 20.0, price: 2.6, pointCost: 800000 },
  { label: '25x', multiplier: 25.0, bonus: 25.0, price: 3.0, pointCost: 1300000 },
];

// Boost süresi (5 gün) - Flutter ile aynı
export const BOOST_DURATION_MS = 120 * 60 * 60 * 1000;

// Sayı formatlama: 1300000 -> 1.3M
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return Math.floor(n).toString();
}

export function formatZex(n) {
  return n.toFixed(3).replace(/\.?0+$/, '');
}

// ===== EGG SİSTEMİ (Flutter global_game_data.openEgg ile aynı) =====
export const EGG_TYPES = ['Free', 'Common', 'Rare', 'Legendary'];

// Egg açma ödül havuzları (ağırlıklı). label parse edilip puan/zex verilir.
export const EGG_REWARDS = {
  Free: [
    { label: '3000 Points', weight: 50 },
    { label: '5 ZEX', weight: 35 },
    { label: '10 ZEX', weight: 15 },
  ],
  Common: [
    { label: '5000 Points', weight: 40 },
    { label: '10000 Points', weight: 30 },
    { label: '20 ZEX', weight: 20 },
    { label: '30 ZEX', weight: 10 },
  ],
  Rare: [
    { label: '20000 Points', weight: 45 },
    { label: '40 ZEX', weight: 35 },
    { label: '50 ZEX', weight: 20 },
  ],
  Legendary: [
    { label: '30000 Points', weight: 35 },
    { label: '60 ZEX', weight: 30 },
    { label: '80 ZEX', weight: 25 },
    { label: '100 ZEX', weight: 10 },
  ],
};

// Ağırlıklı rastgele seçim
export function weightedRandom(rewards) {
  const total = rewards.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of rewards) {
    roll -= r.weight;
    if (roll <= 0) return r.label;
  }
  return rewards[rewards.length - 1].label;
}

// Ödül etiketini {points, zex} olarak çöz
export function parseReward(label) {
  const num = parseFloat(label);
  if (label.includes('Points')) return { points: num, zex: 0 };
  if (label.includes('ZEX')) return { points: 0, zex: num };
  return { points: 0, zex: 0 };
}

// 7 günlük check-in ödülleri (Flutter checkin_screen.rewards ile aynı)
export const CHECKIN_REWARDS = [
  { points: 10000, zex: 15, eggType: 'Common', eggCount: 1 },
  { points: 12500, zex: 20, eggType: 'Rare', eggCount: 1 },
  { points: 15000, zex: 25, eggType: 'Rare', eggCount: 2 },
  { points: 17500, zex: 30, eggType: 'Rare', eggCount: 2 },
  { points: 20000, zex: 35, eggType: 'Rare', eggCount: 1 },
  { points: 25000, zex: 40, eggType: 'Legendary', eggCount: 1 },
  { points: 30000, zex: 50, eggType: 'Legendary', eggCount: 2 },
];
