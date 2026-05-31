import { useState } from 'react';
import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { hapticSuccess, haptic } from './telegram.js';
import { sfx } from './sound.js';
import { POINTS_PER_ZEX, MIN_SWAP_POINTS, formatNumber, formatZex } from './economy.js';

// ms -> "3d 21h" / "5h 12m" / "8m 30s"
function formatDuration(ms) {
  if (ms <= 0) return '0m';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function WalletScreen() {
  const { state, actions, dailyZexTotal, claimableZex, zexFull, boostRemaining } = useGame();
  const toast = useToast();
  const [amount, setAmount] = useState('');

  const pts = parseInt(amount, 10) || 0;
  const zexOut = pts / POINTS_PER_ZEX;

  const handleClaim = () => {
    if (claimableZex <= 0) {
      toast('Nothing to claim yet');
      haptic('rigid');
      return;
    }
    actions.claimDailyZex();
    hapticSuccess();
    sfx.claim();
    toast(`Claimed ${formatZex(claimableZex)} ZEX!`);
  };

  const handleSwap = () => {
    if (pts <= 0) { toast('Enter a valid amount'); return; }
    if (pts < MIN_SWAP_POINTS) {
      toast(`Minimum ${formatNumber(MIN_SWAP_POINTS)} points (1 ZEX)`);
      haptic('rigid');
      return;
    }
    if (pts > state.points) {
      toast('Not enough points!');
      haptic('rigid');
      return;
    }
    actions.swap(pts);
    hapticSuccess();
    sfx.swap();
    toast(`You earned ${formatZex(zexOut)} ZEX!`);
    setAmount('');
  };

  const setMax = () => {
    const usable = Math.floor(state.points / POINTS_PER_ZEX) * POINTS_PER_ZEX;
    setAmount(usable > 0 ? String(usable) : '');
  };

  return (
    <div className="screen fade-in">
      <div className="section-title">
        <span className="bar" style={{ background: 'var(--neon-green)' }} />
        Wallet
      </div>

      {/* ZEX bakiye kartı */}
      <div className="panel" style={{ padding: 22, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ color: 'var(--text-dim)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
          Total ZEX Balance
        </div>
        <div style={{
          fontFamily: 'Orbitron', fontWeight: 900, fontSize: 44,
          color: 'var(--neon-green)', textShadow: '0 0 24px rgba(61,255,158,0.4)',
          margin: '6px 0',
        }}>
          {formatZex(state.zex)}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          ≈ {formatNumber(state.zex * POINTS_PER_ZEX)} points value
        </div>
      </div>

      {/* Daily ZEX Claim kartı (Flutter düzeni) */}
      <div className="claim-card">
        <div className="claim-reward">
          Daily Zex Reward: {formatZex(dailyZexTotal)}
        </div>
        <div className="claim-next">
          {zexFull ? 'Ready to claim!' : `Accumulating: ${formatZex(claimableZex)} ZEX`}
        </div>
        {boostRemaining > 0 && (
          <div className="claim-boost">
            Boost: {state.boostMultiplier}x ({formatDuration(boostRemaining)} left)
          </div>
        )}
        <button
          className="btn btn-green"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleClaim}
        >
          {zexFull ? 'Claim' : `Claim ${formatZex(claimableZex)} ZEX`}
        </button>
      </div>

      {/* Swap kutusu */}
      <div className="section-title">
        <span className="bar" style={{ background: 'var(--neon-cyan)' }} />
        Convert Points → ZEX
      </div>

      <div className="swap-box panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>You have</span>
          <span style={{ color: 'var(--neon-gold)', fontWeight: 700, fontFamily: 'Orbitron', fontSize: 13 }}>
            {formatNumber(state.points)} pts
          </span>
        </div>

        <input
          className="swap-input"
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={setMax}>
            MAX
          </button>
        </div>

        <div className="swap-arrow">↓</div>
        <div className="swap-result">{formatZex(zexOut)} ZEX</div>

        <button className="btn btn-green" style={{ width: '100%' }} onClick={handleSwap}>
          SWAP
        </button>

        <div className="swap-rate">
          Rate: {formatNumber(POINTS_PER_ZEX)} points = 1 ZEX · min {formatNumber(MIN_SWAP_POINTS)}
        </div>
      </div>
    </div>
  );
}
