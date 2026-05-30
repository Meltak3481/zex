# Zex Network — Telegram Mini App

Tap-to-earn kripto temalı clicker oyunu. React + Vite. Cloudflare Pages'e deploy edilir, Telegram Mini App olarak çalışır.

## Geliştirme
```bash
npm install
npm run dev          # http://localhost:5173
```

## Build
```bash
npm run build        # çıktı: dist/
npm run preview      # build'i lokalde test et
```

## Cloudflare Pages ayarları
- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`

## Telegram'a bağlama (BotFather)
1. @BotFather → /newbot → token al
2. /newapp → botu seç → URL: https://zexapp.xyz
3. Mini App hazır

## Mevcut durum (Aşama 1)
- ✅ Tap-to-earn + parçacık animasyonu
- ✅ Mining (saniyelik üretim) + enerji sistemi
- ✅ Power Up (click/mine/limit yükseltme)
- ✅ Boost çarpanları (puanla satın alma)
- ✅ Wallet swap (40.000 puan = 1 ZEX)
- ✅ localStorage kalıcılık + offline kazanç
- ✅ Telegram SDK (haptik, tema, expand)

## Sonraki aşamalar
- Aşama 2: Firebase/Firestore backend + Telegram auth
- Aşama 3: Telegram Stars ödeme (para basamakları + boost para butonu)
- Aşama 4: Adsgram reklam, görev/check-in/referans, egg sistemi
