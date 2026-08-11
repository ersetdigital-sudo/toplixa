# Task 4: Admin Settings Page

**Files:**
- Create: `app/admin/settings/page.tsx`
- Create: `app/admin/settings/SettingsForm.tsx`
- Modify: `app/admin/layout.tsx` (add nav link)

**Interfaces:**
- Consumes: `getWhatsAppNumber()` from `lib/db.ts`, `updateWhatsAppNumber()` from `app/admin/actions.ts`, `showToast()` from `components/ui/Toast`
- Produces: `/admin/settings` page with WhatsApp number form

## Requirements

### 1. Create settings page

Create `app/admin/settings/page.tsx`:

```tsx
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

### 2. Create settings form component

Create `app/admin/settings/SettingsForm.tsx`:

```tsx
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

### 3. Add nav link to admin layout

In `app/admin/layout.tsx`, find the navigation array and add a new entry after "Kelola QRIS":

```tsx
{
  label: "Pengaturan",
  href: "/admin/settings",
  icon: "settings",
},
```

Also add the icon import if needed. Check what icon library is being used in the existing nav items and use a consistent icon (e.g., `FaGear` from react-icons or a Lucide icon like `Settings`).

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: add admin settings page for WhatsApp number`
