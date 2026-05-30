import { useGame } from './GameContext.jsx';
import { formatNumber, formatZex } from './economy.js';

export default function TopBar() {
  const { state } = useGame();
  return (
    <div className="topbar">
      <div className="stat-pill">
        <div className="icon" style={{ background: 'rgba(255,200,61,0.15)' }}>
          <CoinIcon />
        </div>
        <div>
          <div className="label">Points</div>
          <div className="value" style={{ color: 'var(--neon-gold)' }}>
            {formatNumber(state.points)}
          </div>
        </div>
      </div>
      <div className="stat-pill">
        <div className="icon" style={{ background: 'rgba(61,255,158,0.15)' }}>
          <ZexIcon />
        </div>
        <div>
          <div className="label">Zex</div>
          <div className="value" style={{ color: 'var(--neon-green)' }}>
            {formatZex(state.zex)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#ffc83d" strokeWidth="2" />
      <path d="M9 12h6M12 8v8" stroke="#ffc83d" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ZexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6h12L8 18h10" stroke="#3dff9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
