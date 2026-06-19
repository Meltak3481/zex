import { createContext, useContext, useEffect, useRef, useReducer, useCallback, useState } from 'react';
import {
  getClickValue, getMineValue, getLimitValue,
  POINTS_PER_ZEX, MIN_SWAP_POINTS, BOOST_DURATION_MS,
  DAILY_ZEX_BASE, DAILY_ZEX_PERIOD_MS, REFERRAL_REWARD,
  EGG_REWARDS, weightedRandom, parseReward, CHECKIN_REWARDS,
  DAY_MS, utcDayIndex,
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
  ownedEggs: [],            // sahip olunan yumurtalar (tip stringleri: "Free","Common"...)
  checkinDay: 0,            // 0-6 arası: sıradaki (henüz alınmamış) gün
  lastCheckin: 0,           // son check-in zamanı (ms) - bilgi amaçlı
  lastCheckinDay: -1,       // son check-in'in UTC gün numarası (-1 = hiç yapılmadı)
  lastFreeEgg: 0,           // son ücretsiz egg zamanı (ms) - bilgi amaçlı
  lastFreeEggDay: -1,       // son ücretsiz egg'in UTC gün numarası
  lastZexClaim: Date.now(), // son günlük ZEX claim zamanı (24 saatlik kilit buradan sayılır)
  zexClaimMultiplier: 1,    // mevcut ZEX periyodunun başında kilitlenen boost çarpanı
  referralUsed: false,      // arkadaş kodu girildi mi (bir kez)
  referralCount: 0,         // kaç kişi senin kodunu kullandı (backend gelince gerçek)
  kycApplied: false,        // KYC başvurusu yapıldı mı
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

// Check-in: "şu an" check-in yapılırsa hangi gün ödülü verilir?
// - Hiç yapılmadıysa veya bir gün atlandıysa -> Gün 0 (seri sıfırlanır)
// - Bugün zaten yapıldıysa veya tam ertesi günse -> mevcut checkinDay (seri devam)
function pendingCheckinDay(state, today = utcDayIndex()) {
  if (state.lastCheckinDay < 0) return 0;
  if (today === state.lastCheckinDay) return Math.min(state.checkinDay, 6);
  if (today === state.lastCheckinDay + 1) return Math.min(state.checkinDay, 6);
  return 0; // bir veya daha fazla gün atlandı -> seri kırıldı
}

function reducer(state, action) {
  switch (action.type) {
    case 'TAP': {
      const baseGain = getClickValue(state.clickLevel);
      // Enerji baz click değeri kadar düşer; puan boost ile çarpılır
      if (state.energy < baseGain) return state;
      const pointGain = baseGain * state.boostMultiplier;
      return {
        ...state,
        points: state.points + pointGain,
        lifetimePoints: state.lifetimePoints + pointGain,
        energy: Math.max(0, state.energy - baseGain),
      };
    }

    case 'TICK': {
      // Puan OTOMATİK ARTMAZ. Sadece enerji dolar (saniyede mineValue kadar).
      const cap = getLimitValue(state.limitLevel);
      const mine = getMineValue(state.mineLevel);
      let boostMultiplier = state.boostMultiplier;
      if (boostMultiplier > 1 && Date.now() > state.boostEndTime) {
        boostMultiplier = 1; // boost süresi doldu
      }
      // Enerji zaten doluysa ve boost değişmediyse gereksiz güncelleme yapma
      if (state.energy >= cap && boostMultiplier === state.boostMultiplier) {
        return state;
      }
      return {
        ...state,
        energy: Math.min(cap, state.energy + mine),
        boostMultiplier,
        lastSeen: Date.now(),
      };
    }

    case 'OFFLINE_FILL': {
      // Kapalı/arka planda geçen süre kadar ENERJİ dolar (puan DEĞİL)
      const cap = getLimitValue(state.limitLevel);
      const mine = getMineValue(state.mineLevel);
      const seconds = Math.min(action.seconds, 8 * 3600);
      const fill = Math.floor(seconds * mine);
      if (fill <= 0) return { ...state, lastSeen: Date.now() };
      return {
        ...state,
        energy: Math.min(cap, state.energy + fill),
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
        zex: state.zex + boost.bonus,   // anlık ZEX bonusu SADECE ilk alımda
        boostMultiplier: boost.multiplier,
        boostEndTime: Date.now() + BOOST_DURATION_MS,
        ownedBoosts: [...state.ownedBoosts, index],
      };
    }

    case 'RENEW_BOOST': {
      // Sahip olunan bir boost'u puanla yeniden aktif et (5 gün). Anlık bonus YOK.
      const { index, boost } = action;
      if (!state.ownedBoosts.includes(index)) return state;
      if (state.points < boost.pointCost) return state;
      return {
        ...state,
        points: state.points - boost.pointCost,
        boostMultiplier: boost.multiplier,
        boostEndTime: Date.now() + BOOST_DURATION_MS,
      };
    }

    case 'SWAP': {
      // points -> ZEX (40.000 puan = 1 ZEX). Min kontrolü reducer'da da var.
      const { pointsToConvert } = action;
      if (pointsToConvert < MIN_SWAP_POINTS) return state;
      if (pointsToConvert > state.points) return state;
      const zexGain = pointsToConvert / POINTS_PER_ZEX;
      return {
        ...state,
        points: state.points - pointsToConvert,
        zex: state.zex + zexGain,
      };
    }

    case 'OPEN_EGG': {
      const { eggType, label } = action;
      const idx = state.ownedEggs.indexOf(eggType);
      if (idx === -1) return state;
      const newEggs = [...state.ownedEggs];
      newEggs.splice(idx, 1);
      const { points, zex } = parseReward(label);
      return {
        ...state,
        ownedEggs: newEggs,
        points: state.points + points,
        zex: state.zex + zex,
        lifetimePoints: state.lifetimePoints + points,
      };
    }

    case 'CLAIM_CHECKIN': {
      // Günlük check-in: gün sınırı 00:00 UTC. Atlanan gün seriyi sıfırlar.
      const today = utcDayIndex();
      if (today <= state.lastCheckinDay) return state; // bugün zaten yapıldı
      const day = pendingCheckinDay(state, today);
      const r = CHECKIN_REWARDS[day];
      const eggs = [...state.ownedEggs];
      for (let i = 0; i < r.eggCount; i++) eggs.push(r.eggType);
      return {
        ...state,
        points: state.points + r.points,
        zex: state.zex + r.zex,
        lifetimePoints: state.lifetimePoints + r.points,
        ownedEggs: eggs,
        checkinDay: (day + 1) % 7,
        lastCheckin: Date.now(),
        lastCheckinDay: today,
      };
    }

    case 'CLAIM_FREE_EGG': {
      // Günde bir ücretsiz Free egg (gün sınırı 00:00 UTC)
      const today = utcDayIndex();
      if (today <= state.lastFreeEggDay) return state;
      return {
        ...state,
        ownedEggs: [...state.ownedEggs, 'Free'],
        lastFreeEgg: Date.now(),
        lastFreeEggDay: today,
      };
    }

    case 'BUY_EGG': {
      return {
        ...state,
        ownedEggs: [...state.ownedEggs, action.eggType],
      };
    }

    case 'CLAIM_DAILY_ZEX': {
      // Yeni model: claim'den sonra 24 saat kilit. Süre dolmadan birikme/claim yok.
      // Süre dolunca SABİT ödül (periyot başında kilitlenen çarpana göre) claim edilir.
      const ready = Date.now() - state.lastZexClaim >= DAILY_ZEX_PERIOD_MS;
      if (!ready) return state;
      const reward = DAILY_ZEX_BASE * state.zexClaimMultiplier;
      return {
        ...state,
        zex: state.zex + reward,
        lastZexClaim: Date.now(),
        // Yeni periyodun çarpanı şu anki boost'a kilitlenir (sonradan boost alıp istismar engellenir)
        zexClaimMultiplier: state.boostMultiplier,
      };
    }

    case 'SUBMIT_REFERRAL': {
      if (state.referralUsed) return state;
      return {
        ...state,
        referralUsed: true,
        points: state.points + REFERRAL_REWARD.points,
        zex: state.zex + REFERRAL_REWARD.zex,
        lifetimePoints: state.lifetimePoints + REFERRAL_REWARD.points,
      };
    }

    case 'APPLY_KYC': {
      return { ...state, kycApplied: true };
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

  // Geri sayımların canlı güncellenmesi için saniyelik "now" (game state'i kirletmez)
  const [now, setNow] = useState(Date.now());

  // Offline kazanç: açılışta kapalı kalınan süreyi hesapla
  useEffect(() => {
    const last = stateRef.current.lastSeen;
    if (last) {
      const seconds = Math.floor((Date.now() - last) / 1000);
      if (seconds > 5) dispatch({ type: 'OFFLINE_FILL', seconds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saniyelik tick (mining/enerji) + now güncelle
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Kalıcılık: state değişince throttle'lı kaydet
  useEffect(() => {
    const id = setTimeout(() => save(state), 2000);
    return () => clearTimeout(id);
  }, [state]);

  // Arka plana geçince kaydet, geri gelince offline enerji dolumu yap
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        save({ ...stateRef.current, lastSeen: Date.now() });
      } else if (document.visibilityState === 'visible') {
        const seconds = Math.floor((Date.now() - stateRef.current.lastSeen) / 1000);
        if (seconds > 5) dispatch({ type: 'OFFLINE_FILL', seconds });
        setNow(Date.now());
      }
    };
    const onPageHide = () => save({ ...stateRef.current, lastSeen: Date.now() });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  const actions = {
    tap: useCallback(() => dispatch({ type: 'TAP' }), []),
    upgrade: useCallback((stat, cost) => dispatch({ type: 'UPGRADE', stat, cost }), []),
    buyBoostWithPoints: useCallback((index, boost) => dispatch({ type: 'BUY_BOOST_POINTS', index, boost }), []),
    renewBoost: useCallback((index, boost) => dispatch({ type: 'RENEW_BOOST', index, boost }), []),
    swap: useCallback((pointsToConvert) => dispatch({ type: 'SWAP', pointsToConvert }), []),
    openEgg: useCallback((eggType) => {
      const label = weightedRandom(EGG_REWARDS[eggType]);
      dispatch({ type: 'OPEN_EGG', eggType, label });
      return label;
    }, []),
    claimCheckin: useCallback(() => dispatch({ type: 'CLAIM_CHECKIN' }), []),
    claimFreeEgg: useCallback(() => dispatch({ type: 'CLAIM_FREE_EGG' }), []),
    buyEgg: useCallback((eggType) => dispatch({ type: 'BUY_EGG', eggType }), []),
    claimDailyZex: useCallback(() => dispatch({ type: 'CLAIM_DAILY_ZEX' }), []),
    submitReferral: useCallback(() => dispatch({ type: 'SUBMIT_REFERRAL' }), []),
    applyKyc: useCallback(() => dispatch({ type: 'APPLY_KYC' }), []),
  };

  // ---- UI yardımcıları (hepsi "now" ile, gün sınırı 00:00 UTC) ----
  const today = utcDayIndex(now);
  const canCheckin = today > state.lastCheckinDay;
  const canClaimFreeEgg = today > state.lastFreeEggDay;
  const checkinPendingDay = pendingCheckinDay(state, today);

  // Günlük ZEX: 24 saat kilit, sabit ödül, birikme yok
  const zexReady = now - state.lastZexClaim >= DAILY_ZEX_PERIOD_MS;
  const zexReward = DAILY_ZEX_BASE * state.zexClaimMultiplier;
  const zexCountdown = Math.max(0, DAILY_ZEX_PERIOD_MS - (now - state.lastZexClaim));

  // Boost kalan süresi (ms). 0 ise boost yok/bitti.
  const boostRemaining = state.boostMultiplier > 1
    ? Math.max(0, state.boostEndTime - now)
    : 0;

  return (
    <GameContext.Provider value={{
      state, actions, now,
      canCheckin, canClaimFreeEgg, checkinPendingDay,
      zexReady, zexReward, zexCountdown,
      boostRemaining,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
