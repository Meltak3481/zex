import { useState, useRef, useCallback } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { getClickValue, getMineValue, getLimitValue } from '../lib/economy.js';
import { haptic } from '../lib/telegram.js';

let floatId = 0;

export default function TapScreen() {
  const { state, actions } = useGame();
  const [floats, setFloats] = useState([]);
  const [hit, setHit] = useState(false);
  const coinRef = useRef(null);

  const cap = getLimitValue(state.limitLevel);
  const energyPct = Math.min(100, (state.energy / cap) * 100);
  const clickValue = getClickValue(state.clickLevel);
  const canTap = state.energy >= clickValue;

  const onTap = useCallback((e) => {
    if (!canTap) {
      haptic('rigid');
      return;
    }
    actions.tap();
    haptic('light');

    // tıklama noktasında +N parçacığı
    const rect = coinRef.current?.getBoundingClientRect();
    let x = 50, y = 40;
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const px = touch ? touch.clientX : e.clientX;
    const py = touch ? touch.clientY : e.clientY;
    if (rect && px != null) {
      x = ((px - rect.left) / rect.width) * 100;
      y = ((py - rect.top) / rect.height) * 100;
    }
    const id = ++floatId;
    setFloats((f) => [...f, { id, x, y, val: clickValue }]);
    setTimeout(() => setFloats((f) => f.filter((it) => it.id !== id)), 900);

    setHit(true);
    setTimeout(() => setHit(false), 120);
  }, [canTap, actions, clickValue]);

  return (
    <div className="screen fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="tap-wrap">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Orbitron', fontWeight: 900, fontSize: 28,
            letterSpacing: 2, color: 'var(--text)',
          }}>
            ZEX NETWORK
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
            Tap to mine • {clickValue} / tap
            {state.boostMultiplier > 1 && (
              <span style={{ color: 'var(--neon-orange)', fontWeight: 700 }}>
                {' '}• {state.boostMultiplier}x boost
              </span>
            )}
          </div>
        </div>

        <div
          ref={coinRef}
          className={'coin' + (hit ? ' hit' : '')}
          onPointerDown={onTap}
        >
          <div className="pulse" />
          <div className="ring" />
          <div className="glyph">Z</div>
          {floats.map((f) => (
            <span
              key={f.id}
              className="float-num"
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              +{f.val}
            </span>
          ))}
        </div>

        <div className="energy">
          <div className="energy-top">
            <span className="lbl">⚡ Energy</span>
            <span className="val">{Math.floor(state.energy)} / {cap}</span>
          </div>
          <div className="energy-track">
            <div className="energy-fill" style={{ width: `${energyPct}%` }} />
          </div>
        </div>

        <div className="power-summary" style={{ width: '100%', maxWidth: 340 }}>
          <div className="power-stat">
            <div className="ps-val" style={{ color: 'var(--neon-cyan)' }}>{clickValue}</div>
            <div className="ps-lbl">Per Tap</div>
          </div>
          <div className="power-stat">
            <div className="ps-val" style={{ color: 'var(--neon-gold)' }}>{getMineValue(state.mineLevel)}/s</div>
            <div className="ps-lbl">Mining</div>
          </div>
          <div className="power-stat">
            <div className="ps-val" style={{ color: 'var(--neon-green)' }}>{cap}</div>
            <div className="ps-lbl">Energy Cap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
