import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess } from './telegram.js';
import { BOOSTS, formatNumber } from './economy.js';

export default function ShopScreen() {
  const { state, actions } = useGame();
  const toast = useToast();

  const buyWithPoints = (index, boost) => {
    if (state.ownedBoosts.includes(index)) return;
    if (index > 0 && !state.ownedBoosts.includes(index - 1)) {
      toast('Önce bir önceki boostu al!');
      haptic('rigid');
      return;
    }
    if (state.points < boost.pointCost) {
      toast(`Yetersiz puan! ${formatNumber(boost.pointCost)} gerekli`);
      haptic('rigid');
      return;
    }
    actions.buyBoostWithPoints(index, boost);
    hapticSuccess();
    toast(`${boost.label} alındı! +${boost.bonus} ZEX`);
  };

  const buyWithMoney = () => {
    toast('💎 Telegram Stars ödeme yakında eklenecek');
    haptic('rigid');
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
        Günlük ZEX çarpanını artır + anında ZEX bonusu kazan. Puanla ya da parayla al. Her boost 5 gün sürer.
      </p>

      {BOOSTS.map((boost, index) => {
        const owned = state.ownedBoosts.includes(index);
        const available = index === 0 || state.ownedBoosts.includes(index - 1);
        const canBuy = available && !owned;
        const canAfford = state.points >= boost.pointCost;

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
              {owned && <span className="owned-tag">✓ OWNED</span>}
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
                  <div className="locked-note">🔒 Önceki boostu al</div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
