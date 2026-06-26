# Zex Network — Güncel Tam Proje

Bu paket şu ana kadar yapılan HER ŞEYİ içerir.

## ⚠️ Önemli — Ses dosyaları (mp3) bu zip'te YOK
sound.js şu 8 dosyayı kullanır; sende mevcut, bana iletilmediği için eklenmedi:
snd_tap.mp3, snd_tab.mp3, snd_upgrade.mp3, snd_purchase.mp3,
snd_claim.mp3, snd_checkin.mp3, snd_eggcrack.mp3, snd_eggreward.mp3
Bu paketi mevcut projenin ÜZERİNE açarsan mp3'lerin korunur. Boş klasöre
açarsan bu 8 dosyayı eklemen gerekir (yoksa build hata verir).

## İçerik
1. HATA DÜZELTMELERİ (jsx/js)
   - Check-in serisi (gün atlanınca sıfırlanır)
   - Günlük sıfırlama 00:00 UTC = 03:00 TRT
   - Daily ZEX claim: 24s kilit + geri sayım + sabit ödül
   - Daily ZEX boost istismarı kapatıldı (periyot başına kilit)
   - Boost yenileme (biten boost puanla 5 gün yeniden aktif)
   - Arka plan/offline enerji dolumu
   - vite.config.js adı düzeltildi, ses düğmesi çakışması, Level göstergesi, vb.
2. SES — sound.js Web Audio API'ye geçti (tap sesi gecikmesiz)
3. GÖRSELLER — logo, coin, tüm yumurtalar saydam (siyah kutu + beyaz çerçeve kalktı)
4. ÖDEME (Aşama 1) — Telegram Stars backend'i, Cloudflare Pages Functions
   - functions/ , payments.js , telegram.js (openInvoice+getInitData)
   - wrangler.toml (KV) , tonconnect-manifest.json , PAYMENTS_SETUP.md
   - Kurulum adımları: PAYMENTS_SETUP.md

## Ödeme kurulumu (senin yapacakların)
PAYMENTS_SETUP.md'ye bak: KV namespace + BOT_TOKEN/WEBHOOK_SECRET secret'ları +
webhook kurulumu. Bunlar panel işleri (hesap/token sende).

## Aşama 2 (henüz YAPILMADI — sıradaki)
- Butonları buyWithStars'a bağlama
- Açılışta /api/state ile satın almaları yerel state'e işleme
- Upgrade Stars fiyatları + TON Connect (cüzdan/çekim)
Not: Şu an ödeme dosyaları projede DURUYOR ama UI butonları henüz bağlı değil;
yani kullanıcı akışı Aşama 2'de aktifleşecek. Mevcut oyun + düzeltmeler tam çalışır.
