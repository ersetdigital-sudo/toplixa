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
      showToast("success", "Nomor WhatsApp berhasil disimpan");
    } else {
      showToast("error", result.error || "Gagal menyimpan");
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
