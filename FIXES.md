# Zex Network — Düzeltme Notları

Bu paket, test sürecinde tespit edilen sorunların düzeltilmiş halidir.

## ⚠️ ÖNEMLİ — Ses dosyaları bu zip'te YOK
sound.js şu 8 dosyayı kullanır (sende mevcut, bana iletilmediği için zip'e eklenmedi):
snd_tap.mp3, snd_tab.mp3, snd_upgrade.mp3, snd_purchase.mp3,
snd_claim.mp3, snd_checkin.mp3, snd_eggcrack.mp3, snd_eggreward.mp3
Bu zip'i kendi proje klasörünün ÜZERİNE açarsan mevcut mp3'lerin korunur.
Boş klasöre açarsan bu 8 dosyayı klasöre eklemen gerekir.

## ⚠️ Eski config dosyası
Projende `vite_config.js` (alt çizgili) varsa SİL. Doğrusu: `vite.config.js`.

## Yapılan düzeltmeler
1. vite.config.js — dosya adı düzeltildi (Vite artık config'i tanır).
2. Check-in serisi — bir gün atlanırsa seri Gün 1'e sıfırlanır.
3. Günlük sıfırlama — 00:00 UTC (= 03:00 TRT) gün sınırına sabitlendi
   (check-in + günlük ücretsiz egg).
4. Daily ZEX claim — yeniden tasarlandı: claim sonrası 24 saat kilit,
   süre dolana kadar birikme yok, geri sayım gösterilir, süre dolunca
   sabit ödül claim edilir.
5. Daily ZEX boost istismarı — ödül artık periyot başındaki çarpana
   kilitlenir (claim anında boost alıp tüm güne uygulama engellendi).
6. Boost yenileme — süresi biten boost, puanla 5 gün yeniden aktif
   edilebilir (anlık ZEX bonusu tekrar verilmez).
7. Arka plan/offline enerji — uygulamaya geri dönünce enerji dolumu yapılır.
8. Ses düğmesi — ZEX rozetiyle çakışması giderildi, üst çubuğa taşındı.
9. BoostScreen — "Level 0" yerine doğru seviye gösterimi (Level 1..13).
10. Küçük temizlikler — kullanılmayan sabit kaldırıldı, swap min kontrolü
    reducer'a da eklendi.

## Bilinçli BIRAKILANLAR (senin onayını bekliyor)
- Yükseltme 3. seviyede "Stars (yakında)" geçidiyle kilitli kalıyor.
  Bu senin gelir/monetizasyon tasarımın olduğu için dokunmadım.
  Test için bu kilitleri geçici açmamı istersen söyle.
- NavBar etiketleri (Power / Boost) aynı bırakıldı.
