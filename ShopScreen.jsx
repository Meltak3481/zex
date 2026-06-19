import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess } from './telegram.js';
import { sfx } from './sound.js';
import { BOOSTS, formatNumber } from './economy.js';

function fmtDur(ms) {
  if (ms <= 0) return '0m';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function ShopScreen() {
  const { state, actions, boostRemaining } = useGame();
  const toast = useToast();

  const buyWithPoints = (index, boost) => {
    if (state.ownedBoosts.includes(index)) return;
    if (index > 0 && !state.ownedBoosts.includes(index - 1)) {
      toast('Buy the previous boost first!');
      haptic('rigid');
      return;
    }
    if (state.points < boost.pointCost) {
      toast(`Not enough points! Need ${formatNumber(boost.pointCost)}`);
      haptic('rigid');
      return;
    }
    actions.buyBoostWithPoints(index, boost);
    hapticSuccess();
    sfx.purchase();
    toast(`${boost.label} purchased! +${boost.bonus} ZEX`);
  };

  const buyWithMoney = () => {
    toast('💎 Telegram Stars payment coming soon');
    haptic('rigid');
  };

  const renewBoost = (index, boost) => {
    if (!state.ownedBoosts.includes(index)) return;
    if (state.points < boost.pointCost) {
      toast(`Not enough points! Need ${formatNumber(boost.pointCost)}`);
      haptic('rigid');
      return;
    }
    actions.renewBoost(index, boost);
    hapticSuccess();
    sfx.purchase();
    toast(`${boost.label} reactivated for 5 days!`);
  };

  return (
    <div className="screen fade-in">
      <div className="section-title">
        <span className="bar" style={{ background: 'var(--neon-gold)' }} />
        Boost Multipliers
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--neon-gold)', fontFamily: 'Orbitron' }}>
          {formatNumber(state.points)} pts
        </span>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '0 2px 14px', lineHeight: 1.4 }}>
        Boost your daily ZEX multiplier + get an instant ZEX bonus. Buy with points or money. Each boost lasts 5 days.
      </p>

      {BOOSTS.map((boost, index) => {
        const owned = state.ownedBoosts.includes(index);
        const available = index === 0 || state.ownedBoosts.includes(index - 1);
        const canBuy = available && !owned;
        const canAfford = state.points >= boost.pointCost;
        // Bu boost şu an aktif çarpan mı ve süresi devam ediyor mu?
        const isActiveBoost = owned && state.boostMultiplier === boost.multiplier && boostRemaining > 0;

        return (
          <div key={index} className="card" style={{
            background: owned
              ? 'linear-gradient(135deg, rgba(61,255,158,0.18), rgba(7,11,22,0.6))'
              : canBuy
                ? 'linear-gradient(135deg, rgba(255,200,61,0.16), rgba(7,11,22,0.6))'
                : 'linear-gradient(135deg, rgba(120,140,170,0.08), rgba(7,11,22,0.6))',
            borderColor: owned ? 'rgba(61,255,158,0.5)' : canBuy ? 'rgba(255,200,61,0.5)' : 'var(--border)',
            boxShadow: canBuy ? '0 0 18px rgba(255,200,61,0.18)' : 'none',
          }}>
            <div className="card-row">
              <div className="card-badge" style={{
                background: 'linear-gradient(135deg, #ff9a52, #f2641f)',
                color: '#fff', fontSize: 17,
                boxShadow: '0 0 14px rgba(255,122,61,0.4)',
              }}>{boost.label}</div>
              <div className="card-info">
                <div className="name">{boost.label} ZEX Multiplier</div>
                <div className="sub" style={{ color: 'var(--neon-green)' }}>
                  🎁 +{boost.bonus} ZEX instant bonus
                </div>
              </div>
              {owned && (
                isActiveBoost ? (
                  <span className="owned-tag" style={{
                    background: 'rgba(255,122,61,0.18)', color: 'var(--neon-orange)',
                    borderColor: 'rgba(255,122,61,0.4)',
                  }}>
                    ⏳ {fmtDur(boostRemaining)}
                  </span>
                ) : (
                  <span className="owned-tag">✓ OWNED</span>
                )
              )}
            </div>

            {!owned && (
              <>
                <div style={{ height: 10 }} />
                <div className="btn-pair">
                  <button
                    className="btn btn-green"
                    disabled={!canBuy}
                    onClick={buyWithMoney}
                  >
                    💲 ${boost.price.toFixed(1)}
                  </button>
                  <button
                    className="btn btn-orange"
                    disabled={!canBuy || !canAfford}
                    onClick={() => buyWithPoints(index, boost)}
                  >
                    ⚡ {formatNumber(boost.pointCost)}
                  </button>
                </div>
                {!available && (
                  <div className="locked-note">🔒 Buy previous boost</div>
                )}
              </>
            )}

            {owned && !isActiveBoost && (
              <>
                <div style={{ height: 10 }} />
                <div className="btn-pair">
                  <button className="btn btn-green" onClick={buyWithMoney}>
                    💲 ${boost.price.toFixed(1)}
                  </button>
                  <button
                    className="btn btn-orange"
                    disabled={!canAfford}
                    onClick={() => renewBoost(index, boost)}
                  >
                    🔄 {formatNumber(boost.pointCost)}
                  </button>
                </div>
                <div className="locked-note">Reactivate this boost for 5 more days</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
