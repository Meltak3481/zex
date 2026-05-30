import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess } from './telegram.js';
import {
  UPGRADE_PATTERN, MAX_LEVEL,
  getClickValue, getMineValue, getLimitValue, formatNumber,
} from './economy.js';

const STATS = [
  { key: 'click', title: 'Click Power', accent: '#00e5ff', icon: '👆',
    cur: (s) => `${getClickValue(s.clickLevel)} / tap`, next: (s) => `${getClickValue(s.clickLevel + 1)} / tap`,
    level: (s) => s.clickLevel },
  { key: 'mine', title: 'Mine Speed', accent: '#ffc83d', icon: '⛏️',
    cur: (s) => `${getMineValue(s.mineLevel)} / sec`, next: (s) => `${getMineValue(s.mineLevel + 1)} / sec`,
    level: (s) => s.mineLevel },
  { key: 'limit', title: 'Energy Limit', accent: '#3dff9e', icon: '🔋',
    cur: (s) => `${getLimitValue(s.limitLevel)} cap`, next: (s) => `${getLimitValue(s.limitLevel + 1)} cap`,
    level: (s) => s.limitLevel },
];

export default function BoostScreen() {
  const { state, actions } = useGame();
  const toast = useToast();

  const handleUpgrade = (stat) => {
    const level = stat.level(state);
    const idx = level - 1;
    if (idx >= MAX_LEVEL) return;
    const step = UPGRADE_PATTERN[idx];

    if (step.type === 'money') {
      toast('💎 Bu seviye Telegram Stars ile açılacak (yakında)');
      haptic('rigid');
      return;
    }
    if (state.points < step.cost) {
      toast(`Yetersiz puan! ${formatNumber(step.cost)} gerekli`);
      haptic('rigid');
      return;
    }
    actions.upgrade(stat.key, step.cost);
    hapticSuccess();
    toast(`${stat.title} yükseltildi! -${formatNumber(step.cost)}`);
  };

  return (
    <div className="screen fade-in">
      <div className="section-title">
        <span className="bar" style={{ background: 'var(--neon-orange)' }} />
        Power Up
      </div>

      {STATS.map((stat) => {
        const level = stat.level(state);
        const idx = level - 1;
        const maxed = idx >= MAX_LEVEL;
        const step = maxed ? null : UPGRADE_PATTERN[idx];
        const isMoney = step?.type === 'money';
        const progress = (Math.min(idx, MAX_LEVEL) / MAX_LEVEL) * 100;
        const costLabel = maxed ? 'MAX' : isMoney ? `$${step.cost}` : `${formatNumber(step.cost)} pts`;

        return (
          <div key={stat.key} className="card" style={{
            background: `linear-gradient(135deg, ${stat.accent}1f, rgba(7,11,22,0.6))`,
            borderColor: stat.accent + '66',
          }}>
            <div className="card-row">
              <div className="card-badge" style={{
                background: stat.accent + '22', border: `1.5px solid ${stat.accent}`,
                fontSize: 24,
              }}>{stat.icon}</div>
              <div className="card-info">
                <div className="name">{stat.title}</div>
                <div className="sub" style={{ color: stat.accent }}>
                  Level {level - 1} / {MAX_LEVEL}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{stat.cur(state)}</div>
                {!maxed && (
                  <div className="card-arrow" style={{ justifyContent: 'flex-end' }}>
                    ↑ {stat.next(state)}
                  </div>
                )}
              </div>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%`, background: stat.accent }} />
            </div>

            {maxed ? (
              <div className="owned-tag" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                ★ MAX LEVEL ★
              </div>
            ) : (
              <button
                className={'btn ' + (isMoney ? 'btn-green' : 'btn-cyan')}
                style={{ width: '100%' }}
                onClick={() => handleUpgrade(stat)}
              >
                {isMoney ? '💎' : '⚡'} UPGRADE • {costLabel}
              </button>
            )}
          </div>
        );
      })}

      <div className="power-summary">
        <div className="power-stat">
          <div className="ps-val" style={{ color: 'var(--neon-cyan)' }}>{getClickValue(state.clickLevel)}</div>
          <div className="ps-lbl">Click</div>
        </div>
        <div className="power-stat">
          <div className="ps-val" style={{ color: 'var(--neon-gold)' }}>{getMineValue(state.mineLevel)}</div>
          <div className="ps-lbl">Mine/s</div>
        </div>
        <div className="power-stat">
          <div className="ps-val" style={{ color: 'var(--neon-green)' }}>{getLimitValue(state.limitLevel)}</div>
          <div className="ps-lbl">Limit</div>
        </div>
      </div>
    </div>
  );
}
