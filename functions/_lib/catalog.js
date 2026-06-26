// SUNUCU TARAFI YETKİLİ KATALOG (fiyatlar burada doğrulanır — istemciye güvenilmez).
// Fiyatlar economy.js ile eşleşir. itemId -> { title, stars }
// Ödülün NE OLDUĞU (egg ekle / boost aç) istemcide economy.js'e göre uygulanır;
// sunucu sadece "ne satın alındı"yı kaydeder.

const EGGS = {
  egg_free:      { title: 'Free Egg',      stars: 10 },
  egg_common:    { title: 'Common Egg',    stars: 20 },
  egg_rare:      { title: 'Rare Egg',      stars: 40 },
  egg_legendary: { title: 'Legendary Egg', stars: 70 },
};

// Boostlar: economy.js BOOST_CATALOG sırası (index 0..8). Stars = price(TON)*200.
const BOOST_STARS = [80, 120, 160, 200, 280, 360, 440, 520, 600];
const BOOST_LABELS = ['2x', '3x', '4x', '5x', '7x', '10x', '15x', '20x', '25x'];
const BOOSTS = {};
BOOST_STARS.forEach((s, i) => {
  BOOSTS[`boost_${i}`] = { title: `Boost ${BOOST_LABELS[i]}`, stars: s };
});

export const CATALOG = { ...EGGS, ...BOOSTS };
