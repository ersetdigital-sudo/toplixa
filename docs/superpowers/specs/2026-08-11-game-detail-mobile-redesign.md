# Game Detail Mobile Redesign + WhatsApp Integration

**Date:** 2026-08-11
**Status:** Approved
**Wireframe Reference:** orange-food-menu (needmcp)

---

## 1. Overview

Redesign halaman detail game untuk mobile menggunakan struktur dari wireframe `orange-food-menu`, tambah countdown timer di CheckoutOverlay, ubah tombol "Bayar Sekarang" menjadi "Konfirmasi Pembayaran" yang mengarah ke WhatsApp, dan buat nomor WhatsApp bisa di-setting dari admin panel.

---

## 2. Changes Summary

### 2.1 Game Detail Page Mobile Layout

Adaptasi wireframe `orange-food-menu` → Toplixa game detail:

| Wireframe Element | Toplixa Adaptation |
|---|---|
| Orange curved header banner | Gold curved header dengan game icon |
| Back button + Search bar | Back button + nama game |
| Category circles (scroll) | Dihapus (game sudah spesifik) |
| Food item cards (vertical list) | Package cards (grid 2 kolom mobile, 3 kolom desktop) |
| Bottom navigation bar | Sticky bottom bar: Timer + "Konfirmasi Pembayaran" |

**Mobile-first structure:**
```
┌─────────────────────────┐
│  ← Back    [Game Name]  │  ← Gold curved header
├─────────────────────────┤
│  [Game Icon]            │
│  Deskripsi game         │
│  ✓ Proses 24 jam        │
│  ✓ Bayar via QRIS       │
│  ✓ Uang kembali         │
├─────────────────────────┤
│  User ID: [________]    │
│  Server ID: [_____]     │  ← (jika diperlukan)
├─────────────────────────┤
│  ┌──────┐  ┌──────┐    │
│  │60 UC │  │300 UC│    │  ← Package cards
│  │Rp15k │  │Rp65k │    │     (grid 2 kolom)
│  └──────┘  └──────┘    │
│  ┌──────┐  ┌──────┐    │
│  │...   │  │...   │    │
│  └──────┘  └──────┘    │
├─────────────────────────┤
│ ⏱ 04:52  [Konfirmasi]  │  ← Sticky bottom
└─────────────────────────┘
```

### 2.2 CheckoutOverlay Updates

- Timer tetap di CheckoutOverlay (popup), bukan di halaman langsung
- Tombol "Saya Sudah Bayar" → **"Konfirmasi Pembayaran"**
- Setelah klik → buka WhatsApp dengan pesan otomatis berisi data lengkap order

### 2.3 WhatsApp Integration

**Message format:**
```
🎮 Topup Toplixa

Game: {game_name}
User ID: {user_id}
Server ID: {server_id}
Paket: {nominal_label} - Rp {price}
Order ID: {order_id}
Total: Rp {total}

Sudah melakukan pembayaran via QRIS. Mohon diproses 🙏
```

**URL format (iOS & Android compatible):**
```
https://wa.me/{phone_number}?text={encoded_message}
```

**iOS fix:** Phone number harus format internasional tanpa `+`, spasi, atau strip:
- `081234567890` → `6281234567890`
- `+62 812-3456-7890` → `6281234567890`
- Selalu pastikan prefix `62` (Indonesia country code)

### 2.4 Admin Settings

**Database change:**
- Tambah key `whatsapp_number` di table `settings`
- Value format: `"6281234567890"` (JSON string)

**Admin page:**
- Buat `/admin/settings` page baru
- Form sederhana: input nomor WhatsApp + tombol simpan
- Validasi: harus angka, minimal 10 digit, harus diawali `62`

**Admin nav update:**
- Tambah "Pengaturan" link di sidebar admin

---

## 3. Files to Modify

| File | Change |
|---|---|
| `app/top-up/[slug]/page.tsx` | Update layout untuk mobile-first |
| `components/sections/GameOrderForm.tsx` | Responsive package grid, sticky bottom |
| `components/checkout/CheckoutOverlay.tsx` | Ganti tombol, tambah WhatsApp redirect |
| `components/admin/settings/page.tsx` | **NEW** — Admin settings page |
| `components/admin/layout.tsx` | Tambah nav "Pengaturan" |
| `lib/db.ts` | Tambah `getWhatsAppNumber()` query |
| `app/admin/actions.ts` | Tambah `updateWhatsAppNumber()` server action |
| `supabase/migrations/` | Migration tambah `whatsapp_number` ke settings |

---

## 4. WhatsApp Number Normalization

Function `normalizeWhatsAppNumber(raw: string): string`:
1. Hapus semua karakter non-angka
2. Jika diawali `0` → ganti dengan `62`
3. Jika diawali `62` → biarkan
4. Jika tidak diawali `62` → tambah `62` di depan
5. Return string bersih

```typescript
function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return "62" + digits;
}
```

---

## 5. Success Criteria

- [ ] Game detail page responsive di mobile (390px) dan desktop
- [ ] Package cards grid: 2 kolom mobile, 3 kolom desktop
- [ ] Timer 5 menit berfungsi di CheckoutOverlay
- [ ] Tombol "Konfirmasi Pembayaran" buka WhatsApp
- [ ] WhatsApp message berisi data lengkap order
- [ ] iOS dan Android bisa buka WhatsApp tanpa error
- [ ] Nomor WhatsApp bisa di-setting dari admin `/admin/settings`
- [ ] Admin nav ada link "Pengaturan"
- [ ] Build tanpa error
