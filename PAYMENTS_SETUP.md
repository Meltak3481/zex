# Zex Network — Ödeme Kurulumu (Aşama 1: Telegram Stars)

Backend = Cloudflare Pages Functions (aynı projede `functions/` klasörü). Ayrı sunucu yok.

## Dosyalar (projeye ekle)
- `functions/` klasörünü olduğu gibi proje köküne kopyala (Cloudflare otomatik tanır).
- `telegram.js` -> mevcutun ÜZERİNE yaz (openInvoice + getInitData eklendi).
- `payments.js` -> proje köküne ekle (telegram.js yanına).
- `wrangler.toml` -> KV binding eklendi; `id`yi kendi namespace id'inle değiştir.
- `tonconnect-manifest.json` -> Aşama 2 (TON) için; şimdilik dursun.

## 1) KV namespace oluştur
Dashboard > Workers & Pages > KV > Create namespace ("ZEX_KV").
Çıkan ID'yi `wrangler.toml` içindeki `id = "..."` alanına yaz.
Ayrıca: Pages projesi > Settings > Functions > KV namespace bindings:
  Variable name: `ZEX_KV`  ->  oluşturduğun namespace.

## 2) Secret'ları ekle (Dashboard, koda YAZMA)
Pages projesi > Settings > Environment variables (Production + Preview):
- `BOT_TOKEN`       = BotFather token'ın
- `WEBHOOK_SECRET`  = rastgele uzun bir dize (sen belirle, ör. 32+ karakter)

## 3) Deploy et
Normal Cloudflare Pages deploy'un. `/api/...` uçları otomatik yayında olur:
- POST /api/stars/create-invoice
- POST /api/telegram/webhook
- POST /api/state

## 4) Telegram webhook'unu kur (bir kez)
Tarayıcıda/terminalde (BOT_TOKEN ve domain'i kendininkiyle değiştir):

  https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://zexapp.xyz/api/telegram/webhook&secret_token=<WEBHOOK_SECRET>&allowed_updates=["pre_checkout_query","message"]

Kontrol: https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo

> Not: Bot ödeme alabilmek için BotFather'da herhangi bir ek ayar gerektirmez
> (Stars/dijital ürün için provider token gerekmez).

## 5) Test
- Mini App'i Telegram'da aç. Bir egg "Stars ile al" -> fatura açılır -> ödersen
  bot sana onay mesajı atar, satın alma KV'ye yazılır.
- Oyun, açılışta `/api/state`'ten defteri çekip uygulanmamış alımları işler (Aşama 2).

## Güvenlik özeti
- Tüm uçlar `initData`yı HMAC ile doğrular (sahte kullanıcı engellenir).
- Fiyatlar sunucudaki katalogda (`functions/_lib/catalog.js`) — istemciye güvenilmez.
- Ödüller yalnızca Telegram `successful_payment` sonrası kaydedilir.
- `charge_id` ile idempotent: aynı ödeme iki kez işlenmez.

## Aşama 2 (sıradaki)
- Buton bağlantıları: ShopScreen/egg/ upgrade -> `buyWithStars(itemId)`.
- GameContext: açılışta `fetchPurchases()` -> uygulanmamış alımları yerel state'e ekle
  (uygulanan charge_id'ler localStorage'da tutulur, çift sayım olmaz).
- Upgrade Stars fiyatları + TON Connect (cüzdan bağlama/çekim) eklenecek.
