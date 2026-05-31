import { useState } from 'react';
import Lottie from 'lottie-react';
import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess } from './telegram.js';
import { sfx } from './sound.js';
import { CHECKIN_REWARDS, EGG_TYPES, EGG_PRICES, formatNumber } from './economy.js';
import eggBreakAnim from './egg_break.json';

import eggFree from './egg_free.png';
import eggCommon from './egg_common.png';
import eggRare from './egg_rare.png';
import eggLegendary from './egg_legendary.png';
import eggFreeBroken from './egg_free_broken.png';
import eggCommonBroken from './egg_common_broken.png';
import eggRareBroken from './egg_rare_broken.png';
import eggLegendaryBroken from './egg_legendary_broken.png';

const EGG_IMG = { Free: eggFree, Common: eggCommon, Rare: eggRare, Legendary: eggLegendary };
const EGG_BROKEN = { Free: eggFreeBroken, Common: eggCommonBroken, Rare: eggRareBroken, Legendary: eggLegendaryBroken };
const EGG_COLOR = { Free: '#4db8ff', Common: '#ffc83d', Rare: '#ff4d4d', Legendary: '#ff9a3d' };

export default function CheckinScreen() {
  const { state, actions, canCheckin } = useGame();
  const toast = useToast();
  const [opening, setOpening] = useState(null);   // {type} Lottie açılışı
  const [reward, setReward] = useState(null);     // ödül popup
  const [buyPopup, setBuyPopup] = useState(null); // {type} satın alma popup

  const day = Math.min(state.checkinDay, 6);
  const todayReward = CHECKIN_REWARDS[day];

  const handleCheckin = () => {
    if (!canCheckin) {
      toast('Already checked in today. Come back tomorrow!');
      haptic('rigid');
      return;
    }
    actions.claimCheckin();
    hapticSuccess();
    sfx.claim();
    toast(`Day ${day + 1}: +${formatNumber(todayReward.points)} pts, +${todayReward.zex} ZEX, ${todayReward.eggCount}x ${todayReward.eggType} egg!`);
  };

  const handleOpenEgg = (type) => {
    if (opening) return;
    const count = state.ownedEggs.filter((e) => e === type).length;
    if (count === 0) return;
    haptic('medium');
    sfx.eggCrack();
    const label = actions.openEgg(type);
    setOpening({ type, label });
    setTimeout(() => {
      hapticSuccess();
      sfx.eggReward();
      setReward({ type, label });
      setOpening(null);
    }, 2600);
  };

  // Satın alma popup'ı aç
  const openBuyPopup = (type) => {
    haptic('light');
    setBuyPopup({ type });
  };

  // Test modu: ödeme yapılmış gibi egg ver
  const payWith = (method) => {
    const type = buyPopup.type;
    actions.buyEgg(type);
    hapticSuccess();
    sfx.purchase();
    toast(`${type} egg purchased with ${method}! (test)`);
    setBuyPopup(null);
  };

  const counts = {};
  EGG_TYPES.forEach((t) => { counts[t] = state.ownedEggs.filter((e) => e === t).length; });

  return (
    <div className="screen fade-in" style={{ paddingTop: 0 }}>
      {/* Gradyan başlık bandı */}
      <div className="checkin-banner">Daily Check-in</div>

      {/* Seçili gün ödül kartı */}
      <div className="checkin-today">
        <div className="ct-day">Day {day + 1}</div>
        <div className="ct-reward">
          {formatNumber(todayReward.points)} points + {todayReward.zex} ZEX + {todayReward.eggCount} {todayReward.eggType} Egg
        </div>
      </div>

      {/* Day 1-7 tik sırası */}
      <div className="checkin-days">
        {CHECKIN_REWARDS.map((r, i) => {
          const done = i < state.checkinDay;
          const current = i === state.checkinDay && canCheckin;
          return (
            <div key={i} className={'cday' + (current ? ' current' : '')}>
              <div className="cday-label">Day {i + 1}</div>
              <div className={'cday-circle' + (done ? ' done' : '')}>
                {done ? '✓' : i + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in butonu */}
      <button
        className={'btn ' + (canCheckin ? 'btn-green' : 'btn-ghost')}
        style={{ width: '100%', marginTop: 6, padding: '14px' }}
        onClick={handleCheckin}
        disabled={!canCheckin}
      >
        {canCheckin ? 'Check-in' : 'Come back tomorrow'}
      </button>

      {/* Your Eggs */}
      <div className="your-eggs-title">Your Eggs</div>

      <div className="eggs-row">
        {EGG_TYPES.map((type) => {
          const count = counts[type];
          const price = EGG_PRICES[type];
          return (
            <div key={type} className="egg-col">
              <div
                className="egg-thumb"
                onClick={() => count > 0 && handleOpenEgg(type)}
                style={{ cursor: count > 0 ? 'pointer' : 'default' }}
              >
                <img src={EGG_IMG[type]} alt={type} draggable="false" />
              </div>
              <div className="egg-col-name">{type} Egg</div>
              <div className="egg-col-count" style={{ color: EGG_COLOR[type] }}>x{count}</div>
              <button className="btn btn-cyan egg-buy-btn" onClick={() => openBuyPopup(type)}>
                Buy ({price.stars} ⭐)
              </button>
            </div>
          );
        })}
      </div>

      <p className="egg-hint">
        Tap an egg you own to open it and win rewards!
      </p>

      {/* Lottie kırılma overlay */}
      {opening && (
        <div className="egg-break-overlay">
          <div className="egg-break-stage">
            <Lottie animationData={eggBreakAnim} loop={false} autoplay style={{ width: 280, height: 280 }} />
            <div className="egg-break-label" style={{ color: EGG_COLOR[opening.type] }}>
              Opening {opening.type}...
            </div>
          </div>
        </div>
      )}

      {/* Ödül popup */}
      {reward && (
        <div className="reward-overlay" onClick={() => setReward(null)}>
          <div className="reward-pop" onClick={(e) => e.stopPropagation()}>
            <img src={EGG_BROKEN[reward.type]} alt="" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <div className="reward-title">{reward.label}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 14 }}>
              {reward.type} egg opened
            </div>
            <button className="btn btn-green" style={{ width: '100%' }} onClick={() => setReward(null)}>
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Satın alma popup (Stars / TON) */}
      {buyPopup && (
        <div className="reward-overlay" onClick={() => setBuyPopup(null)}>
          <div className="buy-pop" onClick={(e) => e.stopPropagation()}>
            <img src={EGG_IMG[buyPopup.type]} alt="" style={{ width: 90, height: 90, objectFit: 'contain' }} />
            <div className="buy-title" style={{ color: EGG_COLOR[buyPopup.type] }}>
              Buy {buyPopup.type} Egg
            </div>
            <div className="buy-sub">Choose payment method</div>

            <button className="btn btn-gold buy-method" onClick={() => payWith('Stars')}>
              <span>⭐ Pay with Stars</span>
              <span className="buy-price">{EGG_PRICES[buyPopup.type].stars} Stars</span>
            </button>

            <button className="btn btn-cyan buy-method" onClick={() => payWith('TON')}>
              <span>💎 Pay with TON</span>
              <span className="buy-price">{EGG_PRICES[buyPopup.type].ton} TON</span>
            </button>

            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 4 }} onClick={() => setBuyPopup(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
