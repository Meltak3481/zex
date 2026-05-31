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
import Splash from './Splash.jsx';
import { initTelegram } from './telegram.js';
import bgImage from './bg.jpg';

export default function App() {
  const [tab, setTab] = useState('tap');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initTelegram();
  }, []);

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
          <TopBar />
          {tab === 'tap' && <TapScreen />}
          {tab === 'boost' && <BoostScreen />}
          {tab === 'shop' && <ShopScreen />}
          {tab === 'wallet' && <WalletScreen />}
          {tab === 'checkin' && <CheckinScreen />}
          <NavBar active={tab} onChange={setTab} />
        </div>
      </ToastProvider>
    </GameProvider>
  );
}
