import { useEffect, useState } from 'react';
import logoImg from './logo.png';
import bgImage from './bg.jpg';
import { sfx } from './sound.js';

export default function Splash({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    sfx.splash();
    // 1.8 sn göster, sonra 0.5 sn fade-out
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={'splash' + (fading ? ' splash-out' : '')}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="splash-overlay" />
      <div className="splash-content">
        <img src={logoImg} alt="Zex Network" className="splash-logo" />
        <div className="splash-loader"><div className="splash-bar" /></div>
      </div>
    </div>
  );
}
