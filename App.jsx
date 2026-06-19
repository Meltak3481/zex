import { useState, useEffect } from 'react';
import { GameProvider } from './GameContext.jsx';
import { ToastProvider } from './Toast.jsx';
import TopBar from './TopBar.jsx';
import NavBar from './NavBar.jsx';
import TapScreen from './TapScreen.jsx';
import BoostScreen from './BoostScreen.jsx';
import ShopScreen from './ShopScreen.jsx';
import WalletScreen from './WalletScreen.jsx';
import CheckinScreen from './CheckinScreen.jsx';
import AccountScreen from './AccountScreen.jsx';
import Splash from './Splash.jsx';
import { initTelegram } from './telegram.js';
import { sfx, isSoundEnabled, setSoundEnabled } from './sound.js';
import bgImage from './bg.jpg';

export default function App() {
  const [tab, setTab] = useState('tap');
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    initTelegram();
  }, []);

  const changeTab = (t) => {
    if (t !== tab) sfx.tab();
    setTab(t);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) sfx.tab(); // açınca minik onay sesi
  };

  if (loading) return <Splash onDone={() => setLoading(false)} />;

  return (
    <GameProvider>
      <ToastProvider>
        <div
          className="app-bg"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="bg-overlay" />
        <div className="app">
          <TopBar soundOn={soundOn} onToggleSound={toggleSound} />
          {tab === 'tap' && <TapScreen />}
          {tab === 'boost' && <BoostScreen />}
          {tab === 'shop' && <ShopScreen />}
          {tab === 'wallet' && <WalletScreen />}
          {tab === 'checkin' && <CheckinScreen />}
          {tab === 'account' && <AccountScreen />}
          <NavBar active={tab} onChange={changeTab} />
        </div>
      </ToastProvider>
    </GameProvider>
  );
}
