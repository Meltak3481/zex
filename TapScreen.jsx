import { useState, useRef, useCallback } from 'react';
import { useGame } from './GameContext.jsx';
import { getClickValue, getMineValue, getLimitValue } from './economy.js';
import { haptic } from './telegram.js';
import coinImg from './coin.png';

let floatId = 0;

export default function TapScreen() {
  const { state, actions } = useGame();
  const [floats, setFloats] = useState([]);
  const [rotation, setRotation] = useState(0);
  const coinRef = useRef(null);
  const resetTimer = useRef(null);

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

    const rect = coinRef.current?.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const px = touch ? touch.clientX : e.clientX;
    const py = touch ? touch.clientY : e.clientY;

    // Flutter mantığı: dokunulan nokta merkezin sağındaysa sağa (+), solundaysa sola (-) dön
    let x = 50, y = 40;
    let dir = 1;
    if (rect && px != null) {
      const center = rect.left + rect.width / 2;
      dir = px > center ? 1 : -1;
      x = ((px - rect.left) / rect.width) * 100;
      y = ((py - rect.top) / rect.height) * 100;
    }

    // Coin dokunulan yöne döner, sonra hemen düzelir
    setRotation(dir * 18); // derece (Flutter'daki 0.2 rad ~ 11.5°, biraz belirgin yaptım)
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setRotation(0), 130);

    // +N parçacığı
    const id = ++floatId;
    setFloats((f) => [...f, { id, x, y, val: clickValue }]);
    setTimeout(() => setFloats((f) => f.filter((it) => it.id !== id)), 900);
  }, [canTap, actions, clickValue]);

  return (
    <div className="screen fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="tap-wrap">
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: 14, fontWeight: 600 }}>
            Tap to mine • {clickValue} / tap
            {state.boostMultiplier > 1 && (
              <span style={{ color: 'var(--neon-orange)', fontWeight: 700 }}>
                {' '}• {state.boostMultiplier}x boost
              </span>
            )}
          </div>
        </div>

        <div className="coin-stage">
          <div
            ref={coinRef}
            className="coin-img-wrap"
            onPointerDown={onTap}
            style={{
              transform: `perspective(800px) rotateY(${rotation}deg)`,
            }}
          >
            <div className="coin-glow" />
            <img src={coinImg} alt="ZEX Coin" className="coin-img" draggable="false" />
          </div>
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
