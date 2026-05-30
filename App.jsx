import { useState, useEffect } from 'react';
import { GameProvider } from './GameContext.jsx';
import { ToastProvider } from './Toast.jsx';
import TopBar from './TopBar.jsx';
import NavBar from './NavBar.jsx';
import TapScreen from './TapScreen.jsx';
import BoostScreen from './BoostScreen.jsx';
import ShopScreen from './ShopScreen.jsx';
import WalletScreen from './WalletScreen.jsx';
import { initTelegram } from './telegram.js';

export default function App() {
  const [tab, setTab] = useState('tap');

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <GameProvider>
      <ToastProvider>
        <div className="app-bg" />
        <div className="stars" />
        <div className="app">
          <TopBar />
          {tab === 'tap' && <TapScreen />}
          {tab === 'boost' && <BoostScreen />}
          {tab === 'shop' && <ShopScreen />}
          {tab === 'wallet' && <WalletScreen />}
          <NavBar active={tab} onChange={setTab} />
        </div>
      </ToastProvider>
    </GameProvider>
  );
}
