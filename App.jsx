import { useState, useEffect } from 'react';
import { GameProvider } from './state/GameContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import TopBar from './components/TopBar.jsx';
import NavBar from './components/NavBar.jsx';
import TapScreen from './screens/TapScreen.jsx';
import BoostScreen from './screens/BoostScreen.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import WalletScreen from './screens/WalletScreen.jsx';
import { initTelegram } from './lib/telegram.js';

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
