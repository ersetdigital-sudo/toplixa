"use client";

import { useMemo, useState } from "react";
import { formatOrderId, rupiah } from "@/lib/format";
import { CheckoutOverlay, type CheckoutOrder } from "@/components/checkout/CheckoutOverlay";
import type { DbGameWithNominals } from "@/lib/db";

interface GameOrderFormProps {
  game: DbGameWithNominals;
  qrisUrl: string;
  whatsappNumber: string;
}

export function GameOrderForm({ game, qrisUrl, whatsappNumber }: GameOrderFormProps) {
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [errors, setErrors] = useState<{ userId?: string; serverId?: string; nominal?: string }>({});
  const [touched, setTouched] = useState<{ userId: boolean; serverId: boolean }>({ userId: false, serverId: false });

  const nominals = useMemo(() => game.nominals ?? [], [game.nominals]);

  const showServerField = !game.hide_server_id;
  const serverRequired = game.server_id_required;

  const isUserIdValid = userId.trim().length > 0;
  const isServerValid = !showServerField || !serverRequired || serverId.trim().length > 0;
  const isNominalValid = pickedLabel !== null;
  const isFormValid = isUserIdValid && isServerValid && isNominalValid;

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setUserId(val);
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }));
  };

  const handleServerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setServerId(val);
    if (errors.serverId) setErrors((prev) => ({ ...prev, serverId: undefined }));
  };

  const handleBlur = (field: "userId" | "serverId") => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "userId" && !userId.trim()) {
      setErrors((prev) => ({ ...prev, userId: `${game.user_id_label} wajib diisi` }));
    }
    if (field === "serverId" && showServerField && serverRequired && !serverId.trim()) {
      setErrors((prev) => ({ ...prev, serverId: `${game.server_id_label} wajib diisi` }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { userId?: string; serverId?: string; nominal?: string } = {};

    if (!userId.trim()) {
      newErrors.userId = `${game.user_id_label} wajib diisi`;
    }
    if (showServerField && serverRequired && !serverId.trim()) {
      newErrors.serverId = `${game.server_id_label} wajib diisi`;
    }
    if (!pickedLabel) {
      newErrors.nominal = "Pilih nominal terlebih dahulu";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ userId: true, serverId: true });
      return;
    }

    const nominal = nominals.find((n) => n.nominal_label === pickedLabel) ?? nominals[0];
    if (!nominal) return;

    const uniqueCode = Math.floor(Math.random() * 400 + 100);
    setOrder({
      game: game.name,
      userId: userId.trim(),
      serverId: showServerField ? serverId.trim() : "—",
      nominalLabel: nominal.nominal_label,
      price: nominal.price,
      total: nominal.price + uniqueCode,
      orderId: formatOrderId(),
      qrisUrl,
    });
  };

  return (
    <>
      <form id="orderForm" onSubmit={handleSubmit} className="hairline rounded-3xl p-5 sm:p-6 md:p-8 bg-[#0c0c0d]/80 backdrop-blur-xl space-y-5">
        <div>
          <label htmlFor="gameSelect" className="block text-xs uppercase tracking-[.15em] text-white/40 mb-2">
            Pilih game
          </label>
          <select
            id="gameSelect"
            value={game.slug}
            disabled
            className="w-full bg-raise hairline rounded-xl px-4 py-3 text-sm outline-none opacity-70 cursor-not-allowed"
          >
            <option>{game.name}</option>
          </select>
        </div>

        <div className={showServerField ? "grid grid-cols-2 gap-4" : ""}>
          <div>
            <label htmlFor="userId" className="block text-xs uppercase tracking-[.15em] text-white/40 mb-2">
              {game.user_id_label} <span className="text-red-400">*</span>
            </label>
            <input
              id="userId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userId}
              onChange={handleUserIdChange}
              onBlur={() => handleBlur("userId")}
              placeholder={game.user_id_placeholder}
              className={`w-full bg-raise hairline rounded-xl px-4 py-3 text-sm outline-none transition ${
                errors.userId && touched.userId
                  ? "border-red-400/60 focus:border-red-400"
                  : "focus:border-gold/60"
              }`}
            />
            {errors.userId && touched.userId && (
              <p className="mt-1.5 text-xs text-red-400">{errors.userId}</p>
            )}
          </div>

          {showServerField && (
            <div>
              <label htmlFor="serverId" className="block text-xs uppercase tracking-[.15em] text-white/40 mb-2">
                {game.server_id_label} {serverRequired ? <span className="text-red-400">*</span> : <span className="text-white/25">(opsional)</span>}
              </label>
              <input
                id="serverId"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={serverId}
                onChange={handleServerIdChange}
                onBlur={() => handleBlur("serverId")}
                placeholder={game.server_id_placeholder}
                required={serverRequired}
                className={`w-full bg-raise hairline rounded-xl px-4 py-3 text-sm outline-none transition ${
                  errors.serverId && touched.serverId
                    ? "border-red-400/60 focus:border-red-400"
                    : "focus:border-gold/60"
                }`}
              />
              {errors.serverId && touched.serverId && (
                <p className="mt-1.5 text-xs text-red-400">{errors.serverId}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <span className="block text-xs uppercase tracking-[.15em] text-white/40 mb-3">
            Nominal <span className="text-red-400">*</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Pilih nominal">
            {nominals.map((nom) => {
              const active = pickedLabel === nom.nominal_label;
              return (
                <button
                  key={nom.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setPickedLabel(nom.nominal_label);
                    if (errors.nominal) setErrors((prev) => ({ ...prev, nominal: undefined }));
                  }}
                  className={`hairline rounded-xl px-3 py-3 text-sm transition min-h-[44px] ${
                    active
                      ? "border-gold/80 bg-gold/10 text-white"
                      : "text-white/75 hover:border-gold/60"
                  }`}
                >
                  {nom.nominal_label}
                  <span className="block text-[11px] text-white/40">{rupiah(nom.price)}</span>
                </button>
              );
            })}
          </div>
          {errors.nominal && (
            <p className="mt-1.5 text-xs text-red-400">{errors.nominal}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full font-semibold py-3.5 rounded-xl transition ${
            isFormValid
              ? "btn-gold"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          Lanjut ke Pembayaran
        </button>
        <p className="text-xs text-white/35 text-center">Harga final ditampilkan sebelum pembayaran.</p>
      </form>

      {order && <CheckoutOverlay order={order} onClose={() => setOrder(null)} whatsappNumber={whatsappNumber} />}
    </>
  );
}
