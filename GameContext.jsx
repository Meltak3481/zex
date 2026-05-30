import { createContext, useContext, useEffect, useRef, useReducer, useCallback } from 'react';
import {
  getClickValue, getMineValue, getLimitValue, ENERGY_RECHARGE_PER_SEC,
  POINTS_PER_ZEX, BOOST_DURATION_MS,
} from './economy.js';

const STORAGE_KEY = 'zex_game_state_v1';

const initialState = {
  points: 0,
  zex: 0,
  energy: 1000,
  clickLevel: 1,
  mineLevel: 1,
  limitLevel: 1,
  boostMultiplier: 1,
  boostEndTime: 0,
  ownedBoosts: [],          // satın alınan boost index'leri
  lastSeen: Date.now(),     // offline mining hesabı için
  lifetimePoints: 0,        // istatistik
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState };
    const saved = JSON.parse(raw);
    return { ...initialState, ...saved };
  } catch {
    return { ...initialState };
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'TAP': {
      const gain = getClickValue(state.clickLevel);
      if (state.energy < gain) return state; // enerji yetmiyorsa tap boşa gitmesin
      return {
        ...state,
        points: state.points + gain,
        lifetimePoints: state.lifetimePoints + gain,
        energy: Math.max(0, state.energy - gain),
      };
    }

    case 'TICK': {
      // Saniyelik: mining üretimi + enerji yenilenme + boost süresi kontrolü
      const cap = getLimitValue(state.limitLevel);
      const mine = getMineValue(state.mineLevel);
      let boostMultiplier = state.boostMultiplier;
      if (boostMultiplier > 1 && Date.now() > state.boostEndTime) {
        boostMultiplier = 1; // boost süresi doldu (Flutter checkBoostExpiry karşılığı)
      }
      const produced = mine; // mining puanı (boost ZEX'e etki eder, puana değil — Flutter mantığı)
      return {
        ...state,
        points: state.points + produced,
        lifetimePoints: state.lifetimePoints + produced,
        energy: Math.min(cap, state.energy + ENERGY_RECHARGE_PER_SEC),
        boostMultiplier,
        lastSeen: Date.now(),
      };
    }

    case 'OFFLINE_EARN': {
      // Uygulama kapalıyken geçen süre için mining (max 8 saat cap)
      const seconds = Math.min(action.seconds, 8 * 3600);
      const mine = getMineValue(state.mineLevel);
      const earned = Math.floor(seconds * mine);
      if (earned <= 0) return state;
      return {
        ...state,
        points: state.points + earned,
        lifetimePoints: state.lifetimePoints + earned,
        lastSeen: Date.now(),
      };
    }

    case 'UPGRADE': {
      const { stat, cost } = action;
      if (state.points < cost) return state;
      const key = stat + 'Level';
      return { ...state, points: state.points - cost, [key]: state[key] + 1 };
    }

    case 'BUY_BOOST_POINTS': {
      const { index, boost } = action;
      if (state.points < boost.pointCost) return state;
      if (state.ownedBoosts.includes(index)) return state;
      return {
        ...state,
        points: state.points - boost.pointCost,
        zex: state.zex + boost.bonus,
        boostMultiplier: boost.multiplier,
        boostEndTime: Date.now() + BOOST_DURATION_MS,
        ownedBoosts: [...state.ownedBoosts, index],
      };
    }

    case 'SWAP': {
      // points -> ZEX (40.000 puan = 1 ZEX)
      const { pointsToConvert } = action;
      if (pointsToConvert > state.points) return state;
      const zexGain = pointsToConvert / POINTS_PER_ZEX;
      return {
        ...state,
        points: state.points - pointsToConvert,
        zex: state.zex + zexGain,
      };
    }

    case 'HYDRATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Offline kazanç: açılışta kapalı kalınan süreyi hesapla
  useEffect(() => {
    const last = stateRef.current.lastSeen;
    if (last) {
      const seconds = Math.floor((Date.now() - last) / 1000);
      if (seconds > 5) dispatch({ type: 'OFFLINE_EARN', seconds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saniyelik tick (mining + enerji)
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  // Kalıcılık: state değişince throttle'lı kaydet (her 2 sn'de bir)
  useEffect(() => {
    const id = setTimeout(() => save(state), 2000);
    return () => clearTimeout(id);
  }, [state]);

  // Sekme kapanırken son durumu kaydet
  useEffect(() => {
    const handler = () => save({ ...stateRef.current, lastSeen: Date.now() });
    window.addEventListener('visibilitychange', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('visibilitychange', handler);
      window.removeEventListener('pagehide', handler);
    };
  }, []);

  const actions = {
    tap: useCallback(() => dispatch({ type: 'TAP' }), []),
    upgrade: useCallback((stat, cost) => dispatch({ type: 'UPGRADE', stat, cost }), []),
    buyBoostWithPoints: useCallback((index, boost) => dispatch({ type: 'BUY_BOOST_POINTS', index, boost }), []),
    swap: useCallback((pointsToConvert) => dispatch({ type: 'SWAP', pointsToConvert }), []),
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
