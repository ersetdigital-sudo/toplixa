# Game Detail Mobile Redesign + WhatsApp Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign game detail page for mobile using wireframe structure, add WhatsApp integration with configurable phone number from admin.

**Architecture:** Adapt `orange-food-menu` wireframe layout for game detail page. CheckoutOverlay gets WhatsApp redirect instead of cosmetic success. Admin settings page for WhatsApp number storage.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (SSR), react-icons

---

## Global Constraints

- Next.js 16.3.0 — no upgrade
- TypeScript strict mode
- Tailwind CSS v4 utility classes
- Supabase for DB queries and auth
- WhatsApp URL format: `https://wa.me/{number}` (iOS/Android compatible)
- Phone number normalization: always prefix `62` for Indonesia

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/whatsapp.ts` | **Create** | WhatsApp URL builder + phone normalizer |
| `lib/db.ts` | **Modify** | Add `getWhatsAppNumber()` query |
| `app/admin/actions.ts` | **Modify** | Add `updateWhatsAppNumber()` server action |
| `app/admin/settings/page.tsx` | **Create** | Admin settings page |
| `app/admin/settings/SettingsForm.tsx` | **Create** | Client form for WhatsApp number |
| `app/admin/layout.tsx` | **Modify** | Add "Pengaturan" nav link |
| `components/checkout/CheckoutOverlay.tsx` | **Modify** | Change button text + WhatsApp redirect |
| `components/sections/GameOrderForm.tsx` | **Modify** | Mobile-first responsive layout |
| `app/top-up/[slug]/page.tsx` | **Modify** | Mobile layout adjustments |

---

### Task 1: WhatsApp Utility Functions

**Files:**
- Create: `lib/whatsapp.ts`

**Interfaces:**
- Consumes: nothing (standalone utility)
- Produces: `normalizeWhatsAppNumber(raw: string): string`, `buildWhatsAppUrl(phone: string, message: string): string`

- [ ] **Step 1: Create `lib/whatsapp.ts`**

```typescript
/**
 * Normalize Indonesian phone number to international format (62XXXXXXXXXX).
 * Handles: 08xxx, 628xxx, +62 8xxx, etc.
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return "62" + digits;
}

/**
 * Build WhatsApp URL that works on both iOS and Android.
 * Uses wa.me format which deep-links to WhatsApp app.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Build order message for WhatsApp.
 */
export function buildOrderMessage(order: {
  gameName: string;
  userId: string;
  serverId?: string;
  nominalLabel: string;
  price: number;
  orderId: string;
  total: number;
}): string {
  const lines = [
    "🎮 Topup Toplixa",
    "",
    `Game: ${order.gameName}`,
    `User ID: ${order.userId}`,
    `Server ID: ${order.serverId || "-"}`,
    `Paket: ${order.nominalLabel} - Rp ${order.price.toLocaleString("id-ID")}`,
    `Order ID: ${order.orderId}`,
    `Total: Rp ${order.total.toLocaleString("id-ID")}`,
    "",
    "Sudah melakukan pembayaran via QRIS. Mohon diproses 🙏",
  ];
  return lines.join("\n");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/whatsapp.ts
git commit -m "feat: add WhatsApp URL builder and phone normalizer"
```

---

### Task 2: Database — Add WhatsApp Number Setting

**Files:**
- Create: `supabase/migrations/003_add_whatsapp_number.sql`
- Modify: `lib/db.ts:1-50` (add query at end)

**Interfaces:**
- Consumes: existing `settings` table
- Produces: `getWhatsAppNumber(): Promise<string>` in `lib/db.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/003_add_whatsapp_number.sql
INSERT INTO settings (key, value)
VALUES ('whatsapp_number', '"6281234567890"')
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 2: Add query to `lib/db.ts`**

Append to end of file:

```typescript
export async function getWhatsAppNumber(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .single();

  if (!data?.value) return "6281234567890";
  try {
    return JSON.parse(data.value);
  } catch {
    return String(data.value).replace(/"/g, "");
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_add_whatsapp_number.sql lib/db.ts
git commit -m "feat: add whatsapp_number setting to database"
```

---

### Task 3: Admin Server Action for WhatsApp Number

**Files:**
- Modify: `app/admin/actions.ts` (add new action)

**Interfaces:**
- Consumes: `settings` table via Supabase
- Produces: `updateWhatsAppNumber(number: string): Promise<{success: boolean, error?: string}>`

- [ ] **Step 1: Add server action**

Append to `app/admin/actions.ts`:

```typescript
"use server";

export async function updateWhatsAppNumber(number: string) {
  await requireAdmin();
  const supabase = await createClient();

  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) {
    return { success: false, error: "Nomor minimal 10 digit" };
  }

  const normalized = digits.startsWith("62")
    ? digits
    : digits.startsWith("0")
    ? "62" + digits.slice(1)
    : "62" + digits;

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "whatsapp_number", value: JSON.stringify(normalized) },
      { onConflict: "key" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/actions.ts
git commit -m "feat: add updateWhatsAppNumber server action"
```

---

### Task 4: Admin Settings Page

**Files:**
- Create: `app/admin/settings/page.tsx`
- Create: `app/admin/settings/SettingsForm.tsx`
- Modify: `app/admin/layout.tsx:1-102` (add nav link)

**Interfaces:**
- Consumes: `getWhatsAppNumber()` from `lib/db.ts`, `updateWhatsAppNumber()` from `app/admin/actions.ts`
- Produces: `/admin/settings` page with WhatsApp number form

- [ ] **Step 1: Create settings page**

```tsx
// app/admin/settings/page.tsx
import { getWhatsAppNumber } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const whatsappNumber = await getWhatsAppNumber();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pengaturan</h1>
      <SettingsForm initialWhatsAppNumber={whatsappNumber} />
    </div>
  );
}
```

- [ ] **Step 2: Create settings form component**

```tsx
// app/admin/settings/SettingsForm.tsx
"use client";

import { useState } from "react";
import { updateWhatsAppNumber } from "@/app/admin/actions";
import { showToast } from "@/components/ui/Toast";

export function SettingsForm({
  initialWhatsAppNumber,
}: {
  initialWhatsAppNumber: string;
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsAppNumber);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateWhatsAppNumber(whatsappNumber);
    setSaving(false);

    if (result.success) {
      showToast("Nomor WhatsApp berhasil disimpan", "success");
    } else {
      showToast(result.error || "Gagal menyimpan", "error");
    }
  }

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-md">
      <h2 className="text-white font-semibold mb-4">WhatsApp</h2>
      <label className="block text-white/50 text-sm mb-2">
        Nomor WhatsApp (format: 628xxxxxxxxxx)
      </label>
      <input
        type="tel"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        placeholder="6281234567890"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af6a] transition mb-4"
      />
      <p className="text-white/30 text-xs mb-4">
        Nomor ini digunakan untuk menerima konfirmasi pembayaran dari customer.
      </p>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#d4af6a] text-black font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#e7cf9c] transition disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add nav link to admin layout**

In `app/admin/layout.tsx`, add to the nav array (after "Kelola QRIS"):

```tsx
{
  label: "Pengaturan",
  href: "/admin/settings",
  icon: "settings", // or use an appropriate icon
},
```

Also add the icon import if needed (e.g., `FaGear` from react-icons or use a Lucide icon).

- [ ] **Step 4: Commit**

```bash
git add app/admin/settings/ app/admin/layout.tsx
git commit -m "feat: add admin settings page for WhatsApp number"
```

---

### Task 5: CheckoutOverlay — WhatsApp Redirect

**Files:**
- Modify: `components/checkout/CheckoutOverlay.tsx:1-299` (change button + add WhatsApp logic)

**Interfaces:**
- Consumes: `buildWhatsAppUrl()`, `buildOrderMessage()` from `lib/whatsapp.ts`, `getWhatsAppNumber()` — but since CheckoutOverlay is client-only, pass whatsapp number as prop
- Produces: Updated CheckoutOverlay with WhatsApp redirect

- [ ] **Step 1: Update CheckoutOverlay props and button**

Add `whatsappNumber` prop:

```typescript
interface CheckoutOverlayProps {
  order: CheckoutOrder;
  onClose: () => void;
  whatsappNumber: string;
}
```

In the "pay" state, change "Saya Sudah Bayar" button:

```tsx
<button
  onClick={() => {
    const message = buildOrderMessage({
      gameName: order.game.name,
      userId: order.userId,
      serverId: order.serverId,
      nominalLabel: order.nominalLabel,
      price: order.price,
      orderId: order.orderId,
      total: order.total,
    });
    const url = buildWhatsAppUrl(props.whatsappNumber, message);
    window.open(url, "_blank");
    setStep("done");
  }}
  className="w-full bg-[#d4af6a] text-black font-semibold py-3 rounded-xl hover:bg-[#e7cf9c] transition"
>
  Konfirmasi Pembayaran
</button>
```

- [ ] **Step 2: Import WhatsApp utilities**

Add at top of CheckoutOverlay.tsx:

```typescript
import { buildWhatsAppUrl, buildOrderMessage } from "@/lib/whatsapp";
```

- [ ] **Step 3: Update GameOrderForm to pass whatsappNumber**

In `components/sections/GameOrderForm.tsx`, add `whatsappNumber` prop and pass it to CheckoutOverlay:

```typescript
interface GameOrderFormProps {
  game: DbGameWithNominals;
  qrisUrl: string;
  whatsappNumber: string;
}
```

When rendering CheckoutOverlay:

```tsx
<CheckoutOverlay
  order={order}
  onClose={() => setOrder(null)}
  whatsappNumber={whatsappNumber}
/>
```

- [ ] **Step 4: Update page.tsx to fetch and pass whatsappNumber**

In `app/top-up/[slug]/page.tsx`:

```typescript
import { getWhatsAppNumber } from "@/lib/db";

// Inside the component:
const whatsappNumber = await getWhatsAppNumber();

// Pass to GameOrderForm:
<GameOrderForm game={game} qrisUrl={qrisUrl} whatsappNumber={whatsappNumber} />
```

- [ ] **Step 5: Commit**

```bash
git add components/checkout/CheckoutOverlay.tsx components/sections/GameOrderForm.tsx app/top-up/\[slug\]/page.tsx
git commit -m "feat: add WhatsApp redirect on payment confirmation"
```

---

### Task 6: Mobile-First Game Detail Layout

**Files:**
- Modify: `app/top-up/[slug]/page.tsx` (mobile layout)
- Modify: `components/sections/GameOrderForm.tsx` (responsive package grid)

**Interfaces:**
- Consumes: game data, qrisUrl, whatsappNumber
- Produces: Responsive layout matching wireframe structure

- [ ] **Step 1: Update game detail page layout**

Restructure `app/top-up/[slug]/page.tsx` for mobile-first:

```tsx
// Mobile layout structure:
// 1. Header section (game icon + name + description)
// 2. Form section (User ID, Server ID)
// 3. Package grid section
// All stacked vertically on mobile, side-by-side on desktop

<div className="min-h-screen bg-[#070707]">
  {/* Mobile header - curved gold banner feel */}
  <div className="relative bg-gradient-to-b from-[#1a1508] to-[#070707] px-5 pt-6 pb-8">
    <div className="flex items-center gap-3 mb-4">
      <Link href="/" className="text-white/50 hover:text-white transition">
        ←
      </Link>
      <h1 className="text-white font-bold text-lg">{game.name}</h1>
    </div>
    {/* Game icon */}
    <div className="flex justify-center mb-4">
      <Image
        src={game.icon_url}
        alt={game.name}
        width={80}
        height={80}
        className="rounded-2xl"
      />
    </div>
    <p className="text-white/50 text-sm text-center">{game.range_label}</p>
  </div>

  {/* Benefits */}
  <div className="px-5 py-6 space-y-3">
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Proses otomatis 24 jam
    </div>
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Bayar via QRIS, E-Wallet, VA
    </div>
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Garansi uang kembali
    </div>
  </div>

  {/* Order Form - full width on mobile */}
  <div className="px-5">
    <GameOrderForm
      game={game}
      qrisUrl={qrisUrl}
      whatsappNumber={whatsappNumber}
    />
  </div>
</div>
```

- [ ] **Step 2: Update GameOrderForm package grid for mobile**

Change the nominal grid to be responsive:

```tsx
{/* Package grid - 2 cols mobile, 3 cols desktop */}
<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
  {game.pricing.map((p) => (
    <button
      key={p.id}
      type="button"
      onClick={() => setSelectedNominal(p)}
      className={`p-4 rounded-xl border text-left transition ${
        selectedNominal?.id === p.id
          ? "border-[#d4af6a] bg-[#d4af6a]/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <span className="text-white font-semibold text-sm block">
        {p.nominal_label}
      </span>
      <span className="text-[#d4af6a] text-xs font-medium">
        Rp {p.price.toLocaleString("id-ID")}
      </span>
    </button>
  ))}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/top-up/\[slug\]/page.tsx components/sections/GameOrderForm.tsx
git commit -m "feat: mobile-first game detail layout with responsive grid"
```

---

### Task 7: Final Verification & Push

**Files:** All modified files

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Manual test checklist**

- [ ] Open `/top-up/pubg-mobile` on mobile viewport (390px)
- [ ] Verify header, benefits, form, package grid display correctly
- [ ] Fill User ID + select package
- [ ] Click "Konfirmasi Pembayaran"
- [ ] Verify CheckoutOverlay opens with QRIS + timer
- [ ] Click "Konfirmasi Pembayaran" in overlay
- [ ] Verify WhatsApp opens with correct message on mobile
- [ ] Test on iOS Safari: WhatsApp opens correctly
- [ ] Test on Android Chrome: WhatsApp opens correctly
- [ ] Go to `/admin/settings`
- [ ] Change WhatsApp number, save, verify it persists
- [ ] Run new order with updated number

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: complete game detail mobile redesign + WhatsApp integration

- Mobile-first layout adapted from orange-food-menu wireframe
- WhatsApp redirect on payment confirmation (iOS/Android compatible)
- Phone number normalization (0→62 prefix)
- Admin settings page for WhatsApp number
- Responsive package grid (2-col mobile, 3-col desktop)
- Timer in CheckoutOverlay"
git push
```
