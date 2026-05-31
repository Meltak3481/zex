import { useState } from 'react';
import Lottie from 'lottie-react';
import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess } from './telegram.js';
import { CHECKIN_REWARDS, EGG_TYPES, formatNumber } from './economy.js';
import eggBreakAnim from './egg_break.json';

// Yumurta görselleri (sağlam + kırık)
import eggFree from './egg_free.png';
import eggCommon from './egg_common.png';
import eggRare from './egg_rare.png';
import eggLegendary from './egg_legendary.png';
import eggFreeBroken from './egg_free_broken.png';
import eggCommonBroken from './egg_common_broken.png';
import eggRareBroken from './egg_rare_broken.png';
import eggLegendaryBroken from './egg_legendary_broken.png';

const EGG_IMG = {
  Free: eggFree, Common: eggCommon, Rare: eggRare, Legendary: eggLegendary,
};
const EGG_BROKEN = {
  Free: eggFreeBroken, Common: eggCommonBroken, Rare: eggRareBroken, Legendary: eggLegendaryBroken,
};
const EGG_COLOR = {
  Free: '#4db8ff', Common: '#ffc83d', Rare: '#ff4d4d', Legendary: '#ff9a3d',
};

export default function CheckinScreen() {
  const { state, actions, canCheckin, canClaimFreeEgg } = useGame();
  const toast = useToast();
  const [opening, setOpening] = useState(null); // {type} açılıyor
  const [reward, setReward] = useState(null);   // açılan ödül popup

  const handleCheckin = () => {
    if (!canCheckin) {
      toast('Bugünkü check-in yapıldı, yarın tekrar gel!');
      haptic('rigid');
      return;
    }
    const day = Math.min(state.checkinDay, 6);
    const r = CHECKIN_REWARDS[day];
    actions.claimCheckin();
    hapticSuccess();
    toast(`Gün ${day + 1}: +${formatNumber(r.points)} puan, +${r.zex} ZEX, ${r.eggCount}x ${r.eggType} egg!`);
  };

  const handleFreeEgg = () => {
    if (!canClaimFreeEgg) {
      toast('Günlük ücretsiz yumurta alındı, yarın tekrar gel!');
      haptic('rigid');
      return;
    }
    actions.claimFreeEgg();
    hapticSuccess();
    toast('Ücretsiz Free egg kazandın! 🥚');
  };

  const handleOpenEgg = (type) => {
    if (opening) return;
    const count = state.ownedEggs.filter((e) => e === type).length;
    if (count === 0) return;
    haptic('medium');
    // Ödülü hemen hesapla ve state'i güncelle, ama önce animasyonu göster
    const label = actions.openEgg(type);
    setOpening({ type, label });
    // Lottie animasyonu ~3 sn (kırılma kısmı), bitince ödül popup
    setTimeout(() => {
      hapticSuccess();
      setReward({ type, label });
      setOpening(null);
    }, 2600);
  };

  // egg sayıları
  const counts = {};
  EGG_TYPES.forEach((t) => { counts[t] = state.ownedEggs.filter((e) => e === t).length; });
  const totalEggs = state.ownedEggs.length;

  return (
    <div className="screen fade-in">
      {/* Günlük Check-in */}
      <div className="section-title">
        <span className="bar" style={{ background: 'var(--neon-green)' }} />
        Daily Check-in
      </div>

      <div className="checkin-grid">
        {CHECKIN_REWARDS.map((r, i) => {
          const done = i < state.checkinDay;
          const current = i === state.checkinDay && canCheckin;
          return (
            <div
              key={i}
              className={'checkin-day' + (done ? ' done' : '') + (current ? ' current' : '')}
            >
              <div className="cd-day">Gün {i + 1}</div>
              <div className="cd-egg" style={{ color: EGG_COLOR[r.eggType] }}>🥚</div>
              <div className="cd-zex">+{r.zex} ZEX</div>
              <div className="cd-pts">{formatNumber(r.points)}</div>
              {done && <div className="cd-check">✓</div>}
            </div>
          );
        })}
      </div>

      <button
        className={'btn ' + (canCheckin ? 'btn-green' : 'btn-ghost')}
        style={{ width: '100%', marginTop: 4 }}
        onClick={handleCheckin}
        disabled={!canCheckin}
      >
        {canCheckin ? `✓ Gün ${Math.min(state.checkinDay, 6) + 1} Check-in Yap` : '⏳ Yarın tekrar gel'}
      </button>

      <button
        className={'btn ' + (canClaimFreeEgg ? 'btn-cyan' : 'btn-ghost')}
        style={{ width: '100%', marginTop: 10 }}
        onClick={handleFreeEgg}
        disabled={!canClaimFreeEgg}
      >
        {canClaimFreeEgg ? '🎁 Günlük Ücretsiz Yumurta Al' : '⏳ Ücretsiz yumurta alındı'}
      </button>

      {/* Yumurtalarım */}
      <div className="section-title" style={{ marginTop: 22 }}>
        <span className="bar" style={{ background: 'var(--neon-gold)' }} />
        Yumurtalarım ({totalEggs})
      </div>

      {totalEggs === 0 && (
        <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Henüz yumurtan yok. Check-in yap veya ücretsiz yumurta al!
        </p>
      )}

      <div className="egg-grid">
        {EGG_TYPES.map((type) => {
          const count = counts[type];
          if (count === 0) return null;
          return (
            <div key={type} className="egg-card" style={{ borderColor: EGG_COLOR[type] + '66' }}>
              <div className="egg-img-wrap" onClick={() => handleOpenEgg(type)}>
                <img
                  src={EGG_IMG[type]}
                  alt={type}
                  className="egg-img idle"
                  draggable="false"
                />
                <span className="egg-count" style={{ background: EGG_COLOR[type] }}>{count}</span>
              </div>
              <div className="egg-name" style={{ color: EGG_COLOR[type] }}>{type}</div>
              <button
                className="btn btn-gold"
                style={{ width: '100%', padding: '8px', fontSize: 13 }}
                onClick={() => handleOpenEgg(type)}
                disabled={!!opening}
              >
                Aç
              </button>
            </div>
          );
        })}
      </div>

      {/* Lottie yumurta kırılma animasyonu (tam ekran overlay) */}
      {opening && (
        <div className="egg-break-overlay">
          <div className="egg-break-stage">
            <Lottie
              animationData={eggBreakAnim}
              loop={false}
              autoplay={true}
              style={{ width: 280, height: 280 }}
            />
            <div className="egg-break-label" style={{ color: EGG_COLOR[opening.type] }}>
              {opening.type} açılıyor...
            </div>
          </div>
        </div>
      )}

      {/* Ödül popup */}
      {reward && (
        <div className="reward-overlay" onClick={() => setReward(null)}>
          <div className="reward-pop" onClick={(e) => e.stopPropagation()}>
            <img src={EGG_BROKEN[reward.type]} alt="" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <div className="reward-title">{reward.label || 'Ödül!'}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 14 }}>
              {reward.type} yumurta açıldı
            </div>
            <button className="btn btn-green" style={{ width: '100%' }} onClick={() => setReward(null)}>
              Harika!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
